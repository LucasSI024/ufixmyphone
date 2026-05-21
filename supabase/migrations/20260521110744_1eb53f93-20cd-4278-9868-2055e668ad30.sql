-- Allow public (anonymous) read access so visitors can browse the marketplace without signing up.
CREATE POLICY "requests viewable by anon"
  ON public.repair_requests FOR SELECT TO anon USING (true);

CREATE POLICY "bids viewable by anon"
  ON public.bids FOR SELECT TO anon USING (true);

CREATE POLICY "profiles viewable by anon"
  ON public.profiles FOR SELECT TO anon USING (true);