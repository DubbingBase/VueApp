import { ofetch } from "ofetch";
import { supabase } from "./supabase";

// Product API: the Nuxt/Nitro website. Defaults to production so release
// builds work with no extra config; override locally with VITE_API_BASE_URL.
export const nitroBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "https://dubbingbase.com";

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    // Required by the website CORS middleware for non-same-origin callers
    "x-dubbingbase-client": "web",
  };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // No session (public endpoint) — proceed without a token.
  }
  return headers;
}

export const apiFetch = ofetch.create({
  baseURL: nitroBaseUrl,
  async onRequest({ options }) {
    const extra = new Headers(options.headers as HeadersInit | undefined);
    const auth = await authHeaders();
    for (const [k, v] of Object.entries(auth)) {
      if (!extra.has(k)) extra.set(k, v);
    }
    options.headers = extra;
  },
});
