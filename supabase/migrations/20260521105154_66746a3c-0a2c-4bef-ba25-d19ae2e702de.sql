
-- Notifications table
CREATE TYPE public.notification_type AS ENUM (
  'new_bid',
  'bid_accepted',
  'bid_rejected',
  'request_status_changed'
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  request_id uuid,
  bid_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: new bid -> notify request owner
CREATE OR REPLACE FUNCTION public.notify_new_bid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_brand text;
  v_model text;
BEGIN
  SELECT owner_id, device_brand, device_model
    INTO v_owner, v_brand, v_model
  FROM public.repair_requests
  WHERE id = NEW.request_id;

  IF v_owner IS NULL OR v_owner = NEW.repairer_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, request_id, bid_id)
  VALUES (
    v_owner,
    'new_bid',
    'Nieuw bod op je reparatie',
    'Je hebt een bod van €' || NEW.price::text || ' ontvangen voor je ' || v_brand || ' ' || v_model || '.',
    NEW.request_id,
    NEW.id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_bid();

-- Trigger: bid status change -> notify repairer
CREATE OR REPLACE FUNCTION public.notify_bid_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_brand text;
  v_model text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT device_brand, device_model INTO v_brand, v_model
  FROM public.repair_requests WHERE id = NEW.request_id;

  IF NEW.status = 'accepted' THEN
    INSERT INTO public.notifications (user_id, type, title, body, request_id, bid_id)
    VALUES (
      NEW.repairer_id,
      'bid_accepted',
      'Je bod is geaccepteerd! 🎉',
      'Je bod van €' || NEW.price::text || ' op de ' || v_brand || ' ' || v_model || ' is geaccepteerd.',
      NEW.request_id,
      NEW.id
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, body, request_id, bid_id)
    VALUES (
      NEW.repairer_id,
      'bid_rejected',
      'Je bod is helaas niet gekozen',
      'Voor de ' || v_brand || ' ' || v_model || ' is een ander bod gekozen.',
      NEW.request_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_bid_status_change
  AFTER UPDATE OF status ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_bid_status_change();

-- Trigger: request status change -> notify owner + all bidders
CREATE OR REPLACE FUNCTION public.notify_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_label text;
  v_recipient uuid;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  v_label := CASE NEW.status::text
    WHEN 'open' THEN 'weer open'
    WHEN 'in_progress' THEN 'in behandeling'
    WHEN 'completed' THEN 'afgerond'
    WHEN 'cancelled' THEN 'geannuleerd'
    ELSE NEW.status::text
  END;

  -- Notify owner
  INSERT INTO public.notifications (user_id, type, title, body, request_id)
  VALUES (
    NEW.owner_id,
    'request_status_changed',
    'Status bijgewerkt',
    'Je reparatie ' || NEW.device_brand || ' ' || NEW.device_model || ' is nu ' || v_label || '.',
    NEW.id
  );

  -- Notify every bidder (deduped)
  FOR v_recipient IN
    SELECT DISTINCT repairer_id FROM public.bids
    WHERE request_id = NEW.id AND repairer_id <> NEW.owner_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, request_id)
    VALUES (
      v_recipient,
      'request_status_changed',
      'Status bijgewerkt',
      'De reparatie ' || NEW.device_brand || ' ' || NEW.device_model || ' waar je op bood, is nu ' || v_label || '.',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_request_status_change
  AFTER UPDATE OF status ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_request_status_change();
