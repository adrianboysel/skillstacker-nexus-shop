-- Points transaction log for rewards system
CREATE TABLE public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_order_id TEXT NOT NULL UNIQUE, -- Ensures idempotency
  shopify_customer_id TEXT NOT NULL,
  customer_email TEXT,
  points_earned INTEGER NOT NULL DEFAULT 0,
  points_type TEXT NOT NULL DEFAULT 'order', -- 'order', 'refund', 'adjustment'
  order_details JSONB, -- Store product breakdown
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for customer lookups
CREATE INDEX idx_points_transactions_customer ON public.points_transactions(shopify_customer_id);
CREATE INDEX idx_points_transactions_order ON public.points_transactions(shopify_order_id);

-- Enable RLS
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can manage points transactions"
ON public.points_transactions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can manage points"
ON public.points_transactions
FOR ALL
USING (auth.role() = 'service_role');