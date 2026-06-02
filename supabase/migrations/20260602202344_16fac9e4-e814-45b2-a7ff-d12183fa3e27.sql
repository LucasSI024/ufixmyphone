
-- 1. Tighten bids INSERT: must be approved repairer
DROP POLICY IF EXISTS "repairer inserts own bid" ON public.bids;
CREATE POLICY "repairer inserts own bid"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = repairer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_repairer = true
      AND p.repairer_status = 'approved'
  )
);

-- 2. Prevent self-promotion: block client-side changes to privileged columns
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses (used by trusted server functions)
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_repairer IS DISTINCT FROM OLD.is_repairer
     OR NEW.repairer_status IS DISTINCT FROM OLD.repairer_status
     OR NEW.kvk_number IS DISTINCT FROM OLD.kvk_number THEN
    RAISE EXCEPTION 'Not allowed: repairer status, KvK number and repairer flag can only be changed by the server.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
