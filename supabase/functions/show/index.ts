// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { TMDBClient } from "../_shared/tmdb.ts"
import { TVDBClient } from "../_shared/tvdb.ts"
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
    const serieWithImageUrls = processMedia(serie)

    // Use TVDBClient to get character profile pictures
    const tvdbClient = new TVDBClient()
    let characterProfilePictures: any[] = []

    try {
      // Try to find TheTVDB series ID from TMDB external_ids first
      let tvdbSeriesId: number | null = null

      if (serie.external_ids?.tvdb_id) {
        tvdbSeriesId = serie.external_ids.tvdb_id
        console.log(`Found TVDB series ID from TMDB external_ids: ${tvdbSeriesId}`)
      } else {
        // Fallback to search if no direct external_id
        console.log('No direct TVDB external_id found, searching...')
        const searchQuery = serie.name || serie.original_name
        if (searchQuery) {
          const searchResults = await tvdbClient.searchSeries(searchQuery)
          if (searchResults.data && searchResults.data.length > 0) {
            // Find the best match (could be improved with more sophisticated matching)
            const bestMatch = searchResults.data.find((series: any) =>
              series.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              searchQuery.toLowerCase().includes(series.name?.toLowerCase())
            ) || searchResults.data[0]
            tvdbSeriesId = bestMatch?.id
            console.log(`Found TVDB series ID from search: ${tvdbSeriesId}`)
          }
        }
      }

      // Get character profile pictures if we found a TVDB series ID
      if (tvdbSeriesId) {
        const charactersResponse = await tvdbClient.getSeriesById(tvdbSeriesId, {
          meta: 'episodes',
          short: false
        })
        const characters = charactersResponse.data.characters
        // console.log('characters', characters)
        if (characters && characters.length > 0) {
          characterProfilePictures = characters
            .filter((character: any) => character.image)
            .map((character: any) => ({
              id: character.id,
              name: character.name,
              image: character.image,
              tvdbPeopleId: character.peopleId,
              showId: showId
            }))
          console.log(`Found ${characterProfilePictures.length} character profile pictures`)
        }
      } else {
        console.log('No TVDB series ID found, skipping character profile pictures')
      }
    } catch (tvdbError) {
       console.error('Error fetching character profile pictures from TVDB:', tvdbError)
       // Continue without character profile pictures - don't fail the entire request
     }

     // must match by character name since agregatted credits doesn't have external_ids
     for (const character of characterProfilePictures) {
       console.log('character', character)
       const match = aggregateCredits.cast.find(credit => credit.roles.some(role => role.character === character.name))
       console.log('match', match)
       character.peopleId = match?.id
     }

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
      serie: serieWithImageUrls,
      voiceActors: voiceActorsWithImages,
      aggregateCredits: creditsWithImages.credits,
      characterProfilePictures: characterProfilePictures,
    }

    return createResponse(result)
  } catch (error) {
    console.error('Error in show function:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'An unknown error occurred'
    )
  }
})
