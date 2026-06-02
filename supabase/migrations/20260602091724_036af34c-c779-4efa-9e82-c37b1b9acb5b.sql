
-- 1) Bids: remove anon SELECT, restrict to owner + bidder
DROP POLICY IF EXISTS "bids viewable by anon" ON public.bids;
DROP POLICY IF EXISTS "bids viewable by authenticated" ON public.bids;
REVOKE SELECT ON public.bids FROM anon;

CREATE POLICY "owner or bidder views bid"
ON public.bids FOR SELECT
TO authenticated
USING (
  auth.uid() = repairer_id
  OR EXISTS (
    SELECT 1 FROM public.repair_requests r
    WHERE r.id = bids.request_id AND r.owner_id = auth.uid()
  )
);

-- 2) Profiles: remove anon SELECT
DROP POLICY IF EXISTS "profiles viewable by anon" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;

-- 3) Repair requests: remove anon SELECT, only authenticated users may read
DROP POLICY IF EXISTS "requests viewable by anon" ON public.repair_requests;
REVOKE SELECT ON public.repair_requests FROM anon;

-- 4) Storage: drop the broad public-listing SELECT policy on repair-photos.
-- The bucket stays public, so public URLs continue to work for direct file access;
-- this only blocks listing/enumeration via the storage.objects API.
DROP POLICY IF EXISTS "Repair photos are publicly viewable" ON storage.objects;

-- 5) Security definer functions: revoke EXECUTE from anon/authenticated.
-- has_role is only used inside RLS policies (runs as definer regardless of caller's EXECUTE grant).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;

-- 6) Realtime authorization: only allow users to subscribe to their own user-scoped notification topic.
-- Convention: clients subscribe to topic 'notifications:<user_id>'.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users subscribe to own notification topic" ON realtime.messages;
CREATE POLICY "users subscribe to own notification topic"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notifications:' || auth.uid()::text
);
