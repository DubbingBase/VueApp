import { createClient } from 'jsr:@supabase/supabase-js';
import { Database } from './database.types.ts';
import { IDatabaseClient } from './interfaces.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Debug logging function
function debugLog(message: string, data?: any) {
  console.log(`[DATABASE] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

debugLog('Initializing database client', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  url: supabaseUrl
});

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);


// Export supabase clients for use in other modules
export { supabase, supabaseAdmin };

export class DatabaseClient implements IDatabaseClient {
  async getWorkWithVoiceActors(contentId: number) {
    const { data, error } = await supabase.from('work')
      .select(`*, voiceActorDetails:voice_actors (*)`)
      .eq('content_id', contentId);

    if (error) throw error;

    return data;
  }

  async getVoiceActorWithWork(voiceActorId: number) {
    debugLog('Fetching voice actor with work', { voiceActorId });

    const { data, error } = await supabase.from('voice_actors')
      .select(`*, work (*)`)
      .eq('id', voiceActorId)
      .single();

    if (error) {
      debugLog('Error fetching voice actor', { error: error.message });
      throw error;
    }

    debugLog('Raw voice actor data received', {
      hasProfilePicture: !!data.profile_picture,
      workCount: data.work?.length || 0
    });

    return data;
  }

  async getWorkByActor(actorId: number) {
    const { data, error } = await supabase
      .from('work')
      .select(`
        *,
        voice_actors (*)
      `)
      .eq('actor_id', actorId);

    if (error) throw error;

    return data;
  }

}
