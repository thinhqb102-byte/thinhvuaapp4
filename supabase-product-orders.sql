-- Run this in Supabase SQL Editor to create the product_orders table
-- This table stores orders for the automated payment system

CREATE TABLE IF NOT EXISTS public.product_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_email text,
  customer_name text,
  product_key text NOT NULL,
  product_title text,
  amount integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  paid_at timestamptz,
  email_sent boolean DEFAULT false,
  affiliate_ref text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert orders (for creating orders from the frontend)
CREATE POLICY "Anyone can insert orders"
  ON public.product_orders
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view orders (needed for polling order status)
CREATE POLICY "Users can view own orders"
  ON public.product_orders
  FOR SELECT
  USING (true);

-- Policy: Service role has full access (for webhook updates)
CREATE POLICY "Service role full access orders"
  ON public.product_orders
  FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast lookup by order_code (used by webhook matching)
CREATE INDEX IF NOT EXISTS idx_product_orders_order_code
  ON public.product_orders (order_code);

-- Index for finding pending orders (used by status polling)
CREATE INDEX IF NOT EXISTS idx_product_orders_status
  ON public.product_orders (status)
  WHERE status = 'pending';
