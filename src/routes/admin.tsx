import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ArrowLeft, CheckCircle2, XCircle, Clock, Users, ShoppingCart, Mail, Link2, MousePointerClick, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { deleteMemberServer } from "@/lib/payment-server-fns";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Quản trị — Thịnh Vua App" }] }),
  component: AdminPage,
});

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  vip_code: string | null;
  vip_status: "pending" | "approved" | "rejected";
  vip_expires_at: string | null;
  created_at: string;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  product_number: number;
  product_title: string;
  product_code: string;
  amount: string;
  status: "pending" | "confirmed" | "cancelled";
  affiliate_id: string | null;
  commission_amount: number;
  commission_status: string;
  created_at: string;
};

type AffiliateInfo = {
  id: string;
  user_id: string;
  ref_code: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  commission_rate: number;
  status: string;
  created_at: string;
  total_clicks: number;
  total_orders: number;
  total_commission: number;
};

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"members" | "orders" | "affiliates">("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("pending");
  const [affiliateUserIds, setAffiliateUserIds] = useState<Set<string>>(new Set());
  const [affiliateBankMap, setAffiliateBankMap] = useState<Map<string, { bank_name?: string; bank_account?: string; bank_owner?: string }>>(new Map());

  const loadMembers = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setMembers((data ?? []) as Member[]);
  };

  const loadOrders = async () => {
    const { data, error } = await (supabase as any).from("affiliate_orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setOrders((data ?? []) as Order[]);
  };

  const loadAffiliates = async () => {
    const { data: affs, error } = await (supabase as any).from("affiliates").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    const enriched: AffiliateInfo[] = [];
    for (const a of (affs ?? [])) {
      const [{ count: clickCount }, { data: affOrders }] = await Promise.all([
        (supabase as any).from("affiliate_clicks").select("*", { count: "exact", head: true }).eq("affiliate_id", a.id),
        (supabase as any).from("affiliate_orders").select("commission_amount, status").eq("affiliate_id", a.id),
      ]);
      const confirmedOrders = (affOrders ?? []).filter((o: any) => o.status === "confirmed");
      enriched.push({
        ...a,
        total_clicks: clickCount || 0,
        total_orders: confirmedOrders.length,
        total_commission: confirmedOrders.reduce((s: number, o: any) => s + (o.commission_amount || 0), 0),
      });
    }
    setAffiliates(enriched);
    setAffiliateUserIds(new Set((affs ?? []).map((a: any) => a.user_id)));
    const bankMap = new Map<string, { bank_name?: string; bank_account?: string; bank_owner?: string }>();
    for (const a of (affs ?? [])) {
      if (a.user_id) bankMap.set(a.user_id, { bank_name: a.bank_name, bank_account: a.bank_account, bank_owner: a.bank_owner });
    }
    setAffiliateBankMap(bankMap);
  };

  useEffect(() => {
    (async () => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) { navigate({ to: "/auth" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
      if (!roles?.some((r) => r.role === "admin")) {
        toast.error("Ban khong co quyen truy cap");
        navigate({ to: "/dashboard" });
        return;
      }
      await Promise.all([loadMembers(), loadOrders(), loadAffiliates()]);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (m: Member, newStatus: "approved" | "rejected") => {
    const expires = newStatus === "approved" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;
    const { error } = await supabase.from("profiles").update({ vip_status: newStatus, vip_expires_at: expires }).eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    if (newStatus === "approved") {
      await supabase.from("user_roles").insert({ user_id: m.id, role: "vip" });
    } else {
      await supabase.from("user_roles").delete().eq("user_id", m.id).eq("role", "vip");
    }
    toast.success(newStatus === "approved" ? "Đã duyệt VIP" : "Đã từ chối");
    void loadMembers();
  };

  const approveMember = async (m: Member) => {
    const name = m.full_name || m.email.split("@")[0] || "affiliate";
    const code = name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "").slice(0, 20) || "affiliate";
    let finalCode = code;
    const { data: existing } = await (supabase as any).from("affiliates").select("id").eq("ref_code", code).maybeSingle();
    if (existing) finalCode = code + Math.floor(Math.random() * 9000 + 1000);

    const { error } = await (supabase as any).from("affiliates").insert({
      user_id: m.id,
      ref_code: finalCode,
      full_name: m.full_name || "",
      email: m.email,
      phone: m.phone || "",
      commission_rate: 35,
      status: "active",
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`Đã duyệt ${m.full_name || m.email} thành Affiliate!`);
    void loadAffiliates();
  };

  const deleteMember = async (m: Member) => {
    if (!confirm(`Xoá thành viên ${m.full_name || m.email}? Tất cả dữ liệu sẽ bị xoá vĩnh viễn.`)) return;
    const result = await deleteMemberServer({ data: { userId: m.id } });
    if (!result.ok) { toast.error("Xoá thất bại"); return; }
    toast.success("Đã xoá thành viên và toàn bộ dữ liệu");
    void loadMembers();
    void loadAffiliates();
  };

  const updateOrderStatus = async (o: Order, newStatus: "confirmed" | "cancelled") => {
    const { error } = await supabase.from("affiliate_orders").update({ status: newStatus }).eq("id", o.id);
    if (error) { toast.error(error.message); return; }
    toast.success(newStatus === "confirmed" ? "Đã xác nhận đơn hàng" : "Đã hủy đơn hàng");
    void loadOrders();
  };

  const filtered = members.filter((m) => filter === "all" || m.vip_status === filter);
  const filteredOrders = orders.filter((o) => orderFilter === "all" || o.status === orderFilter);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.01_60)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
          <span className="inline-flex items-center gap-2 font-bold"><Shield className="w-5 h-5 text-primary" /> Quản trị viên</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("members")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition ${tab === "members" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <Users className="w-4 h-4" /> Thành viên ({members.length})
          </button>
          <button onClick={() => setTab("orders")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition relative ${tab === "orders" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <ShoppingCart className="w-4 h-4" /> Don hang ({orders.length})
            {pendingOrders > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">{pendingOrders}</span>}
          </button>
          <button onClick={() => setTab("affiliates")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition ${tab === "affiliates" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <Link2 className="w-4 h-4" /> Affiliates ({affiliates.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-10">Đang tải...</div>
        ) : tab === "members" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h1 className="text-2xl font-black">Danh sách thành viên</h1>
            </div>
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 bg-background border border-border rounded-xl">Không có thành viên</div>
            ) : (
              <div className="overflow-x-auto bg-background border border-border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-4 py-3">Họ tên</th>
                      <th className="px-4 py-3">Gmail</th>
                      <th className="px-4 py-3">SĐT</th>
                      <th className="px-4 py-3">STK ngân hàng</th>
                      <th className="px-4 py-3">Đăng ký</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold">{m.full_name || "—"}</td>
                        <td className="px-4 py-3">{m.email}</td>
                        <td className="px-4 py-3 font-mono">{m.phone || "—"}</td>
                        <td className="px-4 py-3 text-xs">
                          {affiliateBankMap.get(m.id)?.bank_account ? (
                            <div>
                              <div className="font-bold">{affiliateBankMap.get(m.id)?.bank_account}</div>
                              <div className="text-muted-foreground">{affiliateBankMap.get(m.id)?.bank_owner || "—"}</div>
                              <div className="text-muted-foreground">{affiliateBankMap.get(m.id)?.bank_name || "—"}</div>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString("vi-VN")}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {!affiliateUserIds.has(m.id) ? (
                              <button onClick={() => approveMember(m)} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">Duyệt</button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />Affiliate</span>
                            )}
                            <button onClick={() => deleteMember(m)} className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90">Xoá</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : tab === "orders" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h1 className="text-2xl font-black">Don hang</h1>
              <div className="flex gap-1 bg-muted p-1 rounded-lg text-sm">
                {(["pending", "confirmed", "cancelled", "all"] as const).map((f) => (
                  <button key={f} onClick={() => setOrderFilter(f)} className={`px-3 py-1.5 rounded-md font-semibold ${orderFilter === f ? "bg-background shadow" : "text-muted-foreground"}`}>
                    {f === "pending" ? "Chờ xác nhận" : f === "confirmed" ? "Đã xác nhận" : f === "cancelled" ? "Đã hủy" : "Tất cả"}
                  </button>
                ))}
              </div>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 bg-background border border-border rounded-xl">Không có đơn hàng</div>
            ) : (
              <div className="overflow-x-auto bg-background border border-border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3">Giá</th>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3">SĐT</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{o.product_code}</td>
                        <td className="px-4 py-3 font-semibold max-w-[200px] truncate">{o.product_title}</td>
                        <td className="px-4 py-3 font-bold text-destructive">{o.amount}</td>
                        <td className="px-4 py-3 font-semibold">{o.customer_name}</td>
                        <td className="px-4 py-3 font-mono">{o.customer_phone}</td>
                        <td className="px-4 py-3">{o.customer_email}</td>
                        <td className="px-4 py-3">
                          {o.status === "confirmed" && <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4" />Xác nhận</span>}
                          {o.status === "pending" && <span className="inline-flex items-center gap-1 text-amber-600 font-semibold"><Clock className="w-4 h-4" />Chờ</span>}
                          {o.status === "cancelled" && <span className="inline-flex items-center gap-1 text-destructive font-semibold"><XCircle className="w-4 h-4" />Hủy</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            {o.status === "pending" && (
                              <>
                                <button onClick={() => updateOrderStatus(o, "confirmed")} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1"><Mail className="w-3 h-3" /> Xác nhận + Gửi email</button>
                                <button onClick={() => updateOrderStatus(o, "cancelled")} className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90">Hủy</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h1 className="text-2xl font-black">Quan ly Affiliates</h1>
            </div>
            {affiliates.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 bg-background border border-border rounded-xl">Chua co affiliate nao</div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Tong Affiliates</div>
                    <div className="mt-2 text-2xl font-black">{affiliates.length}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Tong Clicks</div>
                    <div className="mt-2 text-2xl font-black">{affiliates.reduce((s, a) => s + a.total_clicks, 0)}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Tong Hoa hong</div>
                    <div className="mt-2 text-2xl font-black text-destructive">{affiliates.reduce((s, a) => s + a.total_commission, 0).toLocaleString("vi-VN")}d</div>
                  </div>
                </div>
                <div className="overflow-x-auto bg-background border border-border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left">
                        <th className="px-4 py-3">Ho ten</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">SDT</th>
                        <th className="px-4 py-3">Mã ref</th>
                        <th className="px-4 py-3">Link affiliate</th>
                        <th className="px-4 py-3">% Hoa hồng</th>
                        <th className="px-4 py-3">Clicks</th>
                        <th className="px-4 py-3">Đơn hàng</th>
                        <th className="px-4 py-3">Tổng hoa hồng</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Ngày ĐK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((a) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="px-4 py-3 font-semibold">{a.full_name || "—"}</td>
                          <td className="px-4 py-3">{a.email}</td>
                          <td className="px-4 py-3 font-mono">{a.phone || "—"}</td>
                          <td className="px-4 py-3 font-mono text-primary font-semibold">{a.ref_code}</td>
                          <td className="px-4 py-3 text-xs font-mono text-muted-foreground max-w-[200px] truncate">{window.location.origin}/?ref={a.ref_code}</td>
                          <td className="px-4 py-3 font-bold text-primary">{a.commission_rate}%</td>
                          <td className="px-4 py-3 font-bold">{a.total_clicks}</td>
                          <td className="px-4 py-3 font-bold">{a.total_orders}</td>
                          <td className="px-4 py-3 font-bold text-destructive">{a.total_commission.toLocaleString("vi-VN")}đ</td>
                          <td className="px-4 py-3">
                            {a.status === "active" && <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4" />Active</span>}
                            {a.status === "inactive" && <span className="inline-flex items-center gap-1 text-destructive font-semibold"><XCircle className="w-4 h-4" />Inactive</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(a.created_at).toLocaleDateString("vi-VN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
