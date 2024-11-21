import { createClient } from 'jsr:@supabase/supabase-js'
import { Database } from './database.types.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
console.log('supabaseUrl', supabaseUrl)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export {
    supabase
}