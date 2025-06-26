import { createClient } from '@supabase/supabase-js'
import { Database } from '../../supabase/functions/_shared/database.types'

console.log('meta', import.meta)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export {
    supabase
}