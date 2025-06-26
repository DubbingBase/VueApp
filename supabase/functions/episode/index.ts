// Supabase Edge Function: episode
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { id, season_number, episode_number } = await req.json()
  if (!id || season_number === undefined || episode_number === undefined) {
    return new Response(JSON.stringify({ error: 'Missing id, season_number or episode_number' }), { status: 400, headers: corsHeaders })
  }

  try {
    // Fetch episode details
    const episodeRes = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season_number}/episode/${episode_number}?append_to_response=credits,external_ids&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })
    const episode = await episodeRes.json()

    // Fetch voice actors from the database for this episode
    let dbVoiceActors = [];
    try {
      const { data, error } = await supabase.from('work')
      .select(`
        *,
        voiceActorDetails:voice_actors (
          *
        )
      `)
      .eq('content_id', id)
      if (error) throw error;
      dbVoiceActors = data;
    } catch (e) {
      dbVoiceActors = [];
    }

    return new Response(JSON.stringify({ episode, db_voice_actors: dbVoiceActors }), { status: 200, headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    } })
  }
});