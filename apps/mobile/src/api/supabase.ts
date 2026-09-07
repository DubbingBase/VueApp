import { createClient } from "@supabase/supabase-js";
import { Database } from "@/utils/database";
import { toastController } from "@/composables/useToast";

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

const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

// ponytail: single choke point — legacy edge functions were deleted, so all
// mapped calls go to the Nitro product API; unmapped names fall back to
// Supabase. Fixes every caller at once instead of touching 30+ call sites.
supabase.functions.invoke = (async <T = unknown>(
  functionName: string,
  options?: Parameters<typeof originalInvoke>[1],
) => {
  try {
    let result;
    const { hasNitroRoute, nitroInvoke } = await import("./nitro");
    if (hasNitroRoute(functionName)) {
      result = await nitroInvoke<T>(functionName, options);
    } else {
      result = await originalInvoke<T>(functionName, options);
    }
    if (result.error) {
      console.error(`API error (${functionName}):`, result.error);
      const toast = await toastController.create({
        message: `Failed to execute ${functionName}: ${result.error.message || result.error}`,
        duration: 3000,
        color: "danger",
      });
      toast.present();
    }
    return result;
  } catch (err: unknown) {
    console.error(`API exception (${functionName}):`, err);
    const toast = await toastController.create({
      message: `Failed to execute ${functionName}: ${(err as Error)?.message || "Unknown error"}`,
      duration: 3000,
      color: "danger",
    });
    toast.present();
    throw err;
  }
}) as typeof supabase.functions.invoke;

export { supabase };
