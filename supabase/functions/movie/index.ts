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
  console.log('typeof id', typeof id)

  let movie = undefined

  try {

    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?append_to_response=credits,external_ids&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })

    movie = await response.json()
  } catch (e) {
    console.error('e', e)
  }

  let va: unknown[] = []

  try {
    const { data, error } = await supabase.from('work')
      .select(`
        *,
        voiceActorDetails:voice_actors (
          *
        )
      `)
      .eq('content_id', id)
    if (error) {
      console.error('error', error)
      throw error
    }

    va = data
  } catch (e) {
    console.error('e', e)
  }

  console.log('va', va)

  const result = {
    movie,
    voiceActors: va,
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