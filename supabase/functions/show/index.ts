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

  let serie = undefined

  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?append_to_response=credits,external_ids&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })

    serie = await response.json()
  } catch (e) {
    console.error('e', e)
  }

  // Fetch aggregate credits data
  let aggregateCredits = null
  try {
    const creditsResponse = await fetch(`https://api.themoviedb.org/3/tv/${id}/aggregate_credits`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })

    if (creditsResponse.ok) {
      aggregateCredits = await creditsResponse.json()
    } else {
      console.error('Failed to fetch aggregate credits:', creditsResponse.status, creditsResponse.statusText)
    }
  } catch (e) {
    console.error('Error fetching aggregate credits:', e)
  }

  let va: unknown[] = []

  try {
    const { data, error } = await supabase.from('work')
      .select(`
        *,
        voiceActorDetails:voice_actors (
          id,
          firstname,
          lastname,
          bio,
          nationality,
          date_of_birth,
          awards,
          years_active,
          social_media_links
        )
      `)
      // .select(`
      //   id,
      //   content_id,
      //   actor_id,
      //   voice_actors (
      //     id,
      //     name,
      //   )
      //   `)
      .eq('content_id', id)
    if (error) throw error

    va = data
  } catch (e) {
    console.error('e', e)
  }

  console.log('va', va)

  const result = {
    serie,
    voiceActors: va,
    aggregateCredits
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
