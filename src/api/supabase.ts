import { createClient } from "@supabase/supabase-js";
import { Database } from "../../supabase/functions/_shared/database.types";
import { fetch } from "@tauri-apps/plugin-http";
import { isTauri } from "@/utils/tauri";

import { debug, error, info, trace, warn } from "@tauri-apps/plugin-log";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isTauri) {
    info("meta:" + JSON.stringify(import.meta));
    info("supabaseUrl:" + supabaseUrl);
    info("isTauri:" + isTauri);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: isTauri ? fetch : undefined,
    },
});

export { supabase };
