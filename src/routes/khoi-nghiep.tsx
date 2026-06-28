import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/khoi-nghiep")({
  head: () => ({
    meta: [
      { title: "Khởi nghiệp với AI — Thịnh Vua App" },
      { name: "description", content: "7 ngày khởi nghiệp cùng App ảnh AI – biến AI thành công cụ tạo thu nhập thực sự, kể cả khi bạn chưa biết gì về công nghệ!" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-[oklch(0.99_0.02_60)]">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <span className="font-bold">THỊNH <span className="text-primary">VUA APP</span></span>
        </div>
      </header>

      <section className="px-5 pt-16 pb-10 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          7 Ngày <span className="text-primary">khởi nghiệp</span><br />cùng App ảnh AI
        </h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Biến AI thành công cụ tạo thu nhập thực sự, <u className="decoration-primary">kể cả khi bạn chưa biết gì về công nghệ!</u>
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["Không cần kinh nghiệm", "Hướng dẫn từng bước", "Cộng đồng hỗ trợ"].map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-5 py-2.5 text-sm font-semibold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" /> {t}
            </span>
          ))}
        </div>

        <a href="https://zalo.me/g/pwjvcw931" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.2_45)] text-primary-foreground px-10 py-4 text-base font-extrabold shadow-xl hover:scale-105 transition">
          THAM GIA NHÓM ZALO NGAY →
        </a>

        <div className="mt-16 max-w-2xl mx-auto rounded-3xl bg-background border border-border shadow-lg p-8">
          <div className="inline-flex items-center gap-2 text-sm font-semibold">
            <Clock className="w-5 h-5 text-primary" /> Ưu đãi kết thúc sau
          </div>
          <div className="mt-6 grid grid-cols-4 gap-3">
            {[["02", "NGÀY"], ["23", "GIỜ"], ["59", "PHÚT"], ["55", "GIÂY"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-gradient-to-br from-primary/80 to-[oklch(0.7_0.18_200)] text-white p-4 text-center">
                <div className="text-3xl font-black">{n}</div>
                <div className="text-xs mt-1 opacity-90">{l}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">⚡ Đừng bỏ lỡ cơ hội tham gia đợt này!</p>
          <p className="text-sm text-muted-foreground">⚡ Số lượng tham gia có giới hạn mỗi đợt</p>
        </div>
      </section>
    </div>
  );
}
