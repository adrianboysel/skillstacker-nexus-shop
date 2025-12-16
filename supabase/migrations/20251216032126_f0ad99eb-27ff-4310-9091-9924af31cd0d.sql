-- Make end_date nullable for giveaways
ALTER TABLE public.giveaways ALTER COLUMN end_date DROP NOT NULL;

-- Update the RLS policy to allow viewing giveaways without end dates
DROP POLICY IF EXISTS "Anyone can view active giveaways" ON public.giveaways;

CREATE POLICY "Anyone can view active giveaways" 
ON public.giveaways 
FOR SELECT 
USING ((is_active = true) AND (end_date IS NULL OR end_date > now()));