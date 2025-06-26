// supabase/functions/delete_user/index.ts
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
      }

  const body = await req.json()
  const { userId } = body
  if (!userId) {
    return new Response('Missing userId', { status: 400, headers: corsHeaders })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders })
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
})
