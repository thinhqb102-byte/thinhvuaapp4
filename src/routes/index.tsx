import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  LogOut,
  User,
  ExternalLink,
  Phone,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/thinh-ai-hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thịnh Vua App – Vừa học, vừa chia sẻ AI" },
      {
        name: "description",
        content:
          "Thịnh Vua App – tổng hợp công cụ và kiến thức AI thực chiến cho người Việt. Liên hệ 0367337799.",
      },
      { property: "og:title", content: "Thịnh Vua App – Vừa học, vừa chia sẻ AI" },
      {
        property: "og:description",
        content: "Bộ công cụ AI và kiến thức thực chiến do Thịnh Vua App tổng hợp.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [hasAffiliate, setHasAffiliate] = useState(false);
  const [showAffiliateMsg, setShowAffiliateMsg] = useState(false);
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode((v) => {
      document.documentElement.classList.toggle("dark", !v);
      return !v;
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setCurrentUser({
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "",
          email: data.user.email || "",
        });
        const { data: affData } = await supabase
          .from("affiliates")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setHasAffiliate(!!affData);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("affiliate_ref", ref);
      (async () => {
        try {
          const { data: aff } = await (supabase as any).rpc("get_affiliate_by_ref", { p_ref_code: ref });
          if (aff && aff.length > 0) {
            await (supabase as any).from("affiliate_clicks").insert({
              affiliate_id: aff[0].id,
              product_key: "main",
              referrer_url: document.referrer || null,
            });
          }
        } catch {}
      })();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 bg-background border-r border-border">
        <div className="p-5 border-b border-border">
          <div className="font-extrabold text-lg">THỊNH <span className="text-primary">VUA APP</span></div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Affiliate Marketing Platform</div>
        </div>
        {currentUser ? (
          <div className="mx-4 mt-4 rounded-xl border border-border bg-accent/50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">{currentUser.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="font-bold text-sm">{currentUser.name}</div>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">AFFILIATE</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">{currentUser.email}</div>
          </div>
        ) : (
          <div className="mx-4 mt-4">
            <Link to="/affiliate" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-bold hover:opacity-90 transition">
              <User className="w-4 h-4" /> Đăng nhập / Đăng ký
            </Link>
          </div>
        )}
        <div className="mt-5 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Main Menu</div>
        <div className="mt-1 px-3 flex flex-col gap-0.5">
          <Link to="/truy-cap-app" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm">
            <Sparkles className="w-4 h-4" /> Sản Phẩm Số
          </Link>
          {currentUser ? (
            hasAffiliate ? (
              <Link to="/affiliate-dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-semibold transition">
                <User className="w-4 h-4 text-muted-foreground" /> Dashboard Affiliate
              </Link>
            ) : (
              <button onClick={() => setShowAffiliateMsg(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-semibold transition text-left w-full">
                <User className="w-4 h-4 text-muted-foreground" /> Dashboard Affiliate
              </button>
            )
          ) : (
            <Link to="/affiliate" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-semibold transition">
              <User className="w-4 h-4 text-muted-foreground" /> Dashboard Affiliate
            </Link>
          )}
          <a href="tel:0367337799" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-semibold transition">
            <Phone className="w-4 h-4 text-muted-foreground" /> Tư vấn
          </a>
          <a href="https://zalo.me/0367337799" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-semibold transition">
            <ExternalLink className="w-4 h-4 text-muted-foreground" /> Hỗ trợ
          </a>
        </div>
        {currentUser && (
          <div className="mt-auto px-3 pb-5">
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-semibold text-muted-foreground transition text-left w-full">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">
      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <a href="#top" className="flex items-center gap-2 font-bold text-base sm:text-lg">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>
                THỊNH <span className="text-primary">VUA APP</span>
              </span>
            </a>
            <button onClick={() => setLang((v) => v === "vi" ? "en" : "vi")} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-bold hover:bg-accent transition">
              <Globe className="w-3 h-3" /> {lang === "vi" ? "VI" : "EN"}
            </button>
            <button onClick={toggleDark} className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background hover:bg-accent transition">
              {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>
          <nav className="hidden sm:flex lg:hidden items-center">
            <Link to="/truy-cap-app" className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.2_30)] text-primary-foreground px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide shadow-[0_0_20px_oklch(0.7_0.2_45/0.4)] hover:shadow-[0_0_35px_oklch(0.7_0.2_45/0.7)] hover:scale-105 transition-all overflow-hidden">
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-[shine_2.5s_linear_infinite]" />
              <Sparkles className="relative w-4 h-4" />
              <span className="relative">Sản Phẩm Số</span>
            </Link>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 relative">
                <div className="text-right text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold text-[10px] uppercase">Affiliate</span>
                  <div className="text-muted-foreground mt-0.5">{currentUser.email.length > 20 ? currentUser.email.slice(0, 18) + "…" : currentUser.email}</div>
                </div>
                <button onClick={() => setDropdownOpen((v) => !v)} className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm hover:opacity-90 transition">
                  {currentUser.name.charAt(0).toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute top-12 right-0 w-64 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="font-bold text-sm">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{currentUser.email}</div>
                      <span className="inline-block mt-2 px-2.5 py-1 rounded-full border border-primary text-primary text-[10px] font-bold uppercase">Affiliate</span>
                    </div>
                    <div className="p-2 flex flex-col">
                      {hasAffiliate ? (
                        <Link to="/affiliate-dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition text-sm font-semibold">
                          <User className="w-4 h-4 text-primary" /> Dashboard
                        </Link>
                      ) : (
                        <button onClick={() => { setDropdownOpen(false); setShowAffiliateMsg(true); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition text-sm font-semibold text-left w-full">
                          <User className="w-4 h-4 text-primary" /> Dashboard
                        </button>
                      )}
                      <Link to="/truy-cap-app" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition text-sm font-semibold">
                        <Sparkles className="w-4 h-4 text-primary" /> Sản Phẩm Số
                      </Link>
                      <div className="my-1 h-px bg-border" />
                      <button onClick={() => { handleLogout(); setDropdownOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition text-sm font-semibold text-destructive">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/affiliate"
                className="hidden sm:inline-flex lg:hidden items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-bold hover:opacity-90 transition"
              >
                ĐĂNG NHẬP/ ĐĂNG KÝ AFFILIATE KIẾM TIỀN THỤ ĐỘNG
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Mở menu"
              className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border border-border bg-background hover:bg-accent transition"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} />
        )}
        {menuOpen && (
          <nav className="fixed top-0 left-0 z-50 h-full w-72 bg-[#1a1a2e] text-white shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
            <div className="p-5 border-b border-white/10">
              <div className="font-extrabold text-lg">THỊNH <span className="text-primary">VUA APP</span></div>
              <div className="text-xs text-white/50 mt-0.5">Affiliate Marketing Platform</div>
            </div>
            {currentUser ? (
              <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">{currentUser.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="font-bold text-sm">{currentUser.name}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">AFFILIATE</span>
                  </div>
                </div>
                <div className="text-xs text-white/40 mt-2">{currentUser.email}</div>
              </div>
            ) : (
              <div className="mx-4 mt-4">
                <Link to="/affiliate" onClick={() => setMenuOpen(false)} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-bold hover:opacity-90 transition">
                  <User className="w-4 h-4" /> Đăng nhập / Đăng ký
                </Link>
              </div>
            )}
            <div className="mt-4 px-3 text-[10px] font-bold text-white/30 uppercase tracking-wider">Main Menu</div>
            <div className="mt-1 px-3 flex flex-col gap-0.5">
              <Link to="/truy-cap-app" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm transition">
                <Sparkles className="w-4 h-4" /> Sản Phẩm Số
              </Link>
              {currentUser ? (
                hasAffiliate ? (
                  <Link to="/affiliate-dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold transition">
                    <User className="w-4 h-4 text-white/50" /> Dashboard Affiliate
                  </Link>
                ) : (
                  <button onClick={() => { setMenuOpen(false); setShowAffiliateMsg(true); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold transition text-left w-full">
                    <User className="w-4 h-4 text-white/50" /> Dashboard Affiliate
                  </button>
                )
              ) : (
                <Link to="/affiliate" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold transition">
                  <User className="w-4 h-4 text-white/50" /> Dashboard Affiliate
                </Link>
              )}
              <a href="tel:0367337799" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold transition">
                <Phone className="w-4 h-4 text-white/50" /> Tư vấn
              </a>
              <a href="https://zalo.me/0367337799" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold transition">
                <ExternalLink className="w-4 h-4 text-white/50" /> Hỗ trợ
              </a>
            </div>
            {currentUser && (
              <div className="mt-auto px-3 pb-5">
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-semibold text-white/50 transition">
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* AFFILIATE MESSAGE POPUP */}
      {showAffiliateMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAffiliateMsg(false)}>
          <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-primary/10 grid place-items-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Kích hoạt Affiliate</h3>
            <p className="text-sm text-muted-foreground mb-5">Mua ít nhất 1 sản phẩm Thịnh Vua App để kích hoạt lấy link affiliate kiếm tiền</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAffiliateMsg(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition">Đóng</button>
              <Link to="/truy-cap-app" onClick={() => setShowAffiliateMsg(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition text-center">Mua ngay</Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="top" className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.95_0.08_60),_transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-10 md:py-14">
          {/* Top row: image + heading */}
          <div className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-10 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="w-48 sm:w-56 md:w-full rounded-2xl border border-border shadow-xl overflow-hidden">
                <img
                  src={heroImage}
                  alt="Thịnh Vua App - Chuyên gia ứng dụng AI trong kinh doanh"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wide">
                <Sparkles className="w-3 h-3" /> Affiliate AI
              </div>
              <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold leading-[1.15] tracking-tight">
                Kiếm Tiền <span className="text-primary">Thụ Động</span> · <span className="text-primary">Tự Động</span> Ngay Cả Khi Ngủ
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Chia sẻ công cụ AI, nhận hoa hồng tự động – không cần vốn, không cần kinh nghiệm.
              </p>
            </div>
          </div>

          {/* Affiliate links grid */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: "AFFILIATE SẢN PHẨM SỐ CỦA THỊNH VUA APP", path: "/affiliate-products/thinh-vua-app" },
              { title: "AFFILIATE SẢN PHẨM SỐ CỦA PHONG MENLY", path: "/affiliate-products/phong-menly" },
              { title: "AFFILIATE SẢN PHẨM SỐ CỦA SƠN PIAZ", path: "/affiliate-products/son-piaz" },
              { title: "AFFILIATE SẢN PHẨM SỐ CỦA PHẠM THÀNH LONG", path: "/affiliate-products/pham-thanh-long" },
              { title: "SẢN PHẨM VẬT LÝ HỖ TRỢ LÀM VIỆC ONLINE", path: "/affiliate-products/san-pham-vat-ly" },
            ].map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm leading-snug">{item.title}</div>
                </div>
                <ArrowRight className="shrink-0 w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="w-4 h-4 text-primary" /> THỊNH VUA APP
          </div>
          <div>© {new Date().getFullYear()} Thịnh Vua App – Vừa học, vừa chia sẻ.</div>
        </div>
      </footer>
      </div>{/* end main content */}
    </div>
  );
}
