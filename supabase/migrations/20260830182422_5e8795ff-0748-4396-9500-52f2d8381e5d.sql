
CREATE TABLE IF NOT EXISTS public.product_types (
  slug text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'package',
  is_active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_types TO anon;
GRANT SELECT ON public.product_types TO authenticated;
GRANT ALL ON public.product_types TO service_role;

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_types readable by all" ON public.product_types;
CREATE POLICY "product_types readable by all" ON public.product_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins insert product_types" ON public.product_types;
CREATE POLICY "admins insert product_types" ON public.product_types FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins update product_types" ON public.product_types;
CREATE POLICY "admins update product_types" ON public.product_types FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins delete product_types" ON public.product_types;
CREATE POLICY "admins delete product_types" ON public.product_types FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.product_types (slug, name, icon, is_active, sort_order) VALUES
  ('phone', 'Telefoon', 'smartphone', true, 10),
  ('tablet', 'Tablet', 'tablet', false, 20),
  ('laptop', 'Laptop', 'laptop', false, 30),
  ('smartwatch', 'Smartwatch', 'watch', false, 40),
  ('console', 'Spelcomputer', 'gamepad-2', false, 50)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.repair_requests
  ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'repair',
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'phone',
  ADD COLUMN IF NOT EXISTS product_details jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$ BEGIN
  ALTER TABLE public.repair_requests ADD CONSTRAINT repair_requests_listing_type_check CHECK (listing_type IN ('repair','sell'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.repair_requests ADD CONSTRAINT repair_requests_product_type_fkey FOREIGN KEY (product_type) REFERENCES public.product_types(slug);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE public.repair_requests SET listing_type = 'sell' WHERE category = 'iPhone inkoop' AND listing_type <> 'sell';

CREATE INDEX IF NOT EXISTS repair_requests_listing_type_idx ON public.repair_requests (listing_type, product_type, status);

ALTER TABLE public.bids
  ADD COLUMN IF NOT EXISTS offer_type text NOT NULL DEFAULT 'repair',
  ADD COLUMN IF NOT EXISTS inspection_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS revised_price numeric,
  ADD COLUMN IF NOT EXISTS revised_reason text,
  ADD COLUMN IF NOT EXISTS revised_at timestamptz,
  ADD COLUMN IF NOT EXISTS revised_response text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS settled_price numeric;

DO $$ BEGIN
  ALTER TABLE public.bids ADD CONSTRAINT bids_offer_type_check CHECK (offer_type IN ('repair','buy'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.bids ADD CONSTRAINT bids_inspection_status_check CHECK (inspection_status IN ('not_started','awaiting_inspection','confirmed','deviated','paid'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.bids ADD CONSTRAINT bids_revised_response_check CHECK (revised_response IN ('none','pending','accepted','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE public.bids b SET offer_type = 'buy'
FROM public.repair_requests r
WHERE r.id = b.request_id AND r.listing_type = 'sell' AND b.offer_type <> 'buy';
