
REVOKE EXECUTE ON FUNCTION public.notify_new_bid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_bid_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_request_status_change() FROM PUBLIC, anon, authenticated;
