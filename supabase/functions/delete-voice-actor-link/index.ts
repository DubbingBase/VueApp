import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase.ts';

console.log('delete-voice-actor-link function started');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { work_id } = requestData;

    // Validate required fields
    if (!work_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: work_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the work exists before attempting to delete
    const { data: existingWork, error: fetchError } = await supabase
      .from('work')
      .select('*')
      .eq('id', work_id)
      .single();

    if (fetchError || !existingWork) {
      return new Response(
        JSON.stringify({ error: 'Work not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete the work record
    const { error: deleteError } = await supabase
      .from('work')
      .delete()
      .eq('id', work_id);

    if (deleteError) {
      console.error('Error deleting work:', deleteError);
      throw deleteError;
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Voice actor link deleted successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in delete-voice-actor-link:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.details || null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
