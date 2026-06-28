import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/hoc-ai")({
  head: () => ({
    meta: [
      { title: "Học AI cho người mới — Thịnh Vua App" },
      { name: "description", content: "Xây dựng hệ thống KOL AI bán hàng. Bạn sẽ không còn bất kỳ rào cản nào ngăn bạn lại trên hành trình kiếm tiền online." },
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

      <section className="px-5 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary uppercase">
          Xây dựng hệ thống<br />KOL AI bán hàng
        </h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Bạn sẽ không còn bất kỳ rào cản nào ngăn bạn lại trên hành trình kiếm tiền online
        </p>
      </section>

      <section className="px-5 pb-20 max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-200 via-orange-300 to-amber-400 aspect-video flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <PlayCircle className="relative w-24 h-24 text-white drop-shadow-2xl hover:scale-110 transition cursor-pointer" />
          <div className="absolute bottom-6 left-6 right-6 text-white text-center">
            <div className="text-2xl md:text-3xl font-black drop-shadow-lg">HỌC AI TỪ A-Z</div>
            <div className="text-sm md:text-base font-semibold opacity-95 drop-shadow">LỘ TRÌNH CHUẨN 2026 NGƯỜI MỚI BẮT ĐẦU</div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { num: "01", title: "Nền tảng AI", desc: "Hiểu AI từ căn bản – chọn công cụ phù hợp với bạn." },
            { num: "02", title: "Thực hành", desc: "Làm thật từng buổi – có sản phẩm sau mỗi bài học." },
            { num: "03", title: "Kiếm tiền", desc: "Áp dụng AI để bán hàng, xây kênh và tạo thu nhập." },
          ].map((s) => (
            <div key={s.num} className="rounded-2xl border border-border bg-background p-6 hover:shadow-md transition">
              <div className="text-4xl font-black text-primary">{s.num}</div>
              <h3 className="mt-3 font-bold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
