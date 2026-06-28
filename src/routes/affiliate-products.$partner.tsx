import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/affiliate-products/$partner")({
  component: AffiliateProductsPage,
});

const PARTNER_DATA: Record<string, { name: string; products: { title: string; desc: string; link: string }[] }> = {
  "thinh-vua-app": {
    name: "THỊNH VUA APP",
    products: [
      { title: "Sản phẩm số của Thịnh Vua App", desc: "Xem toàn bộ sản phẩm số – công cụ AI, khoá học, quy trình kiếm tiền.", link: "/truy-cap-app" },
    ],
  },
  "phong-menly": {
    name: "PHONG MENLY",
    products: [
      { title: "Mật Mã Tự Do – Affiliate x AI", desc: "Combo 5 chìa khoá làm chủ hệ thống Affiliate x AI, mở ra cánh cửa tự do.", link: "https://phongmenlyai.com/?ref=thinhvuaapp" },
      { title: "KOL AI System", desc: "Hệ thống xây dựng KOL AI chuyên nghiệp, tạo thu nhập thụ động.", link: "https://kolaisystem.com/?ref=thinhvuaapp" },
    ],
  },
  "son-piaz": {
    name: "SƠN PIAZ",
    products: [
      { title: "Sản phẩm đang cập nhật", desc: "Danh sách sản phẩm affiliate của Sơn Piaz sẽ được cập nhật sớm.", link: "#" },
    ],
  },
  "pham-thanh-long": {
    name: "PHẠM THÀNH LONG",
    products: [
      { title: "Sản phẩm đang cập nhật", desc: "Danh sách sản phẩm affiliate của Phạm Thành Long sẽ được cập nhật sớm.", link: "#" },
    ],
  },
  "san-pham-vat-ly": {
    name: "SẢN PHẨM VẬT LÝ HỖ TRỢ LÀM VIỆC ONLINE",
    products: [
      { title: "Micro thu âm chuyên nghiệp", desc: "Micro condenser chất lượng cao cho livestream, podcast và ghi âm video.", link: "#" },
      { title: "Loa Bluetooth di động", desc: "Loa không dây công suất lớn, âm thanh sống động cho họp online và giải trí.", link: "#" },
      { title: "Tai nghe chống ồn", desc: "Tai nghe over-ear chống ồn chủ động, thoải mái cho làm việc dài giờ.", link: "#" },
      { title: "Webcam HD / Camera livestream", desc: "Camera chất lượng cao cho livestream bán hàng, họp video và tạo nội dung.", link: "#" },
      { title: "Laptop / Máy tính làm việc", desc: "Laptop cấu hình mạnh cho chỉnh sửa video, thiết kế và chạy ứng dụng AI.", link: "#" },
      { title: "Kệ điện thoại & Giá đỡ", desc: "Kệ đỡ điện thoại đa năng cho quay video, livestream và làm việc hands-free.", link: "#" },
      { title: "Đèn LED ring light", desc: "Đèn vòng LED hỗ trợ ánh sáng chuyên nghiệp cho livestream và quay video.", link: "#" },
      { title: "Bàn phím & Chuột không dây", desc: "Combo bàn phím chuột ergonomic cho làm việc hiệu quả và thoải mái.", link: "#" },
      { title: "Màn hình phụ / Monitor", desc: "Màn hình thứ 2 mở rộng không gian làm việc, tăng năng suất.", link: "#" },
      { title: "Phông nền xanh / Green screen", desc: "Phông nền chuyên dụng cho livestream và quay video chuyên nghiệp.", link: "#" },
    ],
  },
};

function AffiliateProductsPage() {
  const { partner } = useParams({ from: "/affiliate-products/$partner" });
  const data = PARTNER_DATA[partner];

  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy đối tác</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-primary font-semibold">
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success("Đã copy link!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <span className="font-bold text-sm sm:text-base">AFFILIATE <span className="text-primary">{data.name}</span></span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-center">
          Sản phẩm số của <span className="text-primary">{data.name}</span>
        </h1>
        <p className="mt-3 text-center text-muted-foreground text-sm max-w-lg mx-auto">
          Chọn sản phẩm, copy link affiliate và chia sẻ để nhận hoa hồng.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          {data.products.map((p, i) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex items-center gap-4 hover:shadow-lg transition">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-extrabold text-lg">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base">{p.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.link !== "#" && (
                  <>
                    <button
                      onClick={() => copyLink(p.link)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-accent transition"
                    >
                      <Copy className="w-4 h-4" /> Copy link
                    </button>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold hover:opacity-90 transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Xem
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
