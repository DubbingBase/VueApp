// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"
import { Tables } from "../_shared/database.types.ts"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { query } = await req.json()

  console.log('query', query)

  const trimmedQuery = query.trim()

  let resp = []

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${trimmedQuery}&page=1&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })

    const res = await response.json()
    resp.push(...res.results)
  } catch (e) {
    console.error('e', e)
  }

  try {
    const supabaseQuery = trimmedQuery.split(' ').map((x: string) => `'${x}'`).join(' | ')
    console.log('supabaseQuery', supabaseQuery)
    const { data, error } = await supabase
      .from('voice_actors')
      .select()
      .textSearch('voice_actor_name', supabaseQuery)
    console.log('data', data)
    console.log('error', error)
    if (data && Array.isArray(data)) {
      // Create a map for resp to handle merging and deduplication
      const respMap = new Map()
      resp.forEach(item => {
        respMap.set(item.id, item)
      })
      // Process voice_actors
      data.forEach((voiceActor) => {
        const key = voiceActor.tmdb_id
        if (respMap.has(key)) {
          const person = respMap.get(key)
          respMap.set(key, {
            ...voiceActor,
            actor: person,
            profile_path: person.profile_path,
            popularity: person.popularity,
            media_type: 'voice_actor'
          })
        } else {
          respMap.set(key, { ...voiceActor, media_type: 'voice_actor' })
        }
      })
      // Update resp with deduplicated results
      resp = Array.from(respMap.values())
    }
  } catch (e) {
    console.log('e', e)
  }

  return new Response(
    JSON.stringify(resp),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    },
  )
})
