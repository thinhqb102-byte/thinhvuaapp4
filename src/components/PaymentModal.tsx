import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { createOrder, checkOrderStatus } from "@/lib/payment-server-fns";

interface PaymentProduct {
  n: number;
  title: string;
  price: string;
  priceVnd?: string;
  codeFormat: string;
  productUrl?: string;
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PaymentProduct | null;
  userInfo?: { name: string; email: string } | null;
  affiliateRef?: string;
}

const USD_TO_VND = 27000;

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, "")) || 0;
}

function getCodePrefix(codeFormat: string): string {
  return codeFormat.replace(/<[^>]+>/g, "");
}

export function PaymentModal({ open, onOpenChange, product, userInfo, affiliateRef }: PaymentModalProps) {
  const [step, setStep] = useState<"info" | "qr" | "success">("info");
  const [email, setEmail] = useState(userInfo?.email ?? "");
  const [name, setName] = useState(userInfo?.name ?? "");
  const [orderCode, setOrderCode] = useState("");
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amountVnd = product ? parsePrice(product.priceVnd || "") || Math.round(parsePrice(product.price) * USD_TO_VND / 3) : 0;

  useEffect(() => {
    if (open) {
      setStep("info");
      setEmail(userInfo?.email ?? "");
      setName(userInfo?.name ?? "");
      setOrderCode("");
      setCreating(false);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
  }, [open, userInfo]);

  useEffect(() => {
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  }, []);

  const handleBuy = async () => {
    if (!product) return;
    if (!email || !email.includes("@")) { toast.error("Vui lòng nhập email hợp lệ"); return; }
    setCreating(true);
    try {
      const prefix = getCodePrefix(product.codeFormat);
      const result = await createOrder({
        data: {
          customerEmail: email,
          customerName: name || email.split("@")[0],
          productKey: prefix,
          productTitle: product.title,
          codePrefix: prefix,
          amount: amountVnd,
          affiliateRef,
          productUrl: product.productUrl,
        },
      });
      if (!result.ok) { toast.error(result.error ?? "Không thể tạo đơn hàng"); setCreating(false); return; }
      setOrderCode(result.orderCode!);
      setStep("qr");
      setCreating(false);

      pollRef.current = setInterval(async () => {
        try {
          const r = await checkOrderStatus({ data: { orderCode: result.orderCode! } });
          if (r.status === "paid") {
            setStep("success");
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            toast.success("Thanh toán thành công!");
          }
        } catch {}
      }, 5000);
    } catch {
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
      setCreating(false);
    }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Đã sao chép!"); };

  if (!product) return null;

  const qrUrl = `https://qr.sepay.vn/img?acc=2210189178888&bank=MB&amount=${amountVnd}&des=${orderCode}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-[#1a1a2e] text-white border-none rounded-2xl">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center">
          <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>

          {step === "success" ? (
            <div className="py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black">Thanh toán thành công!</h2>
              <p className="text-sm text-white/60 mt-2">Đơn hàng <span className="font-mono font-bold text-amber-400">{orderCode}</span> đã được thanh toán.</p>
              <p className="text-sm text-white/60 mt-1">Sản phẩm cũng được gửi về email <span className="font-bold text-white">{email}</span></p>
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full rounded-xl bg-amber-500 text-black py-3.5 font-black text-base hover:bg-amber-400 transition text-center"
                >
                  👉 Truy cập sản phẩm ngay
                </a>
              )}
              <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-400">
                Nếu chưa nhận được email, liên hệ Zalo: <span className="font-bold">0367337799</span>
              </div>
              <button onClick={() => onOpenChange(false)} className="mt-3 w-full rounded-xl bg-emerald-500 text-white py-3 font-bold hover:bg-emerald-400 transition">
                Đóng
              </button>
            </div>
          ) : step === "qr" ? (
            <>
              <h2 className="text-xl font-black">{product.title}</h2>
              <p className="text-sm text-white/50 mt-1">Mã đơn: {orderCode}</p>

              <div className="mt-4 text-center">
                <div className="text-sm text-white/50">Số tiền chuyển</div>
                <div className="text-3xl font-black text-amber-400 mt-1">{amountVnd.toLocaleString("vi-VN")}đ</div>
              </div>

              <div className="mt-4 bg-white rounded-2xl p-3 mx-auto max-w-[260px]">
                <img src={qrUrl} alt="QR Thanh toán" className="w-full h-auto" loading="eager" />
              </div>

              <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4 text-left text-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Quét QR — nội dung & số tiền tự động điền, <span className="underline">không cần sửa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Số TK:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold font-mono">2210 1891 78888</span>
                    <button onClick={() => copy("2210189178888")} className="p-1 hover:bg-white/10 rounded"><Copy className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Ngân hàng:</span>
                  <span className="font-bold">MBBank · PHẠM VĂN THỊNH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Nội dung CK:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-amber-400 font-mono">{orderCode}</span>
                    <button onClick={() => copy(orderCode)} className="p-1 hover:bg-white/10 rounded"><Copy className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold animate-pulse">Đang chờ thanh toán...</span>
              </div>
              <p className="text-xs text-white/30 mt-2">Mở app ngân hàng → quét QR → xác nhận chuyển tiền. Hệ thống tự mở khoá ngay khi nhận được tiền.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black">Mở khoá: {product.title}</h2>
              <p className="text-sm text-white/50 mt-1">Nhập thông tin để nhận sản phẩm sau khi thanh toán</p>

              <div className="mt-5 text-center">
                <div className="text-sm text-white/50">Số tiền</div>
                <div className="text-4xl font-black text-amber-400 mt-1">{amountVnd.toLocaleString("vi-VN")}đ</div>
              </div>

              <div className="mt-6 space-y-4 text-left">
                <div>
                  <label className="text-sm font-semibold text-white/80">Tên của bạn</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/80">Email nhận sản phẩm <span className="text-amber-400">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" required
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                  <p className="text-xs text-white/30 mt-1">Sản phẩm sẽ được gửi về email này sau khi thanh toán</p>
                </div>
              </div>

              <button onClick={handleBuy} disabled={creating || !email}
                className="mt-6 w-full rounded-xl bg-amber-500 text-black py-3.5 font-black text-base hover:bg-amber-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo đơn...</> : "⚡ Mua ngay"}
              </button>

              <p className="text-xs text-white/30 mt-3 text-center">
                ⚡ Mua ngay → hiện QR thanh toán ngay · Hệ thống tự mở khoá khi nhận được tiền
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
