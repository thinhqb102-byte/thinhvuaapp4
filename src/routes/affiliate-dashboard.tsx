import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, Copy, MousePointerClick, ShoppingCart, Clock, DollarSign,
  CheckCircle2, BarChart3, Link2, Package, ArrowLeft, Shield, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { uploadAvatarServer, getLeaderboardServer } from "@/lib/payment-server-fns";

export const Route = createFileRoute("/affiliate-dashboard")({
  head: () => ({ meta: [{ title: "Affiliate Dashboard — Thinh Vua App" }] }),
  component: AffiliateDashboard,
});

type Affiliate = {
  id: string;
  user_id: string;
  ref_code: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  commission_rate: number;
  status: string;
  created_at: string;
  avatar_url?: string | null;
  display_name?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  bank_owner?: string | null;
};

type Click = {
  id: string;
  product_key: string;
  created_at: string;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  product_title: string;
  amount: string;
  status: string;
  commission_amount: number;
  commission_status: string;
  commission_approved_at: string | null;
  created_at: string;
};

const PRODUCTS = [
  { key: "kolaisystem", name: "KOL AI SYSTEM", price: 2700000, url: "kolaisystem.com" },
  { key: "matmatudo", name: "Mat Ma Tu Do", price: 686000, url: "phongmenlyai.com" },
];

const GUARANTEE_DAYS = 15;

function AffiliateDashboard() {
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "honor" | "partners" | "payment">("overview");
  const [leaderboard, setLeaderboard] = useState<{ affiliate_id: string; full_name: string; ref_code: string; total_clicks: number; total_orders: number; display_name?: string | null; avatar_url?: string | null }[]>([]);
  const [chartRange, setChartRange] = useState<7 | 28 | 60 | 90>(7);
  const [editRefCode, setEditRefCode] = useState("");
  const [editingRef, setEditingRef] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankOwner, setBankOwner] = useState("");
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const avatarFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) { navigate({ to: "/affiliate" }); return; }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
    if (roles?.some((r) => r.role === "admin")) setIsAdmin(true);

    const { data: aff, error: affErr } = await (supabase as any)
      .from("affiliates")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (affErr || !aff) {
      setLoading(false);
      return;
    }
    setAffiliate(aff as Affiliate);
    setEditRefCode(aff.ref_code);
    setDisplayName(aff.display_name || aff.full_name || "");
    setAvatarPreview(aff.avatar_url || null);
    setBankName(aff.bank_name || "");
    setBankAccount(aff.bank_account || "");
    setBankOwner(aff.bank_owner || "");

    const [{ data: clicksData }, { data: ordersData }] = await Promise.all([
      (supabase as any).from("affiliate_clicks").select("*").eq("affiliate_id", aff.id).order("created_at", { ascending: false }),
      (supabase as any).from("affiliate_orders").select("*").eq("affiliate_id", aff.id).order("created_at", { ascending: false }),
    ]);

    setClicks((clicksData ?? []) as Click[]);
    setOrders((ordersData ?? []) as Order[]);
    setLoading(false);
  };

  const loadLeaderboard = async () => {
    const data = await getLeaderboardServer();
    if (data && data.length > 0) setLeaderboard(data);
  };

  useEffect(() => { void load(); void loadLeaderboard(); }, []);

  const stats = useMemo(() => {
    const totalClicks = clicks.length;
    const successOrders = orders.filter((o) => o.status === "confirmed").length;
    const pendingCommission = orders
      .filter((o) => o.status === "confirmed" && o.commission_status === "pending")
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0);
    const paidCommission = orders
      .filter((o) => o.commission_status === "paid" || o.commission_status === "approved")
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0);
    return { totalClicks, successOrders, pendingCommission, paidCommission };
  }, [clicks, orders]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days: { date: string; clicks: number }[] = [];
    for (let i = chartRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayClicks = clicks.filter((c) => c.created_at.startsWith(dateStr)).length;
      days.push({ date: `${d.getDate()}/${d.getMonth() + 1}`, clicks: dayClicks });
    }
    return days;
  }, [clicks, chartRange]);

  const maxClicks = Math.max(...chartData.map((d) => d.clicks), 1);

  const productStats = useMemo(() => {
    return PRODUCTS.map((p) => {
      const pClicks = clicks.filter((c) => c.product_key === p.key).length;
      const pOrders = orders.filter((o) => o.product_title?.toLowerCase().includes(p.name.toLowerCase().slice(0, 5)));
      const successCount = pOrders.filter((o) => o.status === "confirmed").length;
      const commission = pOrders.reduce((sum, o) => sum + (o.commission_amount || 0), 0);
      return { ...p, clicks: pClicks, orders: successCount, commission };
    });
  }, [clicks, orders]);

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Da copy link!");
  };

  const updateRefCode = async () => {
    if (!affiliate || !editRefCode.trim()) return;
    const code = editRefCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!code) { toast.error("Ma khong hop le"); return; }

    const { data: existing } = await (supabase as any).from("affiliates").select("id").eq("ref_code", code).neq("id", affiliate.id).maybeSingle();
    if (existing) { toast.error("Ma nay da ton tai"); return; }

    const { error } = await (supabase as any).from("affiliates").update({ ref_code: code }).eq("id", affiliate.id);
    if (error) { toast.error(error.message); return; }
    setAffiliate({ ...affiliate, ref_code: code });
    setEditingRef(false);
    toast.success("Da cap nhat ma gioi thieu!");
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ảnh tối đa 2MB"); return; }
    avatarFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!affiliate) return;
    setSavingProfile(true);
    try {
      let avatarBase64: string | undefined;
      let avatarExt: string | undefined;

      if (avatarFileRef.current) {
        avatarExt = avatarFileRef.current.name.split(".").pop() || "jpg";
        const b64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(avatarFileRef.current!);
        });
        avatarBase64 = b64;
        avatarFileRef.current = null;
      }

      const result = await uploadAvatarServer({
        data: {
          affiliateId: affiliate.id,
          displayName: displayName.trim() || affiliate.full_name || "",
          avatarBase64,
          avatarExt,
        },
      });

      if (!result.ok) { toast.error(result.error || "Lỗi lưu hồ sơ"); setSavingProfile(false); return; }

      const newAvatarUrl = result.avatarUrl || affiliate.avatar_url || null;
      setAffiliate({ ...affiliate, display_name: displayName.trim(), avatar_url: newAvatarUrl });
      if (newAvatarUrl) setAvatarPreview(newAvatarUrl);
      toast.success("Đã lưu hồ sơ!");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
    setSavingProfile(false);
  };

  const saveBank = async () => {
    if (!affiliate) return;
    setSavingBank(true);
    const { error } = await (supabase as any).from("affiliates").update({
      bank_name: bankName.trim(),
      bank_account: bankAccount.trim(),
      bank_owner: bankOwner.trim(),
    }).eq("id", affiliate.id);
    if (error) { toast.error(error.message); } else {
      setAffiliate({ ...affiliate, bank_name: bankName.trim(), bank_account: bankAccount.trim(), bank_owner: bankOwner.trim() });
      setEditingBank(false);
      toast.success("Đã lưu tài khoản ngân hàng!");
    }
    setSavingBank(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">Đang tải...</div>;
  if (!affiliate) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 grid place-items-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-black mb-3">Kích hoạt Affiliate</h1>
        <p className="text-muted-foreground mb-6">Mua ít nhất 1 sản phẩm Thịnh Vua App để kích hoạt lấy link affiliate kiếm tiền</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition">Trang chủ</Link>
          <Link to="/truy-cap-app" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition">Mua sản phẩm ngay</Link>
        </div>
      </div>
    </div>
  );

  const formatMoney = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
            </Link>
            <Link to="/" className="font-bold text-base sm:text-lg">
              THỊNH <span className="text-primary">VUA APP</span>
              <span className="ml-2 text-sm font-normal text-primary/60">AFFILIATE</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm">
                {(affiliate.full_name || affiliate.email).charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold leading-tight">{affiliate.full_name || affiliate.email}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">Affiliate</div>
              </div>
            </div>
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-4 py-2 text-sm font-bold hover:bg-amber-400 transition">
                <Shield className="w-4 h-4" /> Quản trị
              </Link>
            )}
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Dashboard của tôi</h1>
            <p className="text-sm text-muted-foreground">Hoa hồng {affiliate.commission_rate}% | {affiliate.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-full max-w-2xl mx-auto">
          {([
            { key: "overview" as const, label: "📊 Tổng quan" },
            { key: "honor" as const, label: "🏆 Vinh danh" },
            { key: "partners" as const, label: "🤝 Đối tác liên kết" },
            { key: "payment" as const, label: "💰 Thanh toán" },
          ]).map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Tổng Clicks</div>
                <div className="mt-2 text-3xl font-black text-foreground">{stats.totalClicks}</div>
                <div className="mt-1 text-xs text-muted-foreground">tháng này: {clicks.filter((c) => new Date(c.created_at).getMonth() === new Date().getMonth()).length}</div>
              </div>
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Đơn thành công</div>
                <div className="mt-2 text-3xl font-black text-foreground">{stats.successOrders}</div>
                <div className="mt-1 text-xs text-muted-foreground">đang chờ: {orders.filter((o) => o.status === "pending").length}</div>
              </div>
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Chờ xác nhận ({GUARANTEE_DAYS} ngày)</div>
                <div className="mt-2 text-2xl font-black text-primary">{formatMoney(stats.pendingCommission)}</div>
                <div className="mt-1 text-xs text-muted-foreground">đang trong thời gian bảo đảm</div>
              </div>
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Đã nhận</div>
                <div className="mt-2 text-2xl font-black text-emerald-400">{formatMoney(stats.paidCommission)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stats.paidCommission === 0 ? "chưa có giao dịch" : "tổng đã thanh toán"}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl bg-card border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Hiệu quả hoạt động</h2>
                <div className="flex gap-1 bg-muted p-1 rounded-lg text-xs">
                  {([7, 28, 60, 90] as const).map((d) => (
                    <button key={d} onClick={() => setChartRange(d)} className={`px-3 py-1 rounded-md font-semibold ${chartRange === d ? "bg-primary text-primary-foreground" : "text-white/60"}`}>
                      {d} ngày
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-2xl font-black mb-4">{clicks.filter((c) => {
                const d = new Date(c.created_at);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - chartRange);
                return d >= cutoff;
              }).length} <span className="text-sm font-normal text-muted-foreground">clicks {chartRange} ngày qua</span></div>
              <div className="flex items-end gap-1 h-40">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/80 rounded-t" style={{ height: `${(d.clicks / maxClicks) * 100}%`, minHeight: d.clicks > 0 ? "4px" : "1px" }} />
                    {chartRange <= 14 && <span className="text-[9px] text-muted-foreground/60">{d.date}</span>}
                  </div>
                ))}
              </div>
              {chartRange > 14 && (
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground/60">
                  <span>{chartData[0]?.date}</span>
                  <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
                  <span>{chartData[chartData.length - 1]?.date}</span>
                </div>
              )}
            </div>

            {/* Referral link */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold flex items-center gap-2 mb-4"><Link2 className="w-5 h-5 text-primary" /> Link giới thiệu của bạn</h2>
              <div className="flex items-center gap-3 bg-muted rounded-lg p-4">
                <span className="flex-1 font-mono text-sm truncate">
                  {window.location.origin}/?ref=<span className="text-primary font-bold">{affiliate.ref_code}</span>
                </span>
                <button onClick={() => copyLink(`${window.location.origin}/?ref=${affiliate.ref_code}`)} className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary transition">
                  <Copy className="w-4 h-4" /> Sao chép
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tuỳ chỉnh tên:</span>
                <input value={editRefCode} onChange={(e) => setEditRefCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground w-48 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <button onClick={updateRefCode} className="px-3 py-1.5 rounded-lg bg-accent text-sm font-semibold hover:bg-accent transition">Lưu</button>
                <button onClick={() => copyLink(`${window.location.origin}/?ref=${editRefCode}`)} className="px-3 py-1.5 rounded-lg bg-accent text-sm font-semibold hover:bg-accent transition">Kiểm tra</button>
              </div>
            </div>

            {/* Orders */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold flex items-center gap-2 mb-4"><ShoppingCart className="w-5 h-5 text-primary" /> Đơn hàng được giới thiệu</h2>
              {orders.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">Chưa có đơn hàng nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr className="text-left text-muted-foreground">
                        <th className="px-4 py-3">KHÁCH HÀNG</th>
                        <th className="px-4 py-3">SĐT</th>
                        <th className="px-4 py-3">SỐ TIỀN</th>
                        <th className="px-4 py-3">NGÀY ĐẶT</th>
                        <th className="px-4 py-3">ĐƠN HÀNG</th>
                        <th className="px-4 py-3">HOA HỒNG CỦA BẠN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const orderDate = new Date(o.created_at);
                        const approveDate = o.commission_approved_at ? new Date(o.commission_approved_at) : null;
                        const daysLeft = approveDate
                          ? Math.max(0, GUARANTEE_DAYS - Math.floor((Date.now() - approveDate.getTime()) / 86400000))
                          : GUARANTEE_DAYS;

                        return (
                          <tr key={o.id} className="border-t border-border/50">
                            <td className="px-4 py-3 font-semibold">{maskName(o.customer_name)}</td>
                            <td className="px-4 py-3 font-mono text-white/60">{maskPhone(o.customer_phone)}</td>
                            <td className="px-4 py-3 font-bold text-primary">{o.amount}</td>
                            <td className="px-4 py-3 text-white/60">{orderDate.toLocaleDateString("vi-VN")}</td>
                            <td className="px-4 py-3">
                              {o.status === "confirmed" && <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 className="w-3 h-3" /> Đã TT</span>}
                              {o.status === "pending" && <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold"><Clock className="w-3 h-3" /> Chờ</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="inline-flex items-center gap-2">
                                <span className="text-primary font-bold text-sm">{formatMoney(o.commission_amount || 0)}</span>
                                {o.commission_status === "pending" && (
                                  <span className="text-[10px] bg-primary/20 text-primary rounded-full px-2 py-0.5">Chờ xác nhận · còn {daysLeft} ngày</span>
                                )}
                                {o.commission_status === "paid" && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">Đã thanh toán</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "honor" && (
          <>
            {/* Hồ sơ hiển thị */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold flex items-center gap-2 mb-4">💼 Hồ sơ hiển thị</h2>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full border-3 border-primary/40 overflow-hidden bg-accent grid place-items-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-muted-foreground">{(displayName || affiliate.full_name || "?").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarSelect} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-accent transition">Chọn ảnh</button>
                </div>
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tên hiển thị</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Nhập tên hiển thị..."
                    />
                  </div>
                  <button onClick={saveProfile} disabled={savingProfile} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-50">
                    {savingProfile ? "Đang lưu..." : "Lưu hồ sơ"}
                  </button>
                  <p className="text-xs text-muted-foreground">Ảnh & tên này hiển thị trên Bảng Vinh Danh. Không ai thấy doanh thu hay % hoa hồng của bạn.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-6">
              <h2 className="text-2xl font-black flex items-center gap-2">🏆 BẢNG VINH DANH · Top 20</h2>
              <p className="mt-1 text-sm opacity-90">Top đối tác xuất sắc nhất theo đơn & lượt click</p>
            </div>

            {leaderboard.length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-10 text-center text-muted-foreground">Chưa có dữ liệu xếp hạng</div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <div className="flex items-end justify-center gap-4 py-6">
                    {[leaderboard[1], leaderboard[0], leaderboard[2]].map((a, idx) => {
                      if (!a) return null;
                      const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                      const size = pos === 1 ? "w-24 h-24" : "w-20 h-20";
                      const border = pos === 1 ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : pos === 2 ? "border-gray-400" : "border-amber-700";
                      const badge = pos === 1 ? "🥇" : pos === 2 ? "🥈" : "🥉";
                      const isMe = affiliate && a.affiliate_id === affiliate.id;
                      return (
                        <div key={a.affiliate_id} className={`flex flex-col items-center gap-2 ${pos === 1 ? "-mt-6" : ""}`}>
                          <div className="relative">
                            <div className={`${size} rounded-full border-3 ${border} overflow-hidden bg-gradient-to-br from-white/20 to-white/5 grid place-items-center text-2xl font-black`}>
                              {a.avatar_url ? <img src={a.avatar_url} alt="" className="w-full h-full object-cover" /> : (a.display_name || a.full_name)?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="absolute -top-2 -right-2 text-xl">{badge}</span>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-sm">{a.display_name || a.full_name || a.ref_code}{isMe && <span className="text-primary"> · Bạn</span>}</div>
                            <div className="text-primary font-bold text-sm">🛒 {a.total_orders} đơn</div>
                            <div className="text-muted-foreground text-xs">👆 {a.total_clicks} click</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Full ranking list */}
                <div className="space-y-2">
                  {leaderboard.map((a, i) => {
                    const isMe = affiliate && a.affiliate_id === affiliate.id;
                    const isTop3 = i < 3;
                    return (
                      <div key={a.affiliate_id} className={`rounded-xl p-4 flex items-center gap-4 ${isMe ? "bg-primary/10 border-2 border-primary/40" : isTop3 ? "bg-white/5 border border-primary/20" : "bg-card border border-border"}`}>
                        <div className="shrink-0 w-10 text-center">
                          {i === 0 ? <span className="text-lg">🥇</span> : i === 1 ? <span className="text-lg">🥈</span> : i === 2 ? <span className="text-lg">🥉</span> : <span className="text-sm text-muted-foreground font-bold">#{i + 1}</span>}
                        </div>
                        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-white/20 to-white/5 border border-border grid place-items-center font-bold text-sm">
                          {a.avatar_url ? <img src={a.avatar_url} alt="" className="w-full h-full object-cover" /> : (a.display_name || a.full_name)?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{a.display_name || a.full_name || a.ref_code}{isMe && <span className="text-primary"> · Bạn</span>}</div>
                          <div className="text-xs text-primary/60">🚀 Tập Sự</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-primary font-bold text-sm">🛒 {a.total_orders} đơn</div>
                          <div className="text-muted-foreground text-xs">👆 {a.total_clicks} click</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "partners" && affiliate && (() => {
          const totalOrders = orders.filter((o) => o.status === "confirmed").length;
          const currentTier = totalOrders >= 50 ? 2 : totalOrders >= 20 ? 1 : 0;
          const tiers = [
            { name: "ĐỐI TÁC", rate: "30-35%", desc: "Mặc định khi đăng ký", sub: "từ 810.000đ / đơn" },
            { name: "ĐỐI TÁC VÀNG", rate: "40%", desc: "20 giới thiệu thành công", sub: "1.080.000đ / đơn" },
            { name: "ĐẠI SỨ THƯƠNG HIỆU", rate: "50%", desc: "50 giới thiệu thành công", sub: "1.350.000đ / đơn" },
          ];
          const nextTier = currentTier < 2 ? currentTier + 1 : null;
          const nextTarget = nextTier === 1 ? 20 : nextTier === 2 ? 50 : 0;
          const progress = nextTarget > 0 ? Math.min((totalOrders / nextTarget) * 100, 100) : 100;

          return (
            <>
              {/* Đối Tác Giới Thiệu */}
              <div className="rounded-xl bg-card border border-border p-5">
                <h2 className="font-bold flex items-center gap-2 mb-4">🤝 Đối Tác Giới Thiệu</h2>
                <div className="rounded-xl bg-card border border-border p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <span className="font-bold">Đối Tác Giới Thiệu</span>
                    </div>
                    <span className="text-xs bg-accent text-muted-foreground rounded-full px-3 py-1 font-semibold flex items-center gap-1">🔓 {totalOrders >= 5 ? "Đã mở" : "Chưa mở"}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Hoa hồng 35-50% · Phí tham gia $60 · Link riêng sau khi mở khoá</p>
                  <div className="mt-3 flex items-center gap-3 bg-muted rounded-lg p-3">
                    <span className="flex-1 font-mono text-sm text-muted-foreground/40 tracking-widest">• • • • • • • • • • • • • • • • •</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">🔒 {totalOrders >= 5 ? "Mở khoá" : "Khoá"}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>🎯</span>
                      <span className="text-white/60">Đạt 5 đơn thành công để mở khoá link Đối Tác Giới Thiệu — <span className="text-primary font-bold">{totalOrders}/5</span></span>
                    </div>
                    <div className="mt-2 h-2 bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all" style={{ width: `${Math.min((totalOrders / 5) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cấp độ đối tác */}
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg">Cấp độ đối tác</h2>
                  <span className="text-sm text-muted-foreground">· Hoa hồng hiện tại: <span className="text-primary font-bold">{tiers[currentTier].rate}</span></span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {tiers.map((t, i) => (
                    <div key={t.name} className={`rounded-xl p-5 text-center relative ${i === currentTier ? "bg-accent border-2 border-primary/60" : "bg-card border border-border"}`}>
                      {i === currentTier && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full">Cấp hiện tại</span>}
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t.name}</div>
                      <div className={`mt-2 text-3xl font-black ${i === currentTier ? "text-primary" : "text-muted-foreground/60"}`}>{t.rate}</div>
                      <div className="mt-1 text-xs text-muted-foreground/60">{t.desc}</div>
                      <div className="text-xs text-muted-foreground/40">{t.sub}</div>
                    </div>
                  ))}
                </div>
                {nextTier !== null && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Tiến độ đến {tiers[nextTier].name} ({tiers[nextTier].rate})</span>
                      <span className="text-primary font-bold">{totalOrders} / {nextTarget} giới thiệu</span>
                    </div>
                    <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="mt-5 rounded-xl bg-card border border-border p-4 text-sm text-white/60">
                  <p>Bạn đang là thành viên đội ngũ <span className="font-bold text-white">THỊNH VUA APP</span> — tiếp tục giới thiệu để tăng cấp độ</p>
                  <p className="mt-1">Nhận hướng dẫn từng bước qua nhóm Zalo riêng · <a href="https://zalo.me/0367337799" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Liên hệ hỗ trợ →</a></p>
                </div>
              </div>
            </>
          );
        })()}

        {activeTab === "payment" && affiliate && (() => {
          const paidTotal = orders
            .filter((o) => o.commission_status === "paid" || o.commission_status === "approved")
            .reduce((s, o) => s + (o.commission_amount || 0), 0);
          const pendingTotal = orders
            .filter((o) => o.status === "confirmed" && o.commission_status === "pending")
            .reduce((s, o) => s + (o.commission_amount || 0), 0);
          const commissionOrders = orders.filter((o) => o.status === "confirmed");

          return (
            <>
              {/* Rút tiền hoa hồng */}
              <div className="rounded-xl bg-card border border-border p-5">
                <h2 className="font-bold flex items-center gap-2 mb-4">💰 Rút tiền hoa hồng</h2>
                <div className="rounded-xl bg-card border border-border p-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Có thể rút ngay</div>
                    <div className="text-3xl font-black text-emerald-400 mt-1">{formatMoney(paidTotal)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Chờ xác nhận: {formatMoney(pendingTotal)}</div>
                  </div>
                  <button className="rounded-xl bg-accent border border-border px-6 py-3 font-bold text-sm hover:bg-accent transition">
                    Rút tiền
                  </button>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-4">
                  <span>ℹ️</span>
                  <p>Hoa hồng được <span className="font-bold text-white">xác nhận sau 15 ngày</span> kể từ ngày đơn thành công (đảm bảo chính sách hoàn tiền cho khách chưa hài lòng). Sau khi bạn yêu cầu rút, admin sẽ <span className="font-bold text-white">thanh toán trong 1-3 ngày làm việc</span>.</p>
                </div>
              </div>

              {/* Tài khoản nhận hoa hồng */}
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold flex items-center gap-2">🏦 Tài khoản nhận hoa hồng</h2>
                  {!editingBank && (
                    <button onClick={() => setEditingBank(true)} className="rounded-lg bg-accent border border-border px-4 py-1.5 text-xs font-semibold hover:bg-accent/80 transition">Chỉnh sửa</button>
                  )}
                </div>
                {editingBank ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Số tài khoản</label>
                      <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="VD: 2210189178888" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chủ tài khoản</label>
                      <input value={bankOwner} onChange={(e) => setBankOwner(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="VD: PHAM VAN THINH" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tên ngân hàng</label>
                      <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="VD: MBBank, Vietcombank, Techcombank..." />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveBank} disabled={savingBank} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-50">
                        {savingBank ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button onClick={() => { setEditingBank(false); setBankName(affiliate.bank_name || ""); setBankAccount(affiliate.bank_account || ""); setBankOwner(affiliate.bank_owner || ""); }} className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-accent transition">Huỷ</button>
                    </div>
                  </div>
                ) : (
                  affiliate.bank_account ? (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Số tài khoản:</span><span className="font-bold">{affiliate.bank_account}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Chủ tài khoản:</span><span className="font-bold">{affiliate.bank_owner || "—"}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Ngân hàng:</span><span className="font-bold">{affiliate.bank_name || "—"}</span></div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">Chưa có thông tin ngân hàng</p>
                      <button onClick={() => setEditingBank(true)} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition">Thêm tài khoản ngân hàng</button>
                    </div>
                  )
                )}
              </div>

              {/* Lịch sử hoa hồng */}
              <div className="rounded-xl bg-card border border-border p-5">
                <h2 className="font-bold flex items-center gap-2 mb-4">📋 Lịch sử hoa hồng</h2>
                {commissionOrders.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">Chưa có lịch sử hoa hồng</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr className="text-left text-muted-foreground">
                          <th className="px-4 py-3">TỶ LỆ</th>
                          <th className="px-4 py-3">HOA HỒNG</th>
                          <th className="px-4 py-3">NGÀY TẠO</th>
                          <th className="px-4 py-3">TRẠNG THÁI</th>
                          <th className="px-4 py-3">NGÀY NHẬN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissionOrders.map((o) => {
                          const approveDate = o.commission_approved_at ? new Date(o.commission_approved_at) : null;
                          const daysLeft = approveDate
                            ? Math.max(0, GUARANTEE_DAYS - Math.floor((Date.now() - approveDate.getTime()) / 86400000))
                            : GUARANTEE_DAYS;
                          const hoursLeft = approveDate
                            ? Math.max(0, Math.floor(((approveDate.getTime() + GUARANTEE_DAYS * 86400000) - Date.now()) / 3600000))
                            : GUARANTEE_DAYS * 24;
                          const dLeft = Math.floor(hoursLeft / 24);
                          const hLeft = hoursLeft % 24;

                          return (
                            <tr key={o.id} className="border-t border-border/50">
                              <td className="px-4 py-3 text-white/60">{affiliate.commission_rate}%</td>
                              <td className="px-4 py-3 font-bold text-primary">{formatMoney(o.commission_amount || 0)}</td>
                              <td className="px-4 py-3 text-white/60">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                              <td className="px-4 py-3">
                                {o.commission_status === "paid" ? (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 rounded-full px-2.5 py-1 font-semibold">Đã thanh toán</span>
                                ) : (
                                  <span className="text-xs bg-primary/20 text-primary rounded-full px-2.5 py-1 font-semibold">⏱ {dLeft}n {hLeft}h</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{o.commission_status === "paid" && approveDate ? approveDate.toLocaleDateString("vi-VN") : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}

function maskName(name: string) {
  if (!name) return "***";
  const parts = name.split(" ");
  return parts.map((p, i) => (i === 0 ? p.charAt(0) + "***" : p.charAt(0) + "***")).join(" ");
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 6) return "****";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}
