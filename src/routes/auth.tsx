import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập / Đăng ký Thành viên VIP — Thịnh Vua App" },
      { name: "description", content: "Đăng ký Thành viên VIP của Thịnh Vua App để mở khoá toàn bộ sản phẩm CTY PHẦN MỀM AIGO. Giá chỉ 10$/năm." },
      { property: "og:title", content: "Đăng ký Thành viên VIP — Thịnh Vua App" },
      { property: "og:description", content: "Đăng ký Thành viên VIP của Thịnh Vua App để mở khoá toàn bộ sản phẩm CTY PHẦN MỀM AIGO. Giá chỉ 10$/năm." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Đăng ký Thành viên VIP — Thịnh Vua App" },
      { name: "twitter:description", content: "Đăng ký Thành viên VIP của Thịnh Vua App để mở khoá toàn bộ sản phẩm CTY PHẦN MỀM AIGO. Giá chỉ 10$/năm." },
    ],
  }),
  component: AuthPage,
});

const VIP_BENEFITS = [
  "Truy cập TẤT CẢ sản phẩm số của CTY PHẦN MỀM AIGO không giới hạn",
  "Cập nhật miễn phí mọi quy trình AI mới",
  
  "Tặng kèm kho prompt + poster mẫu mọi ngành nghề",
  "Ưu tiên hỗ trợ kỹ thuật và tư vấn khởi nghiệp AI",
];

function isGmail(email: string) {
  return /^[a-z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

function isPhone(phone: string) {
  return /^0\d{9,10}$/.test(phone.trim());
}

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) navigate({ to: "/affiliate-dashboard" });
    });
  }, [navigate]);

  const handleGoogle = () => {
    setLoading(true);
    const supabaseUrl = "https://yhedusfqtzqkuvdoyzqh.supabase.co";
    const redirectTo = encodeURIComponent(`${window.location.origin}/affiliate-dashboard`);
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGmail(email)) {
      toast.error("Bắt buộc dùng địa chỉ Gmail (@gmail.com)");
      return;
    }
    setLoading(true);
    try {
      if (tab === "register") {
        if (!fullName.trim()) { toast.error("Nhập họ và tên"); setLoading(false); return; }
        if (!isPhone(phone)) { toast.error("Số điện thoại không hợp lệ"); setLoading(false); return; }
        if (password.length < 6) { toast.error("Mật khẩu tối thiểu 6 ký tự"); setLoading(false); return; }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });
        if (error) throw error;

        toast.success("Đăng ký thành công!");
        navigate({ to: "/affiliate-dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Đăng nhập thành công!");
        navigate({ to: "/affiliate-dashboard" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      if (msg.toLowerCase().includes("invalid login")) toast.error("Sai email hoặc mật khẩu");
      else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) toast.error("Gmail này đã đăng ký, hãy đăng nhập");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGmail(email)) { toast.error("Nhập đúng Gmail"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Đã gửi link đặt lại mật khẩu về Gmail!"); setForgot(false); }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.01_60)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <span className="font-bold">THỊNH <span className="text-primary">VUA APP</span></span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 space-y-8">
        {/* Auth form */}
        <section className="rounded-2xl border border-border bg-background p-6 md:p-8 shadow-sm">
          {!forgot && (
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-full max-w-sm mx-auto">
              <button type="button" onClick={() => setTab("register")} className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${tab === "register" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                Đăng ký
              </button>
              <button type="button" onClick={() => setTab("login")} className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${tab === "login" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                Đăng nhập
              </button>
            </div>
          )}

          {forgot ? (
            <form onSubmit={handleForgot} className="mt-6 max-w-sm mx-auto space-y-4">
              <h2 className="text-lg font-bold text-center">Quên mật khẩu</h2>
              <p className="text-sm text-muted-foreground text-center">Nhập Gmail, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="ban@gmail.com" />
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 disabled:opacity-50 transition">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Gửi link đặt lại
              </button>
              <button type="button" onClick={() => setForgot(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">← Quay lại đăng nhập</button>
            </form>
          ) : (
            <>
              <button type="button" onClick={handleGoogle} disabled={loading} className="mt-6 max-w-sm mx-auto w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background py-3 text-sm font-semibold hover:bg-accent transition disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Tiếp tục với Google
              </button>

              <div className="mt-5 max-w-sm mx-auto flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex-1 h-px bg-border" /> hoặc dùng Gmail <span className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="mt-5 max-w-sm mx-auto space-y-4">
                {tab === "register" && (
                  <>
                    <div>
                      <label className="text-sm font-semibold">Họ và tên</label>
                      <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold">Số điện thoại</label>
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="0367337799" />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-semibold">Gmail <span className="text-xs text-primary">(bắt buộc @gmail.com)</span></label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="ban@gmail.com" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Mật khẩu</label>
                    {tab === "login" && (
                      <button type="button" onClick={() => setForgot(true)} className="text-xs text-primary hover:underline">Quên mật khẩu?</button>
                    )}
                  </div>
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 disabled:opacity-50 transition">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {tab === "login" ? "Đăng nhập" : "Tạo tài khoản VIP"}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
