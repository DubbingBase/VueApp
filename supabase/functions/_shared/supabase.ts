import { createClient } from 'jsr:@supabase/supabase-js'
import { Database } from './database.types.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
console.log('supabaseUrl', supabaseUrl)
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export {
    supabase
}