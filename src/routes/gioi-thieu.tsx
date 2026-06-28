import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  Rocket,
  Brain,
  Users,
  Zap,
  Code2,
  ExternalLink,
} from "lucide-react";
import avatarImage from "@/assets/thinh-ai-avatar.png";

export const Route = createFileRoute("/gioi-thieu")({
  head: () => ({
    meta: [
      { title: "Giới thiệu — Thịnh Vua App | Chuyên gia AI Tech" },
      {
        name: "description",
        content:
          "Thịnh Vua App – Chuyên gia AI, chia sẻ cách biến AI thành tiền và xây dựng cộng đồng khởi nghiệp cùng AI.",
      },
      { property: "og:title", content: "Giới thiệu — Thịnh Vua App" },
      {
        property: "og:description",
        content: "Chuyên gia AI Tech – Cộng đồng khởi nghiệp cùng Thịnh Vua App.",
      },
    ],
  }),
  component: GioiThieuPage,
});

function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.12_0.04_260)] text-[oklch(0.97_0.02_240)] relative overflow-hidden">
      {/* Animated tech grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.5 0.2 260 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.5 0.2 260 / 0.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* Glowing orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-[oklch(0.55_0.25_280)] opacity-30 blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-[oklch(0.65_0.22_200)] opacity-30 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 20px oklch(0.6 0.25 280 / 0.5), 0 0 40px oklch(0.6 0.25 280 / 0.3); }
          50% { box-shadow: 0 0 40px oklch(0.6 0.25 280 / 0.8), 0 0 80px oklch(0.6 0.25 280 / 0.5); }
        }
        @keyframes gradient-x {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .text-gradient {
          background: linear-gradient(90deg, oklch(0.75 0.2 280), oklch(0.8 0.2 200), oklch(0.75 0.2 280));
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradient-x 4s linear infinite;
        }
      `}</style>

      <div className="relative z-10">
        {/* Header with back button */}
        <header className="px-5 py-6 flex items-center justify-between max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.2_280/0.4)] bg-[oklch(0.2_0.05_260/0.6)] backdrop-blur px-5 py-2.5 text-sm font-semibold hover:bg-[oklch(0.25_0.08_270/0.8)] hover:border-[oklch(0.6_0.25_280)] transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </Link>
          <div className="inline-flex items-center gap-2 text-sm font-mono text-[oklch(0.75_0.15_200)]">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.7_0.2_140)] animate-pulse" />
            AI.SYSTEM_ONLINE
          </div>
        </header>

        {/* Hero */}
        <section className="px-5 pt-10 pb-16 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.2_280/0.5)] bg-[oklch(0.2_0.05_260/0.6)] backdrop-blur px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-[oklch(0.8_0.15_280)]">
            <Cpu className="w-3.5 h-3.5" /> Chuyên gia AI Tech
          </div>

          <div className="mt-8 relative inline-block animate-float">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[oklch(0.6_0.25_280)] to-[oklch(0.7_0.22_200)] blur-xl opacity-70" />
            <img
              src={avatarImage}
              alt="Thịnh Vua App"
              className="relative w-40 h-40 rounded-full object-cover border-4 border-[oklch(0.6_0.25_280)] animate-glow"
            />
          </div>

          <h1 className="mt-8 text-4xl md:text-6xl font-black tracking-tight">
            <span className="text-gradient">THỊNH VUA APP</span>
          </h1>
          <p className="mt-3 text-lg md:text-xl font-semibold text-[oklch(0.85_0.1_240)]">
            Chuyên gia AI Tech · Người dẫn đường khởi nghiệp cùng AI
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-[oklch(0.75_0.04_240)] leading-relaxed">
            Mình là Thịnh – người mê công nghệ và luôn tin rằng AI là cánh cửa
            để bất kỳ ai cũng có thể làm được nhiều hơn mỗi ngày. Hành trình
            của mình là biến AI từ một công cụ phức tạp thành{" "}
            <span className="text-[oklch(0.85_0.18_280)] font-semibold">
              cỗ máy tạo ra giá trị và thu nhập
            </span>{" "}
            cho cộng đồng người Việt.
          </p>
        </section>

        {/* Stats */}
        <section className="px-5 pb-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: "12+", l: "Công cụ AI", icon: Zap },
              { v: "500+", l: "Học viên", icon: Users },
              { v: "50+", l: "Dự án App", icon: Code2 },
              { v: "24/7", l: "Hỗ trợ AI", icon: Brain },
            ].map(({ v, l, icon: Icon }) => (
              <div
                key={l}
                className="rounded-2xl border border-[oklch(0.4_0.15_270/0.4)] bg-[oklch(0.18_0.05_265/0.5)] backdrop-blur p-5 text-center hover:border-[oklch(0.6_0.25_280)] transition"
              >
                <Icon className="w-6 h-6 mx-auto text-[oklch(0.75_0.2_280)]" />
                <div className="mt-2 text-3xl font-black text-gradient">
                  {v}
                </div>
                <div className="text-xs uppercase tracking-wider text-[oklch(0.7_0.04_240)] mt-1">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What I do */}
        <section className="px-5 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10">
            <span className="text-gradient">// SỨ MỆNH CỦA THỊNH</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: "Chia sẻ kiến thức AI",
                desc: "Hướng dẫn từ cơ bản đến nâng cao – ai cũng có thể bắt đầu với AI dù chưa biết code.",
              },
              {
                icon: Rocket,
                title: "Biến AI thành tiền",
                desc: "Chia sẻ cách dùng AI để xây app, tạo sản phẩm số, kiếm thu nhập thật từ kỹ năng AI.",
              },
              {
                icon: Users,
                title: "Cộng đồng khởi nghiệp",
                desc: "Xây cộng đồng nơi mọi người cùng học, cùng làm, cùng khởi nghiệp với AI.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-[oklch(0.4_0.15_270/0.4)] bg-[oklch(0.18_0.05_265/0.5)] backdrop-blur p-6 hover:border-[oklch(0.6_0.25_280)] hover:-translate-y-1 transition-all"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.6_0.25_280)] to-[oklch(0.65_0.22_200)] flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[oklch(0.95_0.02_240)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-[oklch(0.75_0.04_240)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA join community */}
        <section className="px-5 pb-20 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.55_0.22_280/0.5)] bg-gradient-to-br from-[oklch(0.22_0.1_270)] via-[oklch(0.18_0.08_265)] to-[oklch(0.22_0.12_290)] p-8 md:p-12 text-center">
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, oklch(0.6 0.25 280 / 0.5), transparent 60%), radial-gradient(circle at 70% 80%, oklch(0.65 0.22 200 / 0.4), transparent 60%)",
              }}
            />
            <Sparkles className="w-10 h-10 mx-auto text-[oklch(0.85_0.18_280)] animate-pulse relative" />
            <h3 className="relative mt-4 text-2xl md:text-3xl font-extrabold">
              Cộng đồng <span className="text-gradient">Khởi Nghiệp Cùng Thịnh Vua App</span>
            </h3>
            <p className="relative mt-3 text-[oklch(0.8_0.04_240)] max-w-xl mx-auto">
              Tham gia ngay để cùng học AI, xây app và biến ý tưởng thành thu
              nhập – miễn phí, thực chiến, có người đồng hành.
            </p>
            <a
              href="https://www.notion.so/C-NG-NG-2-TH-NH-VUA-APP-2bb9a30c0fba80cfb660ed69ab475dcb?source=copy_link"
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.65_0.25_280)] to-[oklch(0.7_0.22_200)] text-white px-8 py-3.5 text-sm font-bold hover:opacity-90 hover:scale-105 transition-all shadow-xl"
            >
              Tham gia cộng đồng <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[oklch(0.75_0.1_240)] hover:text-[oklch(0.85_0.18_280)] transition"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
