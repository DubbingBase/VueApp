import { createClient } from 'jsr:@supabase/supabase-js'
import { Database } from './database.types.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
console.log('supabaseUrl', supabaseUrl)
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

export {
    supabase,
    supabaseAdmin
}