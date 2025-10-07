// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { TMDBClient } from "../_shared/tmdb.ts"
import { DatabaseClient } from "../_shared/database.ts"
import { createResponse, createErrorResponse, handleOptions } from "../_shared/http-utils.ts"
import { processMedia } from "../_shared/tmdb-urls.ts";
import { processVoiceActor } from "../_shared/supabase-urls.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  try {
    const { id } = await req.json()

    if (!id) {
      return createErrorResponse('Missing id parameter', 400)
    }

    const movieId = parseInt(id, 10)
    if (isNaN(movieId)) {
      return createErrorResponse('Invalid id parameter', 400)
    }

    // Use shared TMDBClient for API calls
    const tmdbClient = new TMDBClient()
    const movie = await tmdbClient.get(`movie/${movieId}`, {
      append_to_response: 'credits,external_ids'
    })
    const movieWithImageUrls = processMedia(movie)

    // Use shared DatabaseClient for database queries
    const dbClient = new DatabaseClient()
    const voiceActors = await dbClient.getWorkWithVoiceActors(movieId)
    const voiceActorsWithImages = voiceActors.map(va => ({
      ...va,
      voiceActorDetails: processVoiceActor(va.voiceActorDetails)
    }))

    const result = {
      movie: movieWithImageUrls,
      voiceActors: voiceActorsWithImages,
    }

    return createResponse(result)
  } catch (error) {
    console.error('Error in movie function:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'An unknown error occurred'
    )
  }
})
