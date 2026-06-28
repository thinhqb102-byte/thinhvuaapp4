import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, CheckCircle2, ShoppingCart, LogIn, Crown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PaymentModal } from "@/components/PaymentModal";
import landingThumb from "@/assets/landing-page-thumb.png";
import superPromptThumb from "@/assets/super-prompt-thumb.png";
import khoiNghiepThumb from "@/assets/khoi-nghiep-thumb.png";
import chatgptImage2Thumb from "@/assets/chatgpt-image2-thumb.png";
import troLyAiImage from "@/assets/tro-ly-ai-100.png";
import appAiImage from "@/assets/app-ai-50.png";
import comboTlapImage from "@/assets/combo-tlap.png";
import googleFlowImage from "@/assets/google-flow-thumb.png";
import appWfMyPhamImage from "@/assets/app-wf-my-pham.png";
import appAfTaoKolAiImage from "@/assets/app-af-tao-kol-ai.png";
import appFlThinhVuaImage from "@/assets/app-fl-thinh-vua.jpg";

export const Route = createFileRoute("/truy-cap-app")({
  head: () => ({
    meta: [
      { title: "Truy cập App — Thịnh Vua App" },
      { name: "description", content: "Khám phá bộ công cụ AI mạnh mẽ – 12 công cụ AI được thiết kế dành riêng cho phụ nữ kinh doanh và xây dựng thương hiệu cá nhân." },
    ],
  }),
  component: Page,
});

const apps = [
  { n: 1, title: "HƯỚNG DẪN TẠO LANDING PAGE (WEB), TRANG BÁN HÀNG, TRANG CHUYỂN ĐỔI", desc: "Hướng dẫn chi tiết từ A–Z cách dùng AI để dựng landing page, trang bán hàng và trang chuyển đổi chuyên nghiệp.", price: "6$", priceVnd: "79000", codeFormat: "LOVA<SĐT>", codeExample: "LOVA0367337799", image: landingThumb, previewUrl: "https://www.facebook.com/reel/1001995869073404", productUrl: "https://docs.google.com/document/d/1cCcGRNUi_kypjHUI0uum3l6Moa3cXodTU3HpUvsEOXE/edit?usp=sharing" },
  { n: 2, title: "2$ = QUY TRÌNH TẠO POSTER + FREE CHAT GPT PLUS + KHO POSTER MẪU VỚI TẤT CẢ CÁC NGÀNH NGHỀ", desc: "Trọn bộ giải pháp: quy trình tạo poster chuyên nghiệp từ A–Z, trải nghiệm ChatGPT Plus miễn phí, và kho poster mẫu đa ngành nghề – chỉnh sửa & dùng ngay.", price: "6$", codeFormat: "GPT<SĐT>", codeExample: "GPT0367337799", image: superPromptThumb, productUrl: "https://docs.google.com/document/d/1m4kU9qiPkYhGoTqOhSfnN2llnwjGbWGbgG5rL1Cwb_Y/edit?usp=sharing" },
  { n: 3, title: "GIỚI THIỆU VỀ THỊNH VUA APP VÀ CỘNG ĐỒNG KHỞI NGHIỆP CÙNG AI", desc: "Khám phá Thịnh Vua App và cộng đồng khởi nghiệp cùng AI – kết nối, chia sẻ kinh nghiệm, ứng dụng AI vào thực tế và cùng nhau phát triển.", price: "6$", codeFormat: "KN<SĐT>", codeExample: "KN0367337799", image: khoiNghiepThumb, previewUrl: "https://www.notion.so/TH-NH-VUA-APP-2bb9a30c0fba80cfb660ed69ab475dcb?source=copy_link" },
  { n: 4, title: "FULL QUY TRÌNH KIẾM 100TR MỖI THÁNG VỚI CHAT GPT IMAGE 2", desc: "Trọn bộ quy trình thực chiến giúp bạn khai thác Chat GPT Image 2 để tạo nội dung, sản phẩm và kiếm tới 100 triệu mỗi tháng.", price: "15$", priceVnd: "79000", codeFormat: "GPT2<SĐT>", codeExample: "GPT20367337799", image: chatgptImage2Thumb, previewUrl: "https://www.facebook.com/reel/1455372752581227", productUrl: "https://docs.google.com/document/d/15FeVL2hK1fzVrX2pQB5LzYFsYqGV6iSLlqqO3SF20hE/edit?usp=sharing" },
  { n: 5, title: "QUÀ TẶNG 100+ TRỢ LÝ CHO ĐỦ CÁC NGÀNH NGHỀ", desc: "Bộ sưu tập hơn 100 trợ lý AI được thiết kế chuyên biệt cho đa dạng ngành nghề – sẵn sàng dùng ngay.", price: "6$", codeFormat: "TLA<SĐT>", codeExample: "TLA0367337799", image: troLyAiImage, productUrl: "https://docs.google.com/spreadsheets/d/1C-svW32rngDD5CZrfxmbg1JIUuIyCteD/edit?usp=sharing&ouid=115789862033738051198&rtpof=true&sd=true" },
  { n: 6, title: "QUÀ TẶNG 50+ APP PHỤC VỤ ĐỦ CÁC NGÀNH NGHỀ", desc: "Tổng hợp 50+ ứng dụng AI hữu ích phục vụ đa ngành nghề, giúp tối ưu công việc và tăng năng suất.", price: "6$", codeFormat: "APP<SĐT>", codeExample: "APP0367337799", image: appAiImage, productUrl: "https://docs.google.com/spreadsheets/d/11TBW3yM-WQp_ITYyRKW1VOExcFtpILy_VQ6iiF5A2og/edit?usp=sharing" },
  { n: 7, title: "COMBO 100+ TRỢ LÝ AI + 50+ APP CHO ĐỦ CÁC NGÀNH NGHỀ", desc: "Trọn bộ combo: hơn 100 trợ lý AI và 50+ ứng dụng AI phục vụ đủ ngành nghề – tiết kiệm hơn khi mua chung.", price: "9$", codeFormat: "TLAP<SĐT>", codeExample: "TLAP0367337799", image: comboTlapImage },
  { n: 8, title: "FULL TÀI LIỆU HƯỚNG DẪN BUILD APP TRÊN GOOGLE FLOW TỪ A-Z", desc: "Trọn bộ tài liệu hướng dẫn build app trên Google Flow từ A-Z: không cần code, AI powered, tự tạo app AI chỉ trong 30 phút.", price: "30$", priceVnd: "79000", codeFormat: "FLOW<SĐT>", codeExample: "FLOW0367337799", image: googleFlowImage, previewUrl: "https://youtu.be/VIAI7LLzP8A?si=zZfPAc0p9h3G-QOR", productUrl: "https://docs.google.com/document/d/1LfwQTqo6p5wkaT8J4XiOfFdyeaQ9E5VPY7kOjzYusaA/edit?usp=sharing" },
  { n: 9, title: "APP WF-NGÀNH MỸ PHẨM", desc: "Tạo ảnh/video hàng loạt chỉ bằng một cú click chuột. Ảnh/video sắc nét, cao cấp – chuẩn ngành mỹ phẩm.", price: "9$", codeFormat: "WMP<SĐT>", codeExample: "WMP0367337799", image: appWfMyPhamImage, productUrl: "https://labs.google/fx/tools/flow/shared/tool/60a83d02-0695-44a2-96a2-25652a513ffa" },
  { n: 10, title: "APP AF-TẠO KOL AI", desc: "Bao gồm cả APP và full quy trình hướng dẫn tạo KOL phù hợp với sản phẩm dịch vụ của bạn.", price: "9$", codeFormat: "FKOL<SĐT>", codeExample: "FKOL0367337799", image: appAfTaoKolAiImage, previewUrl: "https://youtu.be/e91nmzVhRaI?si=qUgZqdWno7hKWWTh", productUrl: "https://docs.google.com/document/d/19xhW8z8_ilhvUDQOoSRCrXOt2REjvVrNfXX4uEGiCg8/edit?usp=sharing" },
  { n: 11, title: "APP FL-THỊNH VUA APP", desc: "Tạo ảnh/video CHẤT LƯỢNG CAO.", price: "6$", codeFormat: "FTVA<SĐT>", codeExample: "FTVA0367337799", image: appFlThinhVuaImage, previewUrl: "https://www.facebook.com/reel/966193426016186", productUrl: "https://labs.google/fx/tools/flow/shared/tool/6d4dfaad-189a-474c-a7d3-d026143c5ff8" },
  { n: 12, title: "TÁCH SẢN PHẨM AI", desc: "Tách quần áo, mỹ phẩm khỏi ảnh người mẫu thành ảnh flatlay sang trọng.", price: "6$", codeFormat: "LOVA<SĐT>", codeExample: "LOVA0367337799" },
];

type VipState = "loading" | "not-logged-in" | "vip";

function Page() {
  const [vipState, setVipState] = useState<VipState>("loading");
  const [userInfo, setUserInfo] = useState<{ id: string; name: string; phone: string; email: string } | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof apps[0] | null>(null);
  const [purchasedProducts, setPurchasedProducts] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setVipState("not-logged-in"); return; }

      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).single();
      setUserInfo({ id: user.id, name: profile?.full_name ?? "", phone: profile?.phone ?? "", email: user.email ?? "" });
      setVipState("vip" as VipState);

      const { data: paidOrders } = await (supabase as any)
        .from("product_orders")
        .select("product_key, product_url")
        .eq("customer_email", user.email)
        .eq("status", "paid");

      if (paidOrders && paidOrders.length > 0) {
        const map: Record<string, string> = {};
        paidOrders.forEach((o: any) => {
          if (o.product_url) map[o.product_key] = o.product_url;
        });
        setPurchasedProducts(map);
      }
    })();
  }, []);

  const handleOrder = (app: typeof apps[0]) => {
    setSelectedProduct(app);
    setPaymentModalOpen(true);
  };

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

      <section className="px-5 pt-16 pb-6 max-w-5xl mx-auto text-center">
        <h1 className="font-black tracking-tight font-sans leading-[1.1] flex flex-col items-center gap-2">
          <span className="block text-4xl md:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            SẢN PHẨM SỐ NỔI BẬT
          </span>
          <span className="block text-2xl md:text-3xl text-foreground/80 font-bold">
            của CTY PHẦN MỀM AIGO GROUP
          </span>
        </h1>
        <div className="mt-6 mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary to-primary/40" />
      </section>

      <section className="px-5 pb-20 max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {apps.map((a) => (
          <div key={a.n} className="rounded-2xl overflow-hidden border border-border bg-background hover:shadow-xl hover:-translate-y-1 transition">
            <div className="relative aspect-video w-full bg-gradient-to-br from-[oklch(0.3_0.05_260)] to-[oklch(0.2_0.05_260)] flex items-center justify-center overflow-hidden">
              {a.image ? (
                <img src={a.image} alt={a.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              ) : (
                <Sparkles className="w-12 h-12 text-white/40" />
              )}
              <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/90 grid place-items-center text-xs font-bold z-10">{a.n}</div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-sm leading-snug min-h-[2.5rem]">{a.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{a.desc}</p>

              {(() => {
                const productKey = a.codeFormat.replace(/<[^>]+>/g, "");
                const purchasedUrl = purchasedProducts[productKey];

                if (purchasedUrl) {
                  return (
                    <>
                      <a
                        href={purchasedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full rounded-lg bg-emerald-500 text-white py-2.5 text-sm font-bold hover:bg-emerald-400 transition flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Truy cập sản phẩm
                      </a>
                      <div className="mt-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
                        <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã mua — mở khóa vĩnh viễn
                        </p>
                      </div>
                    </>
                  );
                }

                return (
                  <>
                    {a.previewUrl ? (
                      <a href={a.previewUrl} target="_blank" rel="noopener noreferrer" className="mt-3 w-full rounded-lg border border-primary text-primary py-2 text-sm font-semibold hover:bg-primary/10 transition text-center inline-block">
                        👁 ẤN VÀO ĐÂY XEM TRƯỚC
                      </a>
                    ) : (
                      <button onClick={() => alert("Nội dung xem trước đang được chuẩn bị. Vui lòng liên hệ Zalo 0367337799 để xem demo trực tiếp.")} className="mt-3 w-full rounded-lg border border-primary text-primary py-2 text-sm font-semibold hover:bg-primary/10 transition">
                        👁 ẤN VÀO ĐÂY XEM TRƯỚC
                      </button>
                    )}

                    {vipState === "not-logged-in" ? (
                      <Link to="/affiliate" className="mt-2 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                        <LogIn className="w-4 h-4" /> Đăng nhập để mua
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleOrder(a)}
                        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Mua ngay
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </section>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        product={selectedProduct}
        userInfo={userInfo ? { name: userInfo.name, email: userInfo.email } : null}
        affiliateRef={typeof window !== "undefined" ? localStorage.getItem("affiliate_ref") || undefined : undefined}
      />
    </div>
  );
}
