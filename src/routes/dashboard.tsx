import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, LogOut, Shield, Clock, CheckCircle2, XCircle, Copy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard VIP — Thịnh Vua App" }] }),
  component: Dashboard,
});

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  vip_code: string | null;
  vip_status: "pending" | "approved" | "rejected";
  vip_expires_at: string | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) { navigate({ to: "/affiliate" }); return; }
    navigate({ to: "/affiliate-dashboard" }); return;
    const uid = userData.user.id;
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);

    setProfile(p as Profile | null);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const copyCode = async () => {
    if (profile?.vip_code) {
      await navigator.clipboard.writeText(profile.vip_code);
      toast.success("Đã copy mã VIP");
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Đang tải...</div>;
  if (!profile) return null;

  const status = profile.vip_status;

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.01_60)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><ArrowLeft className="w-4 h-4" /> Trang chủ</Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
                <Shield className="w-4 h-4" /> Quản trị
              </Link>
            )}
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <div className="rounded-2xl border border-border bg-background p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center"><Crown className="w-6 h-6" /></div>
            <div>
              <h1 className="text-2xl font-black">Xin chào, {profile.full_name || profile.email}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Trạng thái</div>
              <div className="mt-2 flex items-center gap-2">
                {status === "approved" && <><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span className="font-bold text-emerald-600">VIP đã kích hoạt</span></>}
                {status === "pending" && <><Clock className="w-5 h-5 text-amber-600" /><span className="font-bold text-amber-600">Chờ duyệt</span></>}
                {status === "rejected" && <><XCircle className="w-5 h-5 text-destructive" /><span className="font-bold text-destructive">Bị từ chối</span></>}
              </div>
              {profile.vip_expires_at && status === "approved" && (
                <p className="mt-2 text-xs text-muted-foreground">Hết hạn: {new Date(profile.vip_expires_at).toLocaleDateString("vi-VN")}</p>
              )}
            </div>

            <div className="rounded-xl border border-border p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Mã VIP của bạn</div>
              <div className="mt-2 flex items-center gap-2">
                <code className="font-mono font-bold text-primary text-lg">{profile.vip_code || "—"}</code>
                {profile.vip_code && (
                  <button onClick={copyCode} className="p-1.5 rounded hover:bg-accent"><Copy className="w-4 h-4" /></button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">SĐT: {profile.phone || "Chưa cập nhật"}</p>
            </div>
          </div>

          {status === "pending" && (
            <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-5">
              <h3 className="font-bold text-amber-700">Hướng dẫn thanh toán để kích hoạt VIP</h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>• Ngân hàng: <span className="font-semibold">MBBank</span></li>
                <li>• STK: <span className="font-semibold font-mono">2210 1891 78888</span></li>
                <li>• Chủ TK: <span className="font-semibold">PHẠM VĂN THỊNH</span></li>
                <li>• Giá gốc: <span className="font-semibold line-through text-muted-foreground">30$ / năm</span></li>
                <li className="text-destructive font-semibold">• Tuần này giảm còn: <span className="font-bold">10$ / năm</span></li>
                <li>• Nội dung CK: <span className="font-mono font-bold text-primary">{profile.vip_code || `VIP${profile.phone ?? ""}`}</span></li>
              </ul>
              <p className="mt-3 text-xs text-amber-700">Sau khi chuyển khoản, quản trị viên sẽ duyệt trong vòng 5–10 phút.</p>
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-6 rounded-xl bg-destructive/10 border border-destructive/30 p-5 text-sm">
              Đăng ký VIP của bạn đã bị từ chối. Vui lòng liên hệ <span className="font-semibold">0367337799</span> để được hỗ trợ.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
