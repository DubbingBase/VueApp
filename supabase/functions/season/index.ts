// Supabase Edge Function: season
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"

Deno.serve(async (req) => {
    console.log('a')
  if (req.method === 'OPTIONS') {
    console.log('c')
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('b')

  const { id, season_number, episode_number } = await req.json()
  if (!id || season_number === undefined) {
    return new Response(JSON.stringify({ error: 'Missing id or season_number' }), { status: 400, headers: corsHeaders })
  }

  console.log('id', id)
  console.log('season_number', season_number)
  console.log('episode_number', episode_number)

  try {
    // Always fetch the season (with episodes array)
    const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season_number}?append_to_response=credits,external_ids&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })
    const season = await seasonRes.json()

    // Fetch voice actors from the database for this season
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

    return new Response(JSON.stringify({ season, db_voice_actors: dbVoiceActors }), { status: 200, headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    } });
  }
})