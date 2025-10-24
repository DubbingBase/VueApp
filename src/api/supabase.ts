import { createClient } from '@supabase/supabase-js'
import { Database } from '../../supabase/functions/_shared/database.types'
import { fetch } from '@tauri-apps/plugin-http';
import { isTauri } from '@/utils/tauri';

console.log('meta', JSON.stringify(import.meta))

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

console.log('supabaseUrl', supabaseUrl)
console.log('isTauri', isTauri)

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: isTauri ? fetch : undefined,
    }
})

export {
    supabase
}
