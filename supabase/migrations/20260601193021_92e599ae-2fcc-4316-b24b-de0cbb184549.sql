
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('25ed2f42-f4e6-49f3-b957-06ba5cf663fb', 'admin')
ON CONFLICT DO NOTHING;

-- iPhone pricing tables
CREATE TABLE public.iphone_models (
  key text PRIMARY KEY,
  name text NOT NULL,
  generation text NOT NULL,
  base_storage integer NOT NULL,
  base_value numeric NOT NULL,
  risk_buffer numeric NOT NULL DEFAULT 30,
  defects jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.iphone_models TO anon, authenticated;
GRANT ALL ON public.iphone_models TO service_role;

ALTER TABLE public.iphone_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iphone_models readable by all" ON public.iphone_models
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert iphone_models" ON public.iphone_models
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update iphone_models" ON public.iphone_models
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete iphone_models" ON public.iphone_models
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.iphone_settings (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT iphone_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.iphone_settings TO anon, authenticated;
GRANT ALL ON public.iphone_settings TO service_role;

ALTER TABLE public.iphone_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iphone_settings readable by all" ON public.iphone_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins upsert iphone_settings" ON public.iphone_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update iphone_settings" ON public.iphone_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed default settings from current hardcoded values
INSERT INTO public.iphone_settings (id, data) VALUES (1, '{
  "profitMargin": 65,
  "maxBidPct": 0.78,
  "roundTo": 5,
  "minBid": 20,
  "maxDefectStackPct": 0.78,
  "rangeWidthPct": 0.08,
  "storageOptions": [
    {"gb":64,"correction":0,"label":"64 GB"},
    {"gb":128,"correction":45,"label":"128 GB"},
    {"gb":256,"correction":90,"label":"256 GB"},
    {"gb":512,"correction":160,"label":"512 GB"},
    {"gb":1024,"correction":260,"label":"1 TB"},
    {"gb":2048,"correction":380,"label":"2 TB"}
  ],
  "conditions": [
    {"key":"as_new","label":"Als nieuw","mult":1.00,"hint":"Geen krasjes, ziet er bijna nieuw uit"},
    {"key":"good","label":"Goed","mult":0.93,"hint":"Lichte gebruikssporen"},
    {"key":"fair","label":"Redelijk","mult":0.84,"hint":"Duidelijke krasjes / kleine deukjes"},
    {"key":"heavy","label":"Zwaar gebruikt","mult":0.72,"hint":"Veel slijtage"}
  ],
  "batteries": [
    {"key":"100","label":"90 – 100%","correction":0},
    {"key":"85","label":"85 – 89%","correction":-15},
    {"key":"80","label":"80 – 84%","correction":-30},
    {"key":"75","label":"75 – 79%","correction":-55},
    {"key":"70","label":"70 – 74%","correction":-80},
    {"key":"lt70","label":"Onder 70%","correction":-115},
    {"key":"unknown","label":"Weet ik niet","correction":-50}
  ],
  "locks": [
    {"key":"none","label":"Geen lock — uitgelogd uit iCloud","blocking":false},
    {"key":"icloud","label":"iCloud / Apple ID nog ingelogd","blocking":true},
    {"key":"simlock","label":"Simlock / MDM / bedrijfsbeheer","blocking":true},
    {"key":"stolen","label":"Gestolen / verloren gemeld","blocking":true}
  ]
}'::jsonb);
