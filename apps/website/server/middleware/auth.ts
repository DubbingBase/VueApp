import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverSupabaseClient } from "#supabase/server";
import { useSupabaseAdmin } from "../utils/db/client";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Attach supabaseAdmin client to event context (skip during builds/prerender
  // where Supabase may not be configured)
  if (config.supabaseUrl) {
    // Pass the event so Cloudflare runtime secrets are available when the
    // singleton is initialized. Without it, the client can be created with
    // the public key and then reused for server-side writes.
    event.context.supabaseAdmin = useSupabaseAdmin(event);
  }

  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (token) {
    const supabase = createClient(
      config.supabaseUrl,
      config.public.supabaseKey,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      },
    );

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        event.context.user = user;
        event.context.supabase = supabase as SupabaseClient;
        return;
      }
    } catch (err) {
      console.warn("[Auth Middleware] Failed to resolve user from token:", err);
    }
  }

  // Fallback: resolve user from session cookies (e.g. browser navigation or SSR)
  try {
    const client = await serverSupabaseClient(event);
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (!error && user) {
      event.context.user = user;
      event.context.supabase = client as unknown as SupabaseClient;
    }
  } catch (err) {
    // Cookie resolution failed or no cookie present; ignore for public endpoints
  }
});
