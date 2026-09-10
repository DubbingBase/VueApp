-- Keep voice actor work associations from becoming orphaned.
ALTER TABLE public.work
  DROP CONSTRAINT IF EXISTS work_voice_actor_id_fkey;

ALTER TABLE public.work
  ADD CONSTRAINT work_voice_actor_id_fkey
  FOREIGN KEY (voice_actor_id)
  REFERENCES public.voice_actors(id)
  ON DELETE CASCADE;
