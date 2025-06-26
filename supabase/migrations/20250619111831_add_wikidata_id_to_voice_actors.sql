-- Add wikidata_id column to voice_actors table
ALTER TABLE public.voice_actors ADD COLUMN wikidata_id text;
