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

    const showId = parseInt(id, 10)
    if (isNaN(showId)) {
      return createErrorResponse('Invalid id parameter', 400)
    }

    // Use shared TMDBClient for API calls
    const tmdbClient = new TMDBClient()

    // Fetch show details and aggregate credits in parallel
    const [serie, aggregateCredits] = await Promise.all([
      tmdbClient.get(`tv/${showId}`, {
        append_to_response: 'credits,external_ids'
      }),
      tmdbClient.get(`tv/${showId}/aggregate_credits`).catch(() => null) // Aggregate credits might not be available for all shows
    ])

    // Use shared DatabaseClient for database queries
    const dbClient = new DatabaseClient()
    const voiceActors = await dbClient.getWorkWithVoiceActors(showId)
    const voiceActorsWithImages = voiceActors.map(va => ({
      ...va,
      voiceActorDetails: processVoiceActor(va.voiceActorDetails)
    }))

    const creditsWithImages = processMedia({
      credits: aggregateCredits
    })

    const result = {
      serie: processMedia(serie),
      voiceActors: voiceActorsWithImages,
      aggregateCredits: creditsWithImages.credits
    }

    return createResponse(result)
  } catch (error) {
    console.error('Error in show function:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'An unknown error occurred'
    )
  }
})
