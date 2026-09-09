-- Repair the queue pop RPC contract used by process-media-queue.
--
-- The API selects a named queue, so PostgREST must expose the
-- (p_queue_name text, p_vt_seconds integer) signature. Remove the legacy
-- one-argument overload, which otherwise leaves the RPC schema cache unable
-- to resolve requests with p_queue_name.

DROP FUNCTION IF EXISTS public.pop_media_queue_message(integer);
DROP FUNCTION IF EXISTS public.pop_media_queue_message(text, integer);

CREATE FUNCTION public.pop_media_queue_message(
  p_queue_name text,
  p_vt_seconds integer DEFAULT 30
)
RETURNS TABLE (
  msg_id bigint,
  read_ct integer,
  enqueued_at timestamptz,
  vt timestamptz,
  message jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $$
BEGIN
  IF p_queue_name NOT IN ('wiki_extract', 'wiki_check', 'wiki_discovery') THEN
    RAISE EXCEPTION 'Invalid queue name: %', p_queue_name;
  END IF;

  RETURN QUERY
  SELECT r.msg_id, r.read_ct, r.enqueued_at, r.vt, r.message
  FROM pgmq.read(p_queue_name, p_vt_seconds, 1) AS r;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pop_media_queue_message(text, integer)
  TO authenticated, anon, service_role;

-- Ensure PostgREST immediately discards any cached legacy signature.
NOTIFY pgrst, 'reload schema';
