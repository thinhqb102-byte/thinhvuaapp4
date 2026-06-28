# Skill: ThinhVuaApp — Affiliate Marketing Platform Builder

Khi user yêu cầu tạo trang affiliate marketing, nền tảng bán sản phẩm số, hoặc nói "dùng skill thinhvuaapp", hãy áp dụng toàn bộ blueprint dưới đây.

---

## Tech Stack

- **Framework**: TanStack Start + Vite + React (SSR, file-based routing)
- **Database + Auth + Storage**: Supabase (PostgreSQL, Google OAuth, RLS, RPC, Storage buckets)
- **Payment**: VietQR QR code + SePay webhook tự động xác nhận thanh toán
- **Email**: Nodemailer + Gmail App Password
- **Deploy**: Vercel (auto-deploy từ GitHub)
- **Server functions**: `createServerFn` từ `@tanstack/react-start` — chạy server-side, bypass RLS bằng service role key
- **Nitro server routes**: `server/api/` cho webhook endpoints
- **UI**: Tailwind CSS + Lucide Icons + Sonner toast

---

## Cấu Trúc Project

```
src/routes/
  __root.tsx              — Root layout, OG meta tags, auth listener
  index.tsx               — Trang chủ (sidebar + hero + category links)
  affiliate.tsx           — Đăng ký/đăng nhập affiliate (Google OAuth + email/password)
  affiliate-dashboard.tsx — Dashboard affiliate (4 tabs: Tổng quan, Vinh danh, Đối tác, Thanh toán)
  truy-cap-app.tsx        — Trang sản phẩm số (danh sách SP, mua hàng, unlock sau thanh toán)
  admin.tsx               — Quản trị viên (3 tabs: Thành viên, Đơn hàng, Affiliates)
  auth.tsx                — Auth page (redirect to affiliate-dashboard)
  dashboard.tsx           — Redirect to affiliate-dashboard

src/components/
  PaymentModal.tsx        — Modal thanh toán: hiện QR VietQR, polling trạng thái, hiện link SP khi paid

src/lib/
  payment-server-fns.ts   — Server functions:
    - createOrder: tạo đơn hàng trong product_orders
    - checkOrderStatus: polling trạng thái đơn
    - uploadAvatarServer: upload avatar lên Supabase Storage (service role)
    - getLeaderboardServer: lấy bảng xếp hạng + avatar/display_name (service role)
    - deleteMemberServer: xoá toàn bộ dữ liệu user (service role)

server/api/
  sepay-webhook.post.ts   — Nhận webhook từ SePay: match order → paid → auto-create affiliate → commission → email

src/integrations/supabase/
  client.ts               — Supabase client với anon key (VITE_ prefix)

src/styles.css            — Tailwind config + custom animations (shine, slideIn)
```

---

## Database Schema (Supabase)

### Table: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Auto-created via trigger on auth.users insert
```

### Table: affiliates
```sql
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ref_code TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  commission_rate INTEGER DEFAULT 35,
  status TEXT DEFAULT 'active',
  referred_by TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_owner TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: affiliate_clicks
```sql
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  product_key TEXT,
  referrer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: affiliate_orders
```sql
CREATE TABLE affiliate_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  product_title TEXT,
  amount TEXT,
  commission_amount INTEGER,
  commission_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  commission_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: product_orders
```sql
CREATE TABLE product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  product_key TEXT,
  product_title TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  affiliate_ref TEXT,
  product_url TEXT,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: user_roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL
);
-- Admin: INSERT INTO user_roles (user_id, role) VALUES ('user-uuid', 'admin');
```

### RPC Functions
```sql
-- get_leaderboard: top 20 affiliates by orders + clicks
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE(affiliate_id UUID, full_name TEXT, ref_code TEXT, total_clicks BIGINT, total_orders BIGINT) AS $$
  SELECT a.id, a.full_name, a.ref_code,
    COALESCE((SELECT COUNT(*) FROM affiliate_clicks WHERE affiliate_id = a.id), 0) AS total_clicks,
    COALESCE((SELECT COUNT(*) FROM affiliate_orders WHERE affiliate_id = a.id AND status = 'confirmed'), 0) AS total_orders
  FROM affiliates a WHERE a.status = 'active'
  ORDER BY total_orders DESC, total_clicks DESC LIMIT 20;
$$ LANGUAGE sql STABLE;

-- get_affiliate_by_ref
CREATE OR REPLACE FUNCTION get_affiliate_by_ref(p_ref_code TEXT)
RETURNS SETOF affiliates AS $$
  SELECT * FROM affiliates WHERE ref_code = p_ref_code LIMIT 1;
$$ LANGUAGE sql STABLE;
```

### Storage
- Bucket: `avatars` (public) — ảnh đại diện affiliate

---

## Quy Trình Chính

### 1. Google OAuth (SSR-safe — KHÔNG dùng supabase.auth.signInWithOAuth)
```tsx
const handleGoogle = () => {
  const supabaseUrl = "https://xxx.supabase.co";
  const redirectTo = encodeURIComponent(`${window.location.origin}/affiliate-dashboard`);
  window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
};
```
**Lý do**: `supabase.auth.signInWithOAuth` không hoạt động đúng với SSR frameworks. Direct URL redirect luôn work.

### 2. Ref Tracking (Affiliate Link)
```tsx
// Trên trang chủ: lưu ref code vào localStorage
const ref = new URLSearchParams(window.location.search).get("ref");
if (ref) {
  localStorage.setItem("affiliate_ref", ref);
  // Record click via RPC
  const { data: aff } = await supabase.rpc("get_affiliate_by_ref", { p_ref_code: ref });
  if (aff?.[0]) await supabase.from("affiliate_clicks").insert({ affiliate_id: aff[0].id, product_key: "main" });
}

// Khi tạo affiliate mới: lưu referred_by từ localStorage
const savedRef = localStorage.getItem("affiliate_ref") || null;
await supabase.from("affiliates").insert({ ..., referred_by: savedRef });
```

### 3. Thanh Toán VietQR + SePay Webhook
```
Quy trình:
1. User chọn SP → mở PaymentModal
2. createOrder server fn → tạo product_orders (status: pending)
3. Hiện QR: qr.sepay.vn/img?acc=STK&bank=BANK&amount=X&addInfo=ORDER_CODE
4. Polling checkOrderStatus mỗi 5s
5. SePay gửi POST /api/sepay-webhook khi nhận tiền
6. Webhook: match order_code trong content → update status=paid
7. Auto-create affiliate record cho buyer (nếu chưa có)
8. Tạo commission cho referrer (nếu có referred_by)
9. Gửi email xác nhận + link sản phẩm
10. Frontend detect paid → hiện "Mở khoá thành công" + link SP
```

### 4. Auto-Approve Affiliate (trong webhook)
```typescript
// Sau khi order paid, check + auto-create affiliate
const { data: existingAff } = await supabase.from("affiliates").select("id").eq("email", order.customer_email).maybeSingle();
if (!existingAff) {
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const matchedUser = authUsers?.users?.find(u => u.email === order.customer_email);
  await supabase.from("affiliates").insert({
    user_id: matchedUser?.id || null,
    ref_code: baseCode + Math.floor(Math.random() * 9000 + 1000),
    full_name: order.customer_name,
    email: order.customer_email,
    commission_rate: 35, status: "active",
    referred_by: order.affiliate_ref || null,
  });
}
```

### 5. Commission System
```
- referred_by: lưu 1 lần khi đăng ký affiliate (từ localStorage affiliate_ref)
- Webhook tìm referrer: buyerAff.referred_by || order.affiliate_ref
- Commission = Math.round(order.amount * referrer.commission_rate / 100)
- Default rate: 35%
- Bảo đảm: 15 ngày trước khi confirmed
```

### 6. Server Function Pattern (bypass RLS)
```typescript
import { createServerFn } from "@tanstack/react-start";

export const myServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { param1: string }) => data)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // Dùng service role key → full access, bypass RLS
    const { data: result, error } = await supabase.from("table").select("*");
    return { ok: true, result };
  });
```

### 7. Admin Check
```typescript
const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
const isAdmin = roles?.some(r => r.role === "admin");
```

---

## Giao Diện Chi Tiết

### Trang Chủ (index.tsx)
- **Desktop**: sidebar trái cố định (w-72) + main content (flex-1) + avatar dropdown góc phải header
- **Mobile**: hamburger → sidebar trượt từ trái (dark theme, animate slideIn)
- **Sidebar luôn hiện** cả khi chưa đăng nhập (hiện nút "Đăng nhập/Đăng ký" thay user card)
- Menu: Sản Phẩm Số, Dashboard Affiliate (check hasAffiliate), Tư vấn (tel:), Hỗ trợ (zalo.me/)
- Header: logo + VI/EN toggle + Dark/Light mode toggle
- Hero: ảnh + heading + 5 category affiliate links (grid)
- Dashboard Affiliate click: nếu chưa có affiliate → popup "Mua ít nhất 1 SP..."

### Affiliate Dashboard (affiliate-dashboard.tsx)
- **Chặn truy cập** nếu chưa có affiliate record → hiện trang "Kích hoạt Affiliate" + nút "Mua sản phẩm ngay"
- **Tab Tổng quan**: 4 stat cards, biểu đồ clicks (7/28/60/90 ngày), link giới thiệu + tuỳ chỉnh ref code, bảng đơn hàng
- **Tab Vinh danh**: Hồ sơ hiển thị (upload avatar + tên qua server fn), Bảng vinh danh Top 20 (avatar + display_name từ server fn)
- **Tab Đối tác**: cấp độ (Đối tác 30-35%, Vàng 40%, Đại sứ 50%), progress bar
- **Tab Thanh toán**: rút tiền, form nhập/sửa tài khoản ngân hàng (STK, chủ TK, tên NH), lịch sử hoa hồng

### Admin (admin.tsx)
- **Tab Thành viên**: list users, hiện STK/chủ TK/tên NH từ affiliates, badge Affiliate, nút Duyệt/Xoá
- **Tab Đơn hàng**: list affiliate_orders
- **Tab Affiliates**: list affiliates + clicks/orders/commission stats

### Trang Sản Phẩm (truy-cap-app.tsx)
- Grid sản phẩm số (12 SP), mỗi SP có giá, thumbnail
- Unlock chỉ khi đã mua + thanh toán (check product_orders status=paid)
- PaymentModal: QR VietQR + polling + hiện link SP khi paid

---

## Deploy Vercel — Checklist

### Environment Variables (7 biến bắt buộc)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...anon...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
GMAIL_USER=email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
SEPAY_API_KEY=xxx
```
- `VITE_` prefix = client-side (build time inject)
- Không `VITE_` = server-side only (runtime)

### 10 Bước Tạo Project Mới
1. Copy code từ project gốc → xoá `.git` → init git mới
2. Tạo **Supabase project mới** → chạy SQL migrations (tables + RPC + RLS policies)
3. Tạo Storage bucket `avatars` (public)
4. Cập nhật `.env` với Supabase keys mới
5. Tạo **GitHub repo** → push code
6. Import vào **Vercel** → thêm 7 env vars → deploy
7. Cấu hình **Google OAuth** (Google Cloud Console → OAuth consent → add redirect URI → Supabase Auth → enable Google provider)
8. Cấu hình **SePay webhook** URL: `https://domain.vercel.app/api/sepay-webhook`
9. Thêm **admin role**: `INSERT INTO user_roles (user_id, role) VALUES ('uuid', 'admin')`
10. Test: đăng ký → mua SP → thanh toán → check affiliate auto-created → check commission

---

## Các Lỗi Thường Gặp & Cách Fix

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| Google OAuth không redirect | Dùng `supabase.auth.signInWithOAuth` với SSR | Dùng direct URL redirect |
| RLS chặn delete/update | Client dùng anon key | Tạo server function với service role key |
| Vercel build lỗi env vars | Thiếu `VITE_` prefix | Client vars cần `VITE_` prefix |
| Webhook không match order | SePay content có text thừa | Dùng `content.includes(orderCode)` thay vì exact match |
| Avatar upload "Bucket not found" | Chưa tạo Storage bucket | Tạo bucket `avatars` (public) qua API hoặc Dashboard |
| Maximum call stack (avatar) | `...new Uint8Array()` spread trên file lớn | Dùng `FileReader.readAsDataURL` → split(",")[1] |
| Leaderboard không hiện avatar người khác | RLS chặn đọc affiliates khác | Dùng server function với service role |
| Git push bị block | Email git không match GitHub | `git config user.email "github-email"` |
| Google OAuth "Testing" mode | App chưa publish | Google Cloud Console → OAuth consent → Publish app |
