import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, Copy, ShoppingCart, Clock,
  CheckCircle2, BarChart3, Link2, Package, BookOpen, Users, Headphones,
  MessageCircle, PlayCircle, Crown, Menu, X, ExternalLink, Trophy, Handshake, CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hoc-vien")({
  head: () => ({
    meta: [
      { title: "Học Viện & Affiliate — Phong Menly × Thịnh Vua App" },
      { name: "description", content: "Khu học viện Phong Menly tích hợp hệ thống Affiliate KOL AI. Khóa học, cộng đồng, và dashboard affiliate trong 1 trang." },
    ],
  }),
  component: HocVienPage,
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
  { key: "kolaisystem", name: "KOL AI SYSTEM", price: 2700000, url: "kolaisystem.com", emoji: "🟢" },
  { key: "matmatudo", name: "Mật Mã Tự Do", price: 686000, url: "phongmenlyai.com", emoji: "🔴" },
];

const COURSES = [
  { title: "Mật Mã Phễu – Master Sale", lessons: 7, color: "from-amber-600 to-orange-700", icon: "📊" },
  { title: "Mật Mã Tự Do", lessons: 9, color: "from-purple-600 to-indigo-700", icon: "📕" },
  { title: "KOL AI SYSTEM", lessons: null, community: true, color: "from-emerald-600 to-teal-700", icon: "🤖" },
];

const GUARANTEE_DAYS = 15;

type SidebarSection = "courses" | "affiliate" | "community" | "support";
type AffiliateTab = "overview" | "honor" | "partners" | "payment";

function HocVienPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>("courses");
  const [affiliateTab, setAffiliateTab] = useState<AffiliateTab>("overview");

  const [user, setUser] = useState<{ email: string; full_name: string | null } | null>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<"today" | 7 | 28 | 60 | 90 | 365>(7);
  const [chartFilter, setChartFilter] = useState<"all" | "kolaisystem" | "matmatudo">("all");
  const [chartMetric, setChartMetric] = useState<"clicks" | "orders" | "commission">("clicks");
  const [editRefCode, setEditRefCode] = useState("");
  const [editingRef, setEditingRef] = useState(false);

  const load = async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      navigate({ to: "/affiliate" });
      return;
    }

    const [{ data: profile }, { data: aff }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", userData.user.id).maybeSingle(),
      (supabase as any).from("affiliates").select("*").eq("user_id", userData.user.id).maybeSingle(),
    ]);

    setUser({
      email: profile?.email || userData.user.email || "",
      full_name: profile?.full_name || null,
    });

    if (aff) {
      setAffiliate(aff as Affiliate);
      setEditRefCode(aff.ref_code);

      const [{ data: clicksData }, { data: ordersData }] = await Promise.all([
        (supabase as any).from("affiliate_clicks").select("*").eq("affiliate_id", aff.id).order("created_at", { ascending: false }),
        (supabase as any).from("affiliate_orders").select("*").eq("affiliate_id", aff.id).order("created_at", { ascending: false }),
      ]);

      setClicks((clicksData ?? []) as Click[]);
      setOrders((ordersData ?? []) as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => {
    const totalClicks = clicks.length;
    const thisMonthClicks = clicks.filter((c) => new Date(c.created_at).getMonth() === new Date().getMonth()).length;
    const successOrders = orders.filter((o) => o.status === "confirmed").length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const pendingCommission = orders
      .filter((o) => o.status === "confirmed" && o.commission_status === "pending")
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0);
    const paidCommission = orders
      .filter((o) => o.commission_status === "paid" || o.commission_status === "approved")
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0);
    return { totalClicks, thisMonthClicks, successOrders, pendingOrders, pendingCommission, paidCommission };
  }, [clicks, orders]);

  const numericRange = typeof chartRange === "number" ? chartRange : chartRange === "today" ? 1 : 7;

  const chartData = useMemo(() => {
    const now = new Date();
    const range = numericRange;
    const days: { date: string; kol: number; mmtd: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const kolClicks = clicks.filter((c) => c.created_at.startsWith(dateStr) && c.product_key === "kolaisystem").length;
      const mmtdClicks = clicks.filter((c) => c.created_at.startsWith(dateStr) && c.product_key === "matmatudo").length;
      days.push({
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        kol: kolClicks,
        mmtd: mmtdClicks,
      });
    }
    return days;
  }, [clicks, numericRange]);

  const maxChart = Math.max(...chartData.map((d) => Math.max(d.kol, d.mmtd)), 1);

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
    toast.success("Đã sao chép link!");
  };

  const updateRefCode = async () => {
    if (!affiliate || !editRefCode.trim()) return;
    const code = editRefCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!code) { toast.error("Mã không hợp lệ"); return; }

    const { data: existing } = await (supabase as any).from("affiliates").select("id").eq("ref_code", code).neq("id", affiliate.id).maybeSingle();
    if (existing) { toast.error("Mã này đã tồn tại"); return; }

    const { error } = await (supabase as any).from("affiliates").update({ ref_code: code }).eq("id", affiliate.id);
    if (error) { toast.error(error.message); return; }
    setAffiliate({ ...affiliate, ref_code: code });
    setEditingRef(false);
    toast.success("Đã cập nhật mã giới thiệu!");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const formatMoney = (n: number) => n.toLocaleString("vi-VN") + "đ";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c29] grid place-items-center">
        <div className="text-white/60 text-sm">Đang tải...</div>
      </div>
    );
  }

  const userName = user?.full_name || affiliate?.full_name || user?.email?.split("@")[0] || "Học viên";
  const userEmail = user?.email || affiliate?.email || "";

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0f0c29]/90 border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-black italic text-white">Phong Menly</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Mật Mã Tự Do</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="https://www.phongmenlyai.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition">TRANG CHỦ</a>
            <a href="https://www.phongmenlyai.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition">SẢN PHẨM</a>
            <button onClick={() => setActiveSection("courses")} className="text-amber-400 hover:text-amber-300 transition">HỌC VIỆN</button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-white/50">{userEmail}</span>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition">
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-30 w-64 h-[calc(100vh-3.5rem)] bg-[#13102e] border-r border-white/10 flex flex-col transition-transform duration-200 ease-in-out`}>
          {/* User Profile */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-black font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{userName}</div>
                <div className="inline-flex items-center gap-1 mt-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <Crown className="w-3 h-3" /> Học viên
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-white/40 truncate">{userEmail}</div>
          </div>

          {/* Main Menu */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Học Viện</div>
            {([
              { key: "courses" as const, icon: BookOpen, label: "Khóa học" },
              { key: "community" as const, icon: Users, label: "Cộng đồng" },
              { key: "support" as const, icon: Headphones, label: "Hỗ trợ" },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeSection === item.key ? "bg-amber-500/20 text-amber-400" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <item.icon className="w-4.5 h-4.5" /> {item.label}
              </button>
            ))}

            <div className="px-3 py-2 mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Affiliate</div>
            <button
              onClick={() => { setActiveSection("affiliate"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeSection === "affiliate" ? "bg-amber-500/20 text-amber-400" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <BarChart3 className="w-4.5 h-4.5" /> Dashboard Affiliate
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-[10px] text-white/30 text-center">© 2026 Phong Menly · Mật Mã Tự Do</div>
          </div>
        </aside>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">

            {/* === KHÓA HỌC Section === */}
            {activeSection === "courses" && (
              <>
                <div>
                  <h1 className="text-2xl font-black">Khóa học của tôi</h1>
                  <p className="text-sm text-white/40 mt-1">Truy cập các khóa học và tài liệu của bạn</p>
                </div>

                {/* Course Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {COURSES.map((course) => (
                    <div key={course.title} className={`rounded-2xl bg-gradient-to-br ${course.color} p-5 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                      <div className="relative z-10">
                        <span className="text-3xl">{course.icon}</span>
                        <h3 className="mt-3 font-bold text-lg leading-tight">{course.title}</h3>
                        {course.community ? (
                          <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/80">
                            <Users className="w-4 h-4" /> Cộng đồng tinh hoa
                          </div>
                        ) : (
                          <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/80">
                            <PlayCircle className="w-4 h-4" /> {course.lessons} bài học
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Book Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-transparent border border-amber-500/30 p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <div className="w-32 h-44 rounded-xl bg-gradient-to-br from-amber-700 to-red-900 grid place-items-center shrink-0 shadow-2xl">
                      <div className="text-center px-3">
                        <div className="text-[10px] font-bold text-amber-300 uppercase">Sách</div>
                        <div className="text-sm font-black mt-1 leading-tight">MẬT MÃ<br/>TỰ DO</div>
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-400 uppercase">
                        🚩 Tấm bản đồ hệ thống
                      </div>
                      <h2 className="mt-3 text-xl lg:text-2xl font-black">
                        Sở hữu sách Mật Mã Tự Do — mở khóa trọn bộ combo
                      </h2>
                      <p className="mt-2 text-sm text-white/60 leading-relaxed">
                        5 combo theo 5 chương (<span className="text-white font-semibold">1.189.000đ</span>) + cuốn đặc biệt KOL AI SYSTEM.
                        Đặt sách chỉ <span className="text-amber-400 font-bold text-lg">686.000đ</span> = mở khóa tất cả bằng mật mã, kèm 4 bonus và vé vào cộng đồng tinh hoa.
                      </p>
                      <a
                        href="https://www.phongmenlyai.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black font-bold px-6 py-3 hover:bg-amber-400 transition text-sm"
                      >
                        📕 Đặt sách & nhận mật mã <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* === AFFILIATE Section === */}
            {activeSection === "affiliate" && affiliate && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black">Dashboard của tôi</h1>
                    <p className="text-sm text-white/40">Hoa hồng {affiliate.commission_rate}% | {affiliate.email}</p>
                  </div>
                  <div className="text-xs text-white/30 font-semibold uppercase">KOL AI AFFILIATE</div>
                </div>

                {/* Affiliate Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit overflow-x-auto">
                  {([
                    { key: "overview" as AffiliateTab, icon: BarChart3, label: "Tổng quan" },
                    { key: "honor" as AffiliateTab, icon: Trophy, label: "Vinh danh" },
                    { key: "partners" as AffiliateTab, icon: Handshake, label: "Đối tác liên kết" },
                    { key: "payment" as AffiliateTab, icon: CreditCard, label: "Thanh toán" },
                  ]).map((t) => (
                    <button key={t.key} onClick={() => setAffiliateTab(t.key)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${affiliateTab === t.key ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"}`}>
                      <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
                </div>

                {affiliateTab === "overview" && (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                        <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">Tổng Clicks</div>
                        <div className="mt-2 text-3xl font-black">{stats.totalClicks}</div>
                        <div className="mt-1 text-[11px] text-white/40">tháng này: {stats.thisMonthClicks}</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                        <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">Đơn thành công</div>
                        <div className="mt-2 text-3xl font-black">{stats.successOrders}</div>
                        <div className="mt-1 text-[11px] text-white/40">đang chờ: {stats.pendingOrders}</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                        <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">Chờ xác nhận ({GUARANTEE_DAYS} ngày)</div>
                        <div className="mt-2 text-2xl font-black text-amber-400">{formatMoney(stats.pendingCommission)}</div>
                        <div className="mt-1 text-[11px] text-white/40">đang trong thời gian bảo đảm</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                        <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">Đã nhận</div>
                        <div className="mt-2 text-2xl font-black text-emerald-400">{formatMoney(stats.paidCommission)}</div>
                        <div className="mt-1 text-[11px] text-white/40">{stats.paidCommission === 0 ? "chưa có giao dịch" : "tổng đã thanh toán"}</div>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="font-bold flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-amber-400" /> Hiệu quả hoạt động
                        </h2>
                        <div className="flex gap-1 bg-white/5 p-1 rounded-lg text-xs flex-wrap">
                          {([
                            { val: "today" as const, label: "Hôm nay" },
                            { val: 7 as const, label: "7 ngày" },
                            { val: 28 as const, label: "28 ngày" },
                            { val: 60 as const, label: "60 ngày" },
                            { val: 90 as const, label: "90 ngày" },
                            { val: 365 as const, label: "1 năm" },
                          ]).map((d) => (
                            <button key={String(d.val)} onClick={() => setChartRange(d.val)} className={`px-3 py-1 rounded-md font-semibold transition ${String(chartRange) === String(d.val) ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"}`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Metric tabs */}
                      <div className="flex gap-4 mb-3 text-sm border-b border-white/10 pb-2">
                        {([
                          { key: "clicks" as const, label: "Clicks" },
                          { key: "orders" as const, label: "Đơn hàng" },
                          { key: "commission" as const, label: "Hoa hồng" },
                        ]).map((m) => (
                          <button key={m.key} onClick={() => setChartMetric(m.key)} className={`font-semibold pb-1 transition ${chartMetric === m.key ? "text-white border-b-2 border-amber-500" : "text-white/40"}`}>
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {/* Product filter */}
                      <div className="flex gap-2 mb-4 text-xs">
                        {([
                          { key: "all" as const, label: "Tất cả" },
                          { key: "kolaisystem" as const, label: "KOL AI SYSTEM", color: "bg-emerald-500" },
                          { key: "matmatudo" as const, label: "Mật Mã Tự Do", color: "bg-red-500" },
                        ]).map((f) => (
                          <button key={f.key} onClick={() => setChartFilter(f.key)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition ${chartFilter === f.key ? "bg-white/15 text-white" : "bg-white/5 text-white/50 hover:text-white"}`}>
                            {f.color && <span className={`w-2 h-2 rounded-full ${f.color}`} />}
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="text-2xl font-black mb-4">
                        {clicks.filter((c) => {
                          const d = new Date(c.created_at);
                          const cutoff = new Date();
                          cutoff.setDate(cutoff.getDate() - numericRange);
                          return d >= cutoff && (chartFilter === "all" || c.product_key === chartFilter);
                        }).length}
                        <span className="text-sm font-normal text-white/40 ml-2">clicks {typeof chartRange === "number" ? `${chartRange} ngày qua` : "hôm nay"}</span>
                      </div>

                      {/* Chart */}
                      <div className="relative h-44">
                        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-white/30">
                          <span>{maxChart}</span>
                          <span>{Math.round(maxChart / 2)}</span>
                          <span>0</span>
                        </div>
                        <div className="ml-10 h-full flex flex-col">
                          <div className="flex-1 relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="border-t border-white/5 w-full" />
                              ))}
                            </div>
                            {/* Lines */}
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                              {chartData.length > 1 && (chartFilter === "all" || chartFilter === "kolaisystem") && (
                                <polyline
                                  fill="none"
                                  stroke="#22c55e"
                                  strokeWidth="2"
                                  points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100}%,${100 - (d.kol / maxChart) * 100}%`).join(" ")}
                                />
                              )}
                              {chartData.length > 1 && (chartFilter === "all" || chartFilter === "matmatudo") && (
                                <polyline
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                  points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100}%,${100 - (d.mmtd / maxChart) * 100}%`).join(" ")}
                                />
                              )}
                              {/* Dots */}
                              {chartData.map((d, i) => (
                                <g key={i}>
                                  {(chartFilter === "all" || chartFilter === "kolaisystem") && (
                                    <circle cx={`${(i / (chartData.length - 1)) * 100}%`} cy={`${100 - (d.kol / maxChart) * 100}%`} r="3" fill="#22c55e" />
                                  )}
                                  {(chartFilter === "all" || chartFilter === "matmatudo") && (
                                    <circle cx={`${(i / (chartData.length - 1)) * 100}%`} cy={`${100 - (d.mmtd / maxChart) * 100}%`} r="3" fill="#ef4444" />
                                  )}
                                </g>
                              ))}
                            </svg>
                          </div>
                          {numericRange <= 14 && (
                            <div className="flex justify-between mt-1 text-[10px] text-white/30 h-4">
                              {chartData.map((d, i) => (
                                <span key={i}>{d.date}</span>
                              ))}
                            </div>
                          )}
                          {numericRange > 14 && (
                            <div className="flex justify-between mt-1 text-[10px] text-white/30 h-4">
                              <span>{chartData[0]?.date}</span>
                              <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
                              <span>{chartData[chartData.length - 1]?.date}</span>
                            </div>
                          )}
                        </div>
                        {/* Legend */}
                        <div className="absolute top-0 right-0 flex gap-4 text-[11px]">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> KOL AI SYSTEM</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Mật Mã Tự Do</span>
                        </div>
                      </div>
                    </div>

                    {/* Referral Link */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                      <h2 className="font-bold flex items-center gap-2 mb-4">
                        <Link2 className="w-5 h-5 text-amber-400" /> Link giới thiệu của bạn
                      </h2>
                      <div className="flex items-center gap-3 bg-black/30 rounded-lg p-4">
                        <span className="flex-1 font-mono text-sm truncate">
                          https://kolaisystem.com/?ref=<span className="text-amber-400 font-bold">{affiliate.ref_code}</span>
                        </span>
                        <button onClick={() => copyLink(`https://kolaisystem.com/?ref=${affiliate.ref_code}`)} className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition">
                          <Copy className="w-4 h-4" /> Sao chép
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white/40">Tùy chỉnh tên:</span>
                        <input
                          value={editRefCode}
                          onChange={(e) => setEditRefCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                          className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white w-48 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <button onClick={updateRefCode} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-semibold hover:bg-white/20 transition">Lưu</button>
                        <button onClick={() => { if (affiliate) copyLink(`https://kolaisystem.com/?ref=${affiliate.ref_code}`); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-semibold hover:bg-white/20 transition">Kiểm tra</button>
                      </div>
                    </div>

                    {/* Product Links */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                      <h2 className="font-bold flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-amber-400" /> Link sản phẩm
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {productStats.map((p) => (
                          <div key={p.key} className="rounded-xl bg-white/5 border border-emerald-500/30 p-5">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold">{p.emoji} {p.name}</h3>
                              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 rounded-full px-3 py-1 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Đang hoạt động
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-white/40">Hoa hồng 30-50% · {formatMoney(p.price)}/sản phẩm</p>
                            <div className="mt-3 flex items-center gap-2 bg-black/30 rounded-lg p-3">
                              <span className="flex-1 font-mono text-xs truncate">{p.url}/?ref={affiliate.ref_code}</span>
                              <button onClick={() => copyLink(`https://${p.url}/?ref=${affiliate.ref_code}`)} className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1">
                                <Copy className="w-3 h-3" /> Sao chép
                              </button>
                            </div>
                            <div className="mt-3 flex gap-4 text-sm text-white/60 flex-wrap">
                              <span>Clicks: <span className="font-bold text-white">{p.clicks}</span></span>
                              <span>Đơn thành công: <span className="font-bold text-white">{p.orders}</span></span>
                              <span>Hoa hồng: <span className="font-bold text-amber-400">{formatMoney(p.commission)}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Orders Table */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                      <h2 className="font-bold flex items-center gap-2 mb-4">
                        <ShoppingCart className="w-5 h-5 text-amber-400" /> Đơn hàng được giới thiệu
                      </h2>
                      {orders.length === 0 ? (
                        <div className="text-center text-white/40 py-10">Chưa có đơn hàng nào</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-[11px] text-white/40 uppercase tracking-wide bg-white/5">
                                <th className="px-4 py-3 rounded-tl-lg">Khách hàng</th>
                                <th className="px-4 py-3">SĐT</th>
                                <th className="px-4 py-3">Số tiền</th>
                                <th className="px-4 py-3">Ngày đặt</th>
                                <th className="px-4 py-3">Đơn hàng</th>
                                <th className="px-4 py-3 rounded-tr-lg">Hoa hồng của bạn</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((o) => {
                                const orderDate = new Date(o.created_at);
                                const approveDate = o.commission_approved_at ? new Date(o.commission_approved_at) : null;
                                const elapsed = approveDate
                                  ? Math.floor((Date.now() - approveDate.getTime()) / 1000)
                                  : 0;
                                const daysLeft = approveDate
                                  ? Math.max(0, GUARANTEE_DAYS - Math.floor(elapsed / 86400))
                                  : GUARANTEE_DAYS;
                                const hoursLeft = approveDate
                                  ? Math.floor((elapsed % 86400) / 3600)
                                  : 0;
                                const minutesLeft = approveDate
                                  ? Math.floor((elapsed % 3600) / 60)
                                  : 0;

                                return (
                                  <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 font-semibold">{maskName(o.customer_name)}</td>
                                    <td className="px-4 py-3 font-mono text-white/60">{maskPhone(o.customer_phone)}</td>
                                    <td className="px-4 py-3 font-bold text-amber-400">{o.amount}</td>
                                    <td className="px-4 py-3 text-white/60">{orderDate.toLocaleDateString("vi-VN")}</td>
                                    <td className="px-4 py-3">
                                      {o.status === "confirmed" && (
                                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 rounded-full px-2.5 py-1 text-xs font-semibold">
                                          <CheckCircle2 className="w-3 h-3" /> Đã TT
                                        </span>
                                      )}
                                      {o.status === "pending" && (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 rounded-full px-2.5 py-1 text-xs font-semibold">
                                          <Clock className="w-3 h-3" /> Chờ
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-amber-400 font-bold">{formatMoney(o.commission_amount || 0)}</span>
                                        {o.commission_status === "pending" && approveDate && (
                                          <span className="text-[10px] bg-amber-500/20 text-amber-400 rounded-full px-2 py-0.5 whitespace-nowrap">
                                            ⏱ {daysLeft}n {hoursLeft}h {minutesLeft}m
                                          </span>
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

                {affiliateTab === "honor" && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center">
                    <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Bảng vinh danh</h2>
                    <p className="text-sm text-white/40 mt-2">Bảng xếp hạng top affiliate sẽ được cập nhật sớm.</p>
                  </div>
                )}

                {affiliateTab === "partners" && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center">
                    <Handshake className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Đối tác liên kết</h2>
                    <p className="text-sm text-white/40 mt-2">Danh sách đối tác liên kết của bạn sẽ hiển thị tại đây.</p>
                  </div>
                )}

                {affiliateTab === "payment" && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center">
                    <CreditCard className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Thanh toán</h2>
                    <p className="text-sm text-white/40 mt-2">Lịch sử thanh toán hoa hồng sẽ hiển thị tại đây.</p>
                  </div>
                )}
              </>
            )}

            {activeSection === "affiliate" && !affiliate && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center">
                <BarChart3 className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold">Chưa đăng ký Affiliate</h2>
                <p className="text-sm text-white/40 mt-2">Bạn cần đăng ký tài khoản affiliate để sử dụng dashboard.</p>
                <Link to="/affiliate" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black font-bold px-6 py-3 hover:bg-amber-400 transition text-sm">
                  Đăng ký Affiliate ngay
                </Link>
              </div>
            )}

            {/* === COMMUNITY Section === */}
            {activeSection === "community" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black">Cộng đồng</h1>
                  <p className="text-sm text-white/40 mt-1">Kết nối với cộng đồng học viên và đối tác</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a href="https://www.youtube.com/@phongmenly" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 grid place-items-center">
                      <PlayCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">YouTube</h3>
                      <p className="text-sm text-white/40">Xem video hướng dẫn</p>
                    </div>
                  </a>
                  <a href="https://www.facebook.com/phongmenly" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 grid place-items-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Facebook</h3>
                      <p className="text-sm text-white/40">Tham gia cộng đồng</p>
                    </div>
                  </a>
                  <a href="https://www.tiktok.com/@phongmenly" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 grid place-items-center">
                      <Sparkles className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">TikTok</h3>
                      <p className="text-sm text-white/40">Theo dõi trên TikTok</p>
                    </div>
                  </a>
                  <a href="https://zalo.me/0978076936" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 grid place-items-center">
                      <MessageCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Zalo</h3>
                      <p className="text-sm text-white/40">Nhắn Zalo tư vấn</p>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* === SUPPORT Section === */}
            {activeSection === "support" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black">Hỗ trợ</h1>
                  <p className="text-sm text-white/40 mt-1">Liên hệ nếu bạn cần hỗ trợ</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <div>
                      <div className="font-semibold">Hotline</div>
                      <div className="text-sm text-white/60">0978 076 936</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <div className="font-semibold">Zalo tư vấn</div>
                      <a href="https://zalo.me/0978076936" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline">Nhắn Zalo ngay</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✉️</span>
                    <div>
                      <div className="font-semibold">Email</div>
                      <div className="text-sm text-white/60">phongtyphu95@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <div>
                      <div className="font-semibold">Phản hồi 24/24</div>
                      <div className="text-sm text-white/60">Đội ngũ hỗ trợ luôn sẵn sàng</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 mt-8">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
              <div className="grid sm:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-black italic">Phong Menly</span>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Hệ thống học Affiliate × AI — xây dòng tiền tự do cùng Phong Menly.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3">Khám phá</h4>
                  <div className="space-y-2 text-sm text-white/50">
                    <a href="https://www.phongmenlyai.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">Trang chủ</a>
                    <button onClick={() => setActiveSection("courses")} className="block hover:text-white transition">Khu Học Viện</button>
                    <button onClick={() => setActiveSection("community")} className="block hover:text-white transition">Cộng đồng</button>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3">Liên hệ</h4>
                  <div className="space-y-2 text-sm text-white/50">
                    <div>📞 0978 076 936</div>
                    <div>💬 Zalo tư vấn</div>
                    <div>✉️ phongtyphu95@gmail.com</div>
                    <div>🔄 Phản hồi 24/24</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-center text-[11px] text-white/30">
                © 2026 Phong Menly · Mật Mã Tự Do · Mọi quyền được bảo lưu
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

function maskName(name: string) {
  if (!name) return "***";
  const parts = name.split(" ");
  return parts.map((p) => p.charAt(0) + "***").join(" ");
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 6) return "****";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}
