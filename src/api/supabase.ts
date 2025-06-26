import { createClient } from '@supabase/supabase-js'

console.log('meta', import.meta)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export {
    supabase
}