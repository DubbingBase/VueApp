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

  const { query } = await req.json()

  console.log('query', query)

  let resp = undefined

  try {

    const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&page=1language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    })

    resp = await response.json()
  } catch (e) {
    console.error('e', e)
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