
-- Add Square columns to memberships table (keeping stripe columns for migration period)
ALTER TABLE public.memberships 
  ADD COLUMN IF NOT EXISTS square_customer_id text,
  ADD COLUMN IF NOT EXISTS square_subscription_id text;

-- Add Square columns to match_reveal_purchases
ALTER TABLE public.match_reveal_purchases 
  ADD COLUMN IF NOT EXISTS square_payment_id text,
  ADD COLUMN IF NOT EXISTS square_order_id text;

-- Add Square columns to invoice_history
ALTER TABLE public.invoice_history 
  ADD COLUMN IF NOT EXISTS square_payment_id text,
  ADD COLUMN IF NOT EXISTS square_order_id text;

-- Index for Square lookups
CREATE INDEX IF NOT EXISTS idx_memberships_square_customer_id ON public.memberships(square_customer_id) WHERE square_customer_id IS NOT NULL;
