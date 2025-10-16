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

    // Use TVDBClient to get character profile pictures
    const tvdbClient = new TVDBClient()
    let characterProfilePictures: any[] = []

    try {
      // Try to find TheTVDB series ID from TMDB external_ids first
      let tvdbSeriesId: number | null = null

      if (movie.external_ids?.tvdb_id) {
        tvdbSeriesId = movie.external_ids.tvdb_id
        console.log(`Found TVDB series ID from TMDB external_ids: ${tvdbSeriesId}`)
      } else {
        // Fallback to search if no direct external_id
        console.log('No direct TVDB external_id found, searching...')
        const searchQuery = movie.title || movie.original_title
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
        const charactersResponse = await tvdbClient.getCharactersBySeries(tvdbSeriesId)
        if (charactersResponse.data && charactersResponse.data.length > 0) {
          characterProfilePictures = charactersResponse.data
            .filter((character: any) => character.image)
            .map((character: any) => ({
              id: character.id,
              name: character.name,
              image: character.image,
              movieId: movieId
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
      characterProfilePictures: characterProfilePictures,
    }

    return createResponse(result)
  } catch (error) {
    console.error('Error in movie function:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'An unknown error occurred'
    )
  }
})
