import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Star, Eye, ExternalLink, Bookmark } from "lucide-react";

export const Route = createFileRoute("/cong-cu-ai")({
  head: () => ({
    meta: [
      { title: "Bộ Công Cụ AI Tinh Tuyển — Thịnh Vua App" },
      { name: "description", content: "Tuyển chọn các công cụ AI và nguồn học tập tốt nhất giúp bạn xây kênh, sáng tạo nội dung và kiếm tiền online." },
    ],
  }),
  component: Page,
});

const tools = [
  { name: "ChatGPT", cat: "AI Chatbox", tag: "FREEMIUM", color: "bg-emerald-500", letter: "C", desc: "Trợ lý AI hội thoại của OpenAI – hỏi đáp, viết nội dung, lập kế hoạch và xử lý mọi tác vụ.", rating: 48, views: "5.2K" },
  { name: "Google Gemini", cat: "AI Chatbox", tag: "FREEMIUM", color: "bg-blue-500", letter: "G", desc: "Trợ lý AI đa năng của Google – mạnh về suy luận, kết nối hệ sinh thái Google.", rating: 32, views: "3.8K" },
  { name: "TopView AI", cat: "AI Video", tag: "FREEMIUM", color: "bg-orange-500", letter: "T", desc: "Best AI video review – tạo video review sản phẩm chuyên nghiệp chỉ trong vài phút.", rating: 14, views: "1.8K" },
  { name: "Kling AI", cat: "AI Video", tag: "FREEMIUM", color: "bg-pink-500", letter: "K", desc: "Top công cụ sáng tạo video AI – biến văn bản và hình ảnh thành video sống động.", rating: 22, views: "2.4K" },
  { name: "Lovable", cat: "AI Code", tag: "FREEMIUM", color: "bg-rose-500", letter: "L", desc: "Xây app, web bằng AI chỉ với mô tả – không cần biết code, deploy trong vài phút.", rating: 45, views: "6.1K" },
  { name: "Focusee", cat: "AI Video", tag: "PREMIUM", color: "bg-cyan-500", letter: "F", desc: "Tạo video screen-record chuyên nghiệp với hiệu ứng zoom, focus tự động.", rating: 19, views: "2.1K" },
];

function Page() {
  return (
    <div className="min-h-screen bg-[oklch(0.98_0.01_60)] text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <span className="font-bold">THỊNH <span className="text-primary">VUA APP</span></span>
        </div>
      </header>

      <section className="px-5 pt-16 pb-10 max-w-5xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Sparkles className="w-4 h-4" /> Tổng hợp công cụ AI
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight">
          Bộ <span className="text-primary">Công Cụ AI</span> Tinh Tuyển
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Tuyển chọn các công cụ AI và nguồn học tập tốt nhất giúp bạn xây kênh, sáng tạo nội dung và kiếm tiền online.
        </p>
      </section>

      <section className="px-5 pb-20 max-w-7xl mx-auto">
        <h2 className="text-center text-2xl font-extrabold mb-10">
          <span className="text-primary">✦</span> AI NỔI BẬT NHẤT
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-background p-5 hover:shadow-lg hover:-translate-y-1 transition">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-full ${t.color} grid place-items-center text-white font-bold text-lg`}>{t.letter}</div>
                <Bookmark className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <h3 className="font-bold">{t.name}</h3>
                <span className="text-primary text-xs">✓</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{t.cat}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-800 font-semibold">{t.tag}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{t.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex text-amber-400">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
                  <span>({t.rating})</span>
                  <Eye className="w-3 h-3 ml-1" /> {t.views}
                </div>
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-foreground border border-border rounded-md px-2 py-1 hover:bg-accent">
                  Visit <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
