-- Materialize the normalized name tokens used by the duplicate scan so the
-- array-overlap candidate lookup can use GIN indexes instead of comparing
-- every voice actor pair.
ALTER TABLE public.voice_actors
  ADD COLUMN duplicate_first_name_tokens text[]
  GENERATED ALWAYS AS (
    string_to_array(public.normalize_actor_name(firstname), ' ')
  ) STORED,
  ADD COLUMN duplicate_last_name_tokens text[]
  GENERATED ALWAYS AS (
    string_to_array(public.normalize_actor_name(lastname), ' ')
  ) STORED;

CREATE INDEX voice_actors_duplicate_first_name_tokens_gin_idx
  ON public.voice_actors USING gin (duplicate_first_name_tokens);

CREATE INDEX voice_actors_duplicate_last_name_tokens_gin_idx
  ON public.voice_actors USING gin (duplicate_last_name_tokens);

CREATE OR REPLACE FUNCTION public.find_duplicate_voice_actors_rpc()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
WITH duplicate_pairs AS (
  SELECT
    a.id AS id1,
    b.id AS id2
  FROM public.voice_actors a
  JOIN public.voice_actors b
    ON a.id < b.id
    AND a.duplicate_first_name_tokens && b.duplicate_first_name_tokens
    AND a.duplicate_last_name_tokens && b.duplicate_last_name_tokens
    AND (
      (
        a.duplicate_first_name_tokens <@ b.duplicate_first_name_tokens
        AND a.duplicate_last_name_tokens <@ b.duplicate_last_name_tokens
      )
      OR (
        b.duplicate_first_name_tokens <@ a.duplicate_first_name_tokens
        AND b.duplicate_last_name_tokens <@ a.duplicate_last_name_tokens
      )
    )
),
grouped AS (
  SELECT id1, array_agg(id2 ORDER BY id2) AS id2s
  FROM duplicate_pairs
  GROUP BY id1
)
SELECT COALESCE(
  json_agg(
    json_build_object(
      'actors', (
        SELECT json_agg(
          json_build_object(
            'id', v.id,
            'firstname', v.firstname,
            'lastname', v.lastname,
            'bio', v.bio,
            'nationality', v.nationality,
            'date_of_birth', v.date_of_birth,
            'tmdb_id', v.tmdb_id,
            'wikidata_id', v.wikidata_id,
            'profile_picture', v.profile_picture
          )
          ORDER BY v.id
        )
        FROM public.voice_actors v
        WHERE v.id = ANY (g.id2s || g.id1)
      )
    )
    ORDER BY g.id1
  ),
  '[]'::json
)
FROM grouped g;
$$;
