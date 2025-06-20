import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase.ts'
import { Database } from '../_shared/database.types.ts'

console.log('link-voice-actor function started')

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()

    const { actor_id, work_type, voice_actor_id, performance, content_id } = requestData

    if (!actor_id || !work_type || !voice_actor_id || !content_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: actor_id, work_type, voice_actor_id, performance, and content_id are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate content_type
    const validContentTypes = ['movie', 'tv', 'season', 'episode']
    if (!validContentTypes.includes(work_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid content_type. Must be one of: movie, tv, season, episode' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify voice actor exists
    const { data: voiceActor, error: voiceActorError } = await supabase
      .from('voice_actors')
      .select('*')
      .eq('id', voice_actor_id)
      .single()

    if (voiceActorError || !voiceActor) {
      return new Response(
        JSON.stringify({ error: 'Voice actor not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if the link already exists
    const { data: existingLink, error: linkCheckError } = await supabase
      .from('work')
      .select('*')
      .eq('actor_id', actor_id)
      .eq('voice_actor_id', voice_actor_id)
      .maybeSingle()

    if (linkCheckError) {
      console.error('Error checking for existing link:', linkCheckError)
      throw linkCheckError
    }

    let result
    
    if (existingLink) {
      result = existingLink
    } else {
      // Create new link
      const insertData: Database['public']['Tables']['work']['Insert'] = {
        actor_id,
        content_type: work_type,
        voice_actor_id,
        performance: performance || 'dialogues',
        status: 'user',
        content_id,
      }
      
      const { data, error } = await supabase
        .from('work')
        .insert(insertData)
        .select()
        .single()
      
      if (error) throw error
      result = data
    }

    // Get the full voice actor details to return
    const { data: voiceActorDetails, error: detailsError } = await supabase
      .from('voice_actors')
      .select('*')
      .eq('id', voice_actor_id)
      .single()

    if (detailsError) throw detailsError

    const response = {
      ...result,
      voiceActorDetails: voiceActorDetails
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in link-voice-actor:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.details || null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
