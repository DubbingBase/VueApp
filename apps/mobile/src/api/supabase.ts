import { createClient } from "@supabase/supabase-js";
import { Database } from "@/utils/database";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (import.meta.env.DEV) {
  // En mode dev, on route les requêtes vers le proxy Vite pour que ça marche avec --host ou le live reload Capacitor
  if (
    window.location.origin &&
    window.location.origin !== "null" &&
    !window.location.origin.includes("capacitor://")
  ) {
    supabaseUrl = `${window.location.origin}/supabase-api`;
  }
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export { supabase };
