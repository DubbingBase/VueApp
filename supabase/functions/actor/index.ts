// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { TMDBClient } from "../_shared/tmdb.ts"
import { DatabaseClient } from "../_shared/database.ts"
import { createResponse, createErrorResponse, handleOptions } from "../_shared/http-utils.ts"

async function getActor(actorId: number, tmdbClient: TMDBClient) {
  try {
    // Use shared TMDBClient for API calls
    return await tmdbClient.get(`person/${actorId}`, {
      append_to_response: 'credits,external_ids'
    });
  } catch (e) {
    console.error('Error fetching actor details:', e);
    return null;
  }
}

async function fetchMediaDetails(contentId: number, contentType: string, tmdbClient: TMDBClient) {
  try {
    // Use shared TMDBClient for API calls
    return await tmdbClient.get(`${contentType}/${contentId}`);
  } catch (e) {
    console.error('Error fetching media details:', e);
    return null;
  }
}

// Get voice roles for an actor
async function getVoiceRoles(actorId: number, tmdbClient: TMDBClient, dbClient: DatabaseClient): Promise<VoiceRole[]> {
  try {
    // Use shared DatabaseClient for database queries
    const workData = await dbClient.getWorkByActor(actorId);

    if (!workData) return [];

    // Count occurrences per voice_actor_id
    const counts: Record<number, number> = {};
    for (const row of workData) {
      if (!row.voice_actor_id) continue;
      counts[row.voice_actor_id] = (counts[row.voice_actor_id] || 0) + 1;
    }

    // Get top 3 most common voice_actor_ids
    const top3 = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => parseInt(id, 10));

    // Map data to output format, add highlight if in top3
    const voiceRoles = await Promise.all(
      workData.map(async (row) => {
        const { voice_actors, ...work } = row;
        let mediaDetails = null;

        if (work.content_id && work.content_type) {
          mediaDetails = await fetchMediaDetails(work.content_id, work.content_type, tmdbClient);
        }

        return {
          ...work,
          highlight: top3.includes(work.voice_actor_id),
          voice_actors: voice_actors ? [{
            id: voice_actors.id,
            firstname: voice_actors.firstname,
            lastname: voice_actors.lastname,
            profile_path: voice_actors.profile_path,
            gender: voice_actors.gender,
            popularity: voice_actors.popularity,
            known_for_department: voice_actors.known_for_department,
            character: voice_actors.character,
            social_media_links: voice_actors.social_media_links as SocialMediaLinks
          }] : [],
          mediaDetails: mediaDetails ? {
            id: mediaDetails.id,
            title: mediaDetails.title || mediaDetails.name,
            original_title: mediaDetails.original_title || mediaDetails.original_name,
            poster_path: mediaDetails.poster_path,
            release_date: mediaDetails.release_date || mediaDetails.first_air_date,
            media_type: work.content_type || '',
            overview: mediaDetails.overview
          } : null
        };
      })
    ) as VoiceRole[];

    return voiceRoles;
  } catch (e) {
    console.error('Error fetching voice roles:', e);
    return [];
  }
}

// Main request handler
Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  try {
    const { id } = await req.json()

    if (!id) {
      return createErrorResponse('Missing id parameter', 400)
    }

    const actorId = parseInt(id, 10)
    if (isNaN(actorId)) {
      return createErrorResponse('Invalid id parameter', 400)
    }

    // Initialize shared clients
    const tmdbClient = new TMDBClient()
    const dbClient = new DatabaseClient()

    const [actor, voiceRoles] = await Promise.all([
      getActor(actorId, tmdbClient),
      getVoiceRoles(actorId, tmdbClient, dbClient)
    ]);

    if (!actor) {
      return createErrorResponse('Actor not found', 404)
    }

    const result = {
      actor: {
        ...actor,
        voice_roles: voiceRoles,
      },
      voiceActors: voiceRoles,
    }

    return createResponse(result)
  } catch (error) {
    console.error('Error in actor function:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'An unknown error occurred'
    )
  }
});
