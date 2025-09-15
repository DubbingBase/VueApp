import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"
import { Database } from "../_shared/database.types.ts"

type VoiceActor = Database['public']['Tables']['voice_actors']['Row']
type VoiceActorUpdate = Database['public']['Tables']['voice_actors']['Update']

interface UpdateVoiceActorRequest {
  voice_actor_id: number;
  updates: Partial<{
    firstname: string;
    lastname: string;
    bio: string;
    nationality: string;
    date_of_birth: string;
    awards: string;
    years_active: string;
    social_media_links: any;
  }>;
  targetUserId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405
      }
    )
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

    // Parse request body
    const { voice_actor_id, updates, targetUserId }: UpdateVoiceActorRequest = await req.json()

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin' ||
                   user.user_metadata?.role === 'admin' ||
                   user.role === 'admin'

    // If targetUserId is provided, verify admin access
    if (targetUserId) {
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin access required' }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403
          }
        )
      }

      // Get target user and verify they own this voice actor
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

      const targetUserVoiceActorId = targetUserData.user.user_metadata?.voice_actor_id
      if (targetUserVoiceActorId !== voice_actor_id) {
        return new Response(
          JSON.stringify({ error: 'Target user does not own this voice actor profile' }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403
          }
        )
      }
    } else {
      // For non-admin users, verify they own this voice actor
      const userVoiceActorId = user.user_metadata?.voice_actor_id
      if (!isAdmin && userVoiceActorId !== voice_actor_id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: You can only update your own profile' }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403
          }
        )
      }
    }

    // Update voice actor
    const { data: updatedVoiceActor, error: updateError } = await supabase
      .from('voice_actors')
      .update(updates as any)
      .eq('id', voice_actor_id as any)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating voice actor:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update voice actor' }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      )
    }

    return new Response(
      JSON.stringify({ voiceActor: updatedVoiceActor }),
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
