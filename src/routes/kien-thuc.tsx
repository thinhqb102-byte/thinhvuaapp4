import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Gift } from "lucide-react";
import chatgptPlusImage from "@/assets/chatgpt-plus.png";
import posterGuideImage from "@/assets/poster-guide.png";
import whopClipingImage from "@/assets/whop-cliping.jpg";
import troLyAiImage from "@/assets/tro-ly-ai-100.png";
import appAiImage from "@/assets/app-ai-50.png";

export const Route = createFileRoute("/kien-thuc")({
  head: () => ({
    meta: [
      { title: "Kiến thức & Quà tặng — Thịnh Vua App" },
      { name: "description", content: "Tổng hợp các bài viết, checklist, bộ công thức và quà tặng độc quyền giúp bạn xây dựng thương hiệu, ứng dụng AI và tạo nội dung viral." },
    ],
  }),
  component: Page,
});

const cards = [
  { tag: "QUÀ TẶNG ĐẶC BIỆT", title: "QUI TRÌNH TẠO POSTER BÁN HÀNG TỪ 1 ẢNH NGƯỜI MẪU BẤT KỲ MÀ BẠN THÍCH", desc: "Hướng dẫn chi tiết quy trình tạo poster bán hàng chuyên nghiệp chỉ từ 1 ảnh người mẫu bất kỳ bạn thích.", url: "https://docs.google.com/document/d/1CoiDASWpxS9EhTpzZTC5SFEnIPcJgYGsnEZ_YPNL4uI/edit?usp=sharing" },
  { tag: "HƯỚNG DẪN AI", title: "Hướng Dẫn Cách Nhận 1 Tháng ChatGPT Plus FREE Và Hủy Gói An Toàn", desc: "Hướng dẫn chi tiết từng bước để nhận miễn phí và quản lý gói an toàn.", url: "https://docs.google.com/document/d/1Qxq9ph0O8DibRkFyfWA9C0dpQUREjOsltVh_arYgxHI/edit?usp=sharing" },
  { tag: "KIẾM TIỀN QUỐC TẾ", title: "HƯỚNG DẪN KIẾM TIỀN TRÊN QUỐC TẾ (WHOP - CLIPING) - CHI TIẾT TỪNG BƯỚC", desc: "Hướng dẫn chi tiết từng bước kiếm tiền trên nền tảng quốc tế Whop và Cliping.", url: "https://docs.google.com/document/d/1Z4ihQeX5ZziCd9EAq6bwVrodwZ3K5zHbhWHYaGSysCw/edit?usp=sharing" },
];

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

      <section className="px-5 pt-16 pb-12 max-w-5xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <BookOpen className="w-4 h-4" /> THƯ VIỆN KIẾN THỨC
        </span>
        <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight">
          Kiến thức & Quà tặng <span className="text-primary">THỊNH VUA APP</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Tổng hợp các bài viết, checklist, bộ công thức và quà tặng độc quyền giúp bạn xây dựng thương hiệu, ứng dụng AI và tạo nội dung viral.
        </p>
      </section>

      <section className="px-5 pb-20 max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {cards.map((c) => {
          const Wrapper: any = c.url ? "a" : "div";
          const wrapperProps = c.url ? { href: c.url, target: "_blank", rel: "noopener noreferrer" } : {};
          return (
            <Wrapper key={c.title} {...wrapperProps} className="group rounded-2xl overflow-hidden border border-border bg-background hover:shadow-xl transition block">
              <div className="relative aspect-video w-full bg-gradient-to-br from-primary to-[oklch(0.7_0.2_45)] flex items-center justify-center text-white text-center p-6 overflow-hidden">
                {c.tag.includes("HƯỚNG") ? (
                  <img src={chatgptPlusImage} alt="ChatGPT Plus Free" className="absolute inset-0 w-full h-full object-cover" />
                ) : c.tag.includes("TRỢ LÝ AI") ? (
                  <img src={troLyAiImage} alt="Quà tặng 100+ Trợ lý AI" className="absolute inset-0 w-full h-full object-cover" />
                ) : c.tag.includes("APP AI") ? (
                  <img src={appAiImage} alt="Quà tặng 50+ App AI" className="absolute inset-0 w-full h-full object-cover" />
                ) : c.tag.includes("QUÀ") ? (
                  <img src={posterGuideImage} alt="Quy trình tạo poster bán hàng" className="absolute inset-0 w-full h-full object-cover" />
                ) : c.tag.includes("KIẾM TIỀN") ? (
                  <img src={whopClipingImage} alt="Hướng dẫn kiếm tiền Whop Cliping" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Gift className="absolute top-4 right-4 w-6 h-6 opacity-50" />
                    <div>
                      <div className="text-3xl font-black uppercase">200 HOOK</div>
                      <div className="mt-2 text-sm opacity-90">GIỮ CHÂN NGƯỜI XEM</div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs font-bold text-primary tracking-wider">🎁 {c.tag}</div>
                <h3 className="mt-2 font-bold text-lg leading-snug group-hover:text-primary transition">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.desc}</p>
              </div>
            </Wrapper>
          );
        })}
      </section>
    </div>
  );
}
