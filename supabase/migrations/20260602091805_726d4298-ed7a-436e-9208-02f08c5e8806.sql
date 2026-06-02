
-- Restore anon read for the public marketplace
GRANT SELECT ON public.repair_requests TO anon;
CREATE POLICY "requests viewable by anon"
ON public.repair_requests FOR SELECT
TO anon
USING (true);

GRANT SELECT ON public.profiles TO anon;
CREATE POLICY "profiles viewable by anon"
ON public.profiles FOR SELECT
TO anon
USING (true);
