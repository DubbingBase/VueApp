// supabase/functions/list_users/index.ts
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
    console.log("req", req.method);
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
      }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders })
  }
  return new Response(JSON.stringify({ users: data.users }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
})
