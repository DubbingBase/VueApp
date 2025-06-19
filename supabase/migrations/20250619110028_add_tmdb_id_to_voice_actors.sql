-- Add tmdb_id column to voice_actors table
ALTER TABLE public.voice_actors ADD COLUMN tmdb_id bigint;
