-- Index the foreign-key columns used by public media detail joins.
-- The project lookup and work-by-project lookup are already covered by
-- existing indexes; these indexes cover actor, voice actor, and crew access.
CREATE INDEX IF NOT EXISTS work_actor_id_idx
  ON public.work (actor_id)
  WHERE actor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS work_voice_actor_id_idx
  ON public.work (voice_actor_id)
  WHERE voice_actor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS dubbing_project_crew_project_id_idx
  ON public.dubbing_project_crew (dubbing_project_id);
