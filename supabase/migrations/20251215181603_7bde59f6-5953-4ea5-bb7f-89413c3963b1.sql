-- Giveaways table
CREATE TABLE public.giveaways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prize_description TEXT,
  points_per_entry INTEGER NOT NULL DEFAULT 100,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_entries_per_customer INTEGER, -- NULL means unlimited
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Giveaway entries table
CREATE TABLE public.giveaway_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  shopify_customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  entry_count INTEGER NOT NULL DEFAULT 1,
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate submissions in same transaction
  UNIQUE(giveaway_id, shopify_customer_id, created_at)
);

-- Indexes
CREATE INDEX idx_giveaways_active ON public.giveaways(is_active, end_date);
CREATE INDEX idx_giveaway_entries_giveaway ON public.giveaway_entries(giveaway_id);
CREATE INDEX idx_giveaway_entries_customer ON public.giveaway_entries(shopify_customer_id);

-- Enable RLS
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

-- Giveaways: Public read for active giveaways
CREATE POLICY "Anyone can view active giveaways"
ON public.giveaways
FOR SELECT
USING (is_active = true AND end_date > now());

-- Admins can manage all giveaways
CREATE POLICY "Admins can manage giveaways"
ON public.giveaways
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage giveaways
CREATE POLICY "Service role can manage giveaways"
ON public.giveaways
FOR ALL
USING (auth.role() = 'service_role');

-- Entries: Service role can manage (for edge functions)
CREATE POLICY "Service role can manage entries"
ON public.giveaway_entries
FOR ALL
USING (auth.role() = 'service_role');

-- Admins can view all entries
CREATE POLICY "Admins can view all entries"
ON public.giveaway_entries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_giveaways_updated_at
BEFORE UPDATE ON public.giveaways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();