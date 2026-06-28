-- ============================================================
-- AFFILIATE SYSTEM MIGRATION
-- Chay SQL nay trong Supabase SQL Editor
-- ============================================================

-- 1. Tao bang affiliates
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ref_code TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 35.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tao bang theo doi clicks
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  product_key TEXT NOT NULL DEFAULT 'main',
  referrer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Cap nhat bang affiliate_orders (them cot affiliate_id, commission)
-- Neu bang affiliate_orders chua co thi tao moi
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_orders' AND column_name = 'affiliate_id') THEN
    ALTER TABLE public.affiliate_orders ADD COLUMN affiliate_id UUID REFERENCES public.affiliates(id);
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_orders' AND column_name = 'commission_amount') THEN
    ALTER TABLE public.affiliate_orders ADD COLUMN commission_amount NUMERIC(12,0) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_orders' AND column_name = 'commission_status') THEN
    ALTER TABLE public.affiliate_orders ADD COLUMN commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid'));
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_orders' AND column_name = 'commission_approved_at') THEN
    ALTER TABLE public.affiliate_orders ADD COLUMN commission_approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- 4. Index de truy van nhanh
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_orders_affiliate_id ON public.affiliate_orders(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code ON public.affiliates(ref_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);

-- 5. RLS policies
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Affiliates: user co the doc chinh minh, admin doc tat ca
CREATE POLICY "Users can view own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert own affiliate" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Affiliate clicks: affiliate chi doc cua minh, anyone co the insert (tracking)
CREATE POLICY "Affiliates can view own clicks" ON public.affiliate_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can insert clicks" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);

-- Allow anonymous clicks tracking
CREATE POLICY "Anon can insert clicks" ON public.affiliate_clicks
  FOR INSERT TO anon WITH CHECK (true);

-- Admin can manage affiliate_orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_orders' AND policyname = 'Affiliates can view own orders') THEN
    EXECUTE 'CREATE POLICY "Affiliates can view own orders" ON public.affiliate_orders
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin'')
      )';
  END IF;
END $$;

-- 6. Function de lookup affiliate by ref_code (public)
CREATE OR REPLACE FUNCTION public.get_affiliate_by_ref(p_ref_code TEXT)
RETURNS TABLE(id UUID, ref_code TEXT, status TEXT)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT id, ref_code, status FROM public.affiliates WHERE ref_code = p_ref_code AND status = 'active';
$$;
