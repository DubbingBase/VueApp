import { corsHeaders } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

// Utility to create a key for duplicate detection
function duplicateKey(row: { content_id: number; actor_id: number; voice_actor_id: number | null }): string {
  return `${row.content_id}|${row.actor_id}|${row.voice_actor_id ?? 'null'}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Fetch all work rows
  const { data: works, error } = await supabaseAdmin.from('work')
    .select('id, content_id, actor_id, voice_actor_id, status, performance, content_type');
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Group by duplicate key
  const groups: Record<string, any[]> = {};
  for (const work of works ?? []) {
    const key = duplicateKey(work);
    if (!groups[key]) groups[key] = [];
    groups[key].push(work);
  }

  // Only keep groups with duplicates
  const duplicates = Object.values(groups)
    .filter((arr) => arr.length > 1)
    .map((works) => ({ works }));

  return new Response(JSON.stringify(duplicates), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
