import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Flame, Hand } from "lucide-react";

export const Route = createFileRoute("/workshop")({
  head: () => ({
    meta: [
      { title: "Workshop KOL AI Make Money — Thịnh Vua App" },
      { name: "description", content: "Workshop đặc biệt: KOL AI MAKE MONEY – bạn đã bao giờ thấy người khác kiếm tiền từ AI và tự hỏi tại sao không phải mình?" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-[oklch(0.99_0.01_60)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <span className="font-bold">THỊNH <span className="text-primary">VUA APP</span></span>
        </div>
      </header>

      <div className="bg-gradient-to-r from-primary via-amber-400 to-cyan-500 text-white py-3 px-5 text-center text-sm font-semibold">
        ⏰ Ưu đãi kết thúc sau: <span className="ml-2 inline-block rounded bg-black/30 px-3 py-1 font-mono">04 : 47</span>
      </div>

      <section className="px-5 pt-12 pb-10 max-w-5xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Flame className="w-4 h-4" /> Workshop đặc biệt
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight">
          <span className="text-primary">KOL AI</span> MAKE MONEY
        </h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Bạn đã bao giờ thấy người khác kiếm tiền từ AI và tự hỏi: <strong className="text-foreground">"Tại sao không phải mình?"</strong>
        </p>

        <a href="https://zalo.me/g/pwjvcw931" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-10 py-4 text-base font-extrabold shadow-xl hover:scale-105 transition">
          <Hand className="w-5 h-5" /> Đăng ký ngay – Giữ chỗ
        </a>

        <div className="mt-16 max-w-3xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 aspect-[4/3] flex items-center justify-center shadow-2xl relative">
          <div className="text-center text-stone-900">
            <div className="text-6xl md:text-8xl font-black drop-shadow-xl">Ý TƯỞNG</div>
            <div className="text-6xl md:text-8xl font-black drop-shadow-xl text-orange-700">ĐIÊN RỒ</div>
            <div className="mt-4 text-lg font-bold">CHIA SẺ TỪ THỊNH VUA APP</div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-5 text-left">
          {[
            { t: "Insight thực chiến", d: "Học từ case study thật – không lý thuyết suông." },
            { t: "Công cụ độc quyền", d: "Bộ prompt và workflow Thịnh đang dùng hằng ngày." },
            { t: "Cộng đồng đồng hành", d: "Tham gia nhóm Zalo, học và làm cùng nhau." },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-border bg-background p-6">
              <h3 className="font-bold">{b.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
