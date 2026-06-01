ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kvk_number text,
  ADD COLUMN IF NOT EXISTS repairer_status text NOT NULL DEFAULT 'none';

-- repairer_status: 'none' | 'pending' | 'approved' | 'rejected'