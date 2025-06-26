// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { id } = await req.json()

  console.log('id', id)

  let actor = undefined

  try {

    const response = await fetch(`https://api.themoviedb.org/3/person/${id}?append_to_response=credits,external_ids&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })

    actor = await response.json()
  } catch (e) {
    console.error('e', e)
  }

  // Fetch all voice actor roles for this actor
  let voiceRoles = [];
  try {
    const { data, error } = await supabase
      .from('work')
      .select(`id, performance, actor_id, voice_actor_id, highlight, suggestions, status, source_id, voice_actors(id, firstname, lastname, profile_picture, bio, awards, nationality, years_active, date_of_birth, social_media_links)`) // join
      .eq('actor_id', id)
      .not('voice_actor_id', 'is', null);
    if (error) throw error;

    // Count occurrences per voice_actor_id
    const counts = {};
    for (const row of data) {
      if (!row.voice_actor_id) continue;
      counts[row.voice_actor_id] = (counts[row.voice_actor_id] || 0) + 1;
    }
    // Sort by count and get top 3
    const sortedIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => Number(id));
    const top3 = sortedIds.slice(0, 3);

    // Map data to output format, add highlight if in top3
    voiceRoles = data.map(row => ({
      ...row,
      highlight: top3.includes(row.voice_actor_id),
      voiceActorDetails: row.voice_actors ? {
        id: row.voice_actors.id,
        firstname: row.voice_actors.firstname,
        lastname: row.voice_actors.lastname,
        profile_picture: row.voice_actors.profile_picture,
        bio: row.voice_actors.bio,
        awards: row.voice_actors.awards,
        nationality: row.voice_actors.nationality,
        years_active: row.voice_actors.years_active,
        date_of_birth: row.voice_actors.date_of_birth,
        social_media_links: row.voice_actors.social_media_links,
      } : null
    }));
  } catch (e) {
    console.error('voice_roles error', e);
  }

  const result = {
    actor: { ...actor, voice_roles: voiceRoles },
    voiceActors: voiceRoles,
  }

  return new Response(
    JSON.stringify(result),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    },
  )
})