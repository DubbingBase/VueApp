// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"

async function getActor(actorId: number) {
  try {
    // fetch actor from tmdb
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}?append_to_response=credits,external_ids&language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    });
    
    return await response.json();
  } catch (e) {
    console.error('Error fetching actor details:', e);
    return null;
  }
}

async function fetchMediaDetails(contentId: number, contentType: string) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/${contentType}/${contentId}?language=fr-FR`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
        'Accept': 'application/json',
      },
    });
    
    return await response.json();
  } catch (e) {
    console.error('Error fetching media details:', e);
    return null;
  }
}

// Get voice roles for an actor
async function getVoiceRoles(actorId: number): Promise<VoiceRole[]> {
  try {
    const { data, error } = await supabase
      .from('work')
      .select(`
        *,
        voice_actors (*)
      `)
      .eq('actor_id', actorId)
      
    if (error) throw error;
    if (!data) return [];
    
    // Cast the data to our WorkWithVoiceActor type
    const workData = data as unknown as WorkWithVoiceActor[];

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
          mediaDetails = await fetchMediaDetails(work.content_id, work.content_type);
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { ...corsHeaders }
    });
  }
  
  const { id } = await req.json()

  console.log('id', id)
  

  try {
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing id parameter' }), 
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders 
          },
        }
      );
    }

    const actorId = parseInt(id, 10);
    if (isNaN(actorId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid id parameter' }), 
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders 
          },
        }
      );
    }

    const [actor, voiceRoles] = await Promise.all([
      getActor(actorId),
      getVoiceRoles(actorId)
    ]);

    if (!actor) {
      return new Response(
        JSON.stringify({ error: 'Actor not found' }), 
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders 
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        actor: {
          ...actor,
          voice_roles: voiceRoles,
        },
        voiceActors: voiceRoles,
      }),
      {
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});