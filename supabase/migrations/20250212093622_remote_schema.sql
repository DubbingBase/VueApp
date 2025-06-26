set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.voice_actor_name(voice_actors)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select $1.firstname || ' ' || $1.lastname;
$function$
;


