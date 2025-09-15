import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"
import { Database } from "../_shared/database.types.ts"
import { Movie } from "../_shared/movie.ts";
import { Serie } from "../_shared/serie.ts";

type VoiceActor = Database['public']['Tables']['voice_actors']['Row']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      )
    }

    // Check if request body contains targetUserId for admin impersonation
    let targetUser = user
    let voiceActorId = user.user_metadata?.voice_actor_id

    if (req.method === 'POST') {
      const body = await req.json()
      const targetUserId = body?.targetUserId

      if (targetUserId) {
        // Check if current user is admin
        const isAdmin = user.app_metadata?.role === 'admin' ||
                       user.user_metadata?.role === 'admin' ||
                       user.role === 'admin'

        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Admin access required' }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 403
            }
          )
        }

        // Get target user data
        const { data: targetUserData, error: targetError } = await supabase.auth.admin.getUserById(targetUserId)
        if (targetError || !targetUserData.user) {
          return new Response(
            JSON.stringify({ error: 'Target user not found' }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404
            }
          )
        }

        targetUser = targetUserData.user
        voiceActorId = targetUser.user_metadata?.voice_actor_id
      }
    }

    if (!voiceActorId) {
      return new Response(
        JSON.stringify({ voiceActor: null, medias: [] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Fetch voice actor data with work entries
    const { data: voiceActorData, error: vaError } = await supabase
      .from('voice_actors')
      .select(`*,
        work (
          *
        )`)
      .eq('id', voiceActorId)
      .single()

    if (vaError) {
      console.error('Error fetching voice actor:', vaError)
      return new Response(
        JSON.stringify({ error: 'Voice actor not found' }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      )
    }

    const result: {
      voiceActor: VoiceActor;
      medias: (Movie | Serie)[];
    } = {
      voiceActor: voiceActorData as unknown as VoiceActor,
      medias: []
    }

    // Fetch media details for each work entry
    const workEntries = (voiceActorData as any).work || []
    for (const work of workEntries) {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/${work.content_type}/${work.content_id}?append_to_response=credits,external_ids&language=fr-FR`, {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
            'Accept': 'application/json',
          },
        })

        const tmdbMedia = await response.json() as Movie | Serie

        result.medias.push({
          ...tmdbMedia,
          media_type: work.content_type as "movie" | "tv"
        } as Movie | Serie)
      } catch (e) {
        console.error('Error fetching media:', e)
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
