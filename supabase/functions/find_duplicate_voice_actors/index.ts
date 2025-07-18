import { corsHeaders } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

// Utility to remove accents and lowercase
function normalizeName(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ') // replace any non-alphanum (including dashes) with space
    .replace(/\s+/g, ' ')        // collapse multiple spaces
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Fetch all voice actors
  const { data: actors, error } = await supabaseAdmin.from('voice_actors')
    .select('id, firstname, lastname');
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Group by normalized name
  const groups: Record<string, any[]> = {};
  for (const actor of actors ?? []) {
    const key = normalizeName(actor.firstname || '') + '|' + normalizeName(actor.lastname || '');
    if (!groups[key]) groups[key] = [];
    groups[key].push(actor);
  }

  // Only keep groups with duplicates
  const duplicates = Object.values(groups)
    .filter((arr) => arr.length > 1)
    .map((actors) => ({ actors }));

  return new Response(JSON.stringify(duplicates), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
