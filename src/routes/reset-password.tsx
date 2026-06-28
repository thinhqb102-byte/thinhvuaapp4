import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Đặt lại mật khẩu — Thịnh Vua App" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Mật khẩu tối thiểu 6 ký tự"); return; }
    if (password !== confirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Đặt lại mật khẩu thành công!"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[oklch(0.99_0.01_60)] px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center"><KeyRound className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black">Đặt lại mật khẩu</h1>
            <p className="text-sm text-muted-foreground">Nhập mật khẩu mới của bạn</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Mật khẩu mới</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-sm font-semibold">Xác nhận mật khẩu</label>
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 disabled:opacity-50 transition">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
