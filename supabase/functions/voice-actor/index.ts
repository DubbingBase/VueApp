// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"
import { Database, Json } from "../_shared/database.types.ts"
import { Movie, MovieResponse } from "../_shared/movie.ts";
import { Serie } from "../_shared/serie.ts";

type TODO_VoiceActorDbResponse = Database['public']['Tables']['voice_actors']['Row']

export interface Work {
  id: number
  actor_id: number
  content_id: number
  content_type: string | null
  highlight: boolean | null
  performance: string | null
  source_id: number | null
  status: string | null
  suggestions: string | null
  voice_actor_id: number | null
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { id } = await req.json()

  console.log('id', id)

  let va: TODO_VoiceActorDbResponse | undefined = undefined

  try {
    const { data, error } = await supabase.from('voice_actors')
      .select(`*,
        work (
          *
        )`)
      .eq('id', id)
      .single()
    if (error) throw error

    va = data as unknown as TODO_VoiceActorDbResponse
  } catch (e) {
    console.error('e', e)
  }

  console.log('va', va)

  if (!va) {
    return new Response(
      JSON.stringify({
        error: 'no va'
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      },
    )
  }

  const result: {
    voiceActor: TODO_VoiceActorDbResponse;
    medias: (Movie | Serie)[];
  } = {
    voiceActor: va,
    medias: []
  }
  for (const work of va.work) {
    try {
      console.log('work', work)
      const response = await fetch(`https://api.themoviedb.org/3/${work.content_type}/${work.content_id}?append_to_response=credits,external_ids&language=fr-FR`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
          'Accept': 'application/json',
        },
      })

      const tmdbMedia = await response.json() as Movie | Serie

      // console.log('tmdbMedia', tmdbMedia)

      result.medias.push({
        ...tmdbMedia,
        media_type: work.content_type as "movie" | "tv"
      } as Movie | Serie)
    } catch (e) {
      console.error('e', e)
    }
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
