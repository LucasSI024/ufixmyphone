ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS category text;
CREATE INDEX IF NOT EXISTS idx_repair_requests_category ON public.repair_requests (category);