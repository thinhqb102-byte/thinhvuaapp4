import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users, Loader2, TrendingUp, DollarSign, MousePointerClick, Sun, Moon, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/affiliate")({
  head: () => ({
    meta: [
      { title: "Dang ky Affiliate — Thinh Vua App" },
      { name: "description", content: "Dang ky lam Affiliate cua Thinh Vua App. Chia se link, nhan hoa hong 35% moi don hang." },
    ],
  }),
  component: AffiliatePage,
});

const AFFILIATE_BENEFITS = [
  { icon: DollarSign, title: "Hoa hong 35%", desc: "Nhan 35% hoa hong cho moi don hang thanh cong qua link gioi thieu cua ban." },
  { icon: MousePointerClick, title: "Theo doi clicks", desc: "Theo doi so luot click, don hang va hoa hong chi tiet tren dashboard." },
  { icon: TrendingUp, title: "Thu nhap thu dong", desc: "Chi can chia se link, he thong tu dong theo doi va tinh hoa hong cho ban." },
];

function isGmail(email: string) {
  return /^[a-z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

function isPhone(phone: string) {
  return /^0\d{9,10}$/.test(phone.trim());
}

function AffiliatePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode((v) => {
      document.documentElement.classList.toggle("dark", !v);
      return !v;
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!error && data.user) {
        const { data: aff } = await (supabase as any).from("affiliates").select("id").eq("user_id", data.user.id).maybeSingle();
        if (aff) {
          navigate({ to: "/affiliate-dashboard" });
        }
      }
      setCheckingAuth(false);
    });
  }, [navigate]);

  const handleGoogle = () => {
    setLoading(true);
    const supabaseUrl = "https://yhedusfqtzqkuvdoyzqh.supabase.co";
    const redirectTo = encodeURIComponent(`${window.location.origin}/affiliate-dashboard`);
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  };

  const generateRefCode = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "affiliate";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGmail(email)) {
      toast.error("Bat buoc dung dia chi Gmail (@gmail.com)");
      return;
    }
    setLoading(true);
    try {
      if (tab === "register") {
        if (!fullName.trim()) { toast.error("Nhap ho va ten"); setLoading(false); return; }
        if (!isPhone(phone)) { toast.error("So dien thoai khong hop le"); setLoading(false); return; }
        if (password.length < 6) { toast.error("Mat khau toi thieu 6 ky tu"); setLoading(false); return; }

        const code = refCode.trim() || generateRefCode(fullName);

        const { data: existingCode } = await (supabase as any).from("affiliates").select("id").eq("ref_code", code).maybeSingle();
        if (existingCode) {
          toast.error("Ma gioi thieu nay da ton tai, vui long chon ma khac");
          setLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/affiliate-dashboard`,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.toLowerCase().includes("already exists")) {
            toast.error("Gmail nay da dang ky. Hay dang nhap.");
            setTab("login");
          } else {
            toast.error(signUpError.message);
          }
          setLoading(false);
          return;
        }

        if (signUpData.user) {
          const { error: affError } = await (supabase as any).from("affiliates").insert({
            user_id: signUpData.user.id,
            ref_code: code,
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            commission_rate: 35,
            status: "active",
          });

          if (affError) {
            console.error("Affiliate insert error:", affError);
            toast.error("Tao tai khoan affiliate that bai: " + affError.message);
            setLoading(false);
            return;
          }
        }

        toast.success("Dang ky thanh cong! Dang vao dashboard...");
        navigate({ to: "/affiliate-dashboard" });
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          if (signInError.message.toLowerCase().includes("invalid login")) {
            toast.error("Sai email hoac mat khau");
          } else {
            toast.error(signInError.message);
          }
          setLoading(false);
          return;
        }

        if (signInData.user) {
          const { data: aff } = await (supabase as any).from("affiliates").select("id").eq("user_id", signInData.user.id).maybeSingle();
          if (!aff) {
            toast.error("Tai khoan nay chua dang ky Affiliate. Vui long dang ky truoc.");
            setTab("register");
            setLoading(false);
            return;
          }
        }

        toast.success("Dang nhap thanh cong!");
        navigate({ to: "/affiliate-dashboard" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Co loi xay ra";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Dang tai...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
            <ArrowLeft className="w-4 h-4" /> Quay lai
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg hidden sm:inline">THINH <span className="text-primary">VUA APP</span></span>
            <button onClick={() => setLang((v) => v === "vi" ? "en" : "vi")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-accent transition">
              <Globe className="w-3.5 h-3.5" /> {lang === "vi" ? "VI" : "EN"}
            </button>
            <button onClick={toggleDark} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background hover:bg-accent transition">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 space-y-8">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
            <Users className="w-4 h-4" /> Chuong trinh Affiliate
          </div>
          <h1 className="text-3xl md:text-4xl font-black">Kiếm tiền cùng <span className="text-primary">Thịnh Vua App</span></h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Chia sẻ link giới thiệu sản phẩm, nhận hoa hồng cho mỗi đơn hàng thành công. Theo dõi chi tiết trên dashboard cá nhân.</p>
        </section>

        <section className="rounded-2xl bg-card border border-border p-6 md:p-8">
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-full max-w-sm mx-auto">
            <button type="button" onClick={() => setTab("register")} className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${tab === "register" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"}`}>
              Dang ky Affiliate
            </button>
            <button type="button" onClick={() => setTab("login")} className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${tab === "login" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"}`}>
              Dang nhap
            </button>
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading} className="mt-6 max-w-sm mx-auto w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background py-3 text-sm font-semibold hover:bg-accent transition disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Tiep tuc voi Google
          </button>

          <div className="mt-5 max-w-sm mx-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 h-px bg-white/10" /> hoac dung Gmail <span className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="mt-5 max-w-sm mx-auto space-y-4">
            {tab === "register" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-foreground">Ho va ten</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Nguyen Van A" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">So dien thoai</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="0367337799" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Ma gioi thieu <span className="text-xs text-primary">(link cua ban se la: .../?ref=ma_nay)</span></label>
                  <input type="text" value={refCode} onChange={(e) => setRefCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="vd: thinhvuaapp (de trong se tu tao)" />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-semibold text-foreground">Gmail <span className="text-xs text-primary">(bat buoc @gmail.com)</span></label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="ban@gmail.com" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Mat khau</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="******" />
            </div>
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold py-3 hover:bg-primary/90 disabled:opacity-50 transition">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === "login" ? "Dang nhap" : "Dang ky Affiliate"}
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}
