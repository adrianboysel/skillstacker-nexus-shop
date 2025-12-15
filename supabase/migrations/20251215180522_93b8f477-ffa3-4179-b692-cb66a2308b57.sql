-- Log table for tracking product points changes (audit trail)
CREATE TABLE public.points_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id TEXT NOT NULL,
  product_title TEXT,
  old_points_value INTEGER,
  new_points_value INTEGER NOT NULL,
  changed_by_email TEXT,
  changed_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for product lookups
CREATE INDEX idx_points_change_log_product ON public.points_change_log(shopify_product_id);
CREATE INDEX idx_points_change_log_date ON public.points_change_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.points_change_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view points change log"
ON public.points_change_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert points change log"
ON public.points_change_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage (for edge functions)
CREATE POLICY "Service role can manage points log"
ON public.points_change_log
FOR ALL
USING (auth.role() = 'service_role');