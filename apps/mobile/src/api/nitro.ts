import { apiFetch } from "./http";

interface InvokeOptions {
  body?: any;
  query?: Record<string, any>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

interface BuiltRequest {
  method: "GET" | "POST";
  path: string;
  query?: Record<string, any>;
  body?: any;
}

type RouteBuilder = (body: any) => BuiltRequest;

const post =
  (path: string): RouteBuilder =>
  (body) => ({
    method: "POST",
    path,
    body,
  });

const get =
  (path: string, pick?: string[]): RouteBuilder =>
  (body) => ({
    method: "GET",
    path,
    query: pick
      ? Object.fromEntries(
          pick
            .filter((k) => body?.[k] !== undefined && body?.[k] !== null)
            .map((k) => [k, body[k]]),
        )
      : (body ?? {}),
  });

const byId =
  (prefix: string): RouteBuilder =>
  (body) => ({
    method: "GET",
    path: `${prefix}/${body?.id}`,
  });

// Legacy Supabase edge-function name -> Nitro product API route.
// POST bodies pass through unchanged (Nitro was ported from the same
// functions); GET bodies are mapped to query params / path params.
const ROUTES: Record<string, RouteBuilder> = {
  // Media reads (REST)
  actor: byId("/api/actor"),
  movie: byId("/api/movie"),
  show: byId("/api/show"),
  game: byId("/api/game"),
  "voice-actor": byId("/api/voice-actor"),
  season: get("/api/season", ["id", "season_number"]),
  episode: get("/api/episode", ["id", "season_number", "episode_number"]),

  // Search
  search: get("/api/search", ["query"]),
  "search-voice-actors": get("/api/search-voice-actors", ["query", "limit"]),
  "list-voice-actors": get("/api/list-voice-actors", [
    "query",
    "limit",
    "offset",
  ]),

  // Metadata / projects / studios
  "get-metadata": get("/api/get-metadata", ["type"]),
  "get-media-credits": get("/api/get-media-credits", [
    "media_type",
    "media_id",
  ]),
  "get-dubbing-project": get("/api/get-dubbing-project", ["numericId"]),
  "get-studio-details": get("/api/get-studio-details", ["studioId"]),
  "get-work-votes": (body) => ({
    method: "GET",
    path: "/api/get-work-votes",
    // Comma-joined: deterministic across fetch serializers, parsed by Nitro.
    query: {
      work_ids: Array.isArray(body?.work_ids)
        ? body.work_ids.join(",")
        : body?.work_ids,
    },
  }),
  "get-user-profile": () => ({ method: "GET", path: "/api/get-user-profile" }),
  "get-user-voice-actors": get("/api/get-user-voice-actors", ["page", "limit"]),

  // Writes (POST passthrough)
  "cast-vote": post("/api/cast-vote"),
  "create-user-profile": post("/api/create-user-profile"),
  "update-user-profile": post("/api/update-user-profile"),
  "update-voice-actor": post("/api/update-voice-actor"),
  "link-voice-actor": post("/api/link-voice-actor"),
  "link-user-voice-actor": post("/api/link-user-voice-actor"),
  "delete-voice-actor-link": post("/api/delete-voice-actor-link"),
  "delete-user-voice-actor-link": post("/api/delete-user-voice-actor-link"),
  update_voice_actor_link: post("/api/update_voice_actor_link"),
  "update-review-status": post("/api/update-review-status"),
  "manage-subscription": post("/api/manage-subscription"),
  "process-credits": post("/api/process-credits"),
  "extract-voice-actor-info": post("/api/extract-voice-actor-info"),
  "extract-credits-from-image": post("/api/extract-credits-from-image"),
  "request-voice-actor-page": post("/api/request-voice-actor-page"),
  // Legacy alias: linkage requests are page requests with a voice_actor_id
  "request-voice-actor-linkage": post("/api/request-voice-actor-page"),
  "save-metadata": post("/api/save-metadata"),
  "save-dubbing-project": post("/api/save-dubbing-project"),
  "save-studio": post("/api/save-studio"),
  prepare_game: post("/api/prepare_game"),
  // Legacy snake_case name -> kebab-case Nitro route (FormData passthrough)
  upload_profile_picture: (body) => ({
    method: "POST",
    path: "/api/upload-profile-picture",
    body,
  }),
};

export function hasNitroRoute(functionName: string): boolean {
  return functionName in ROUTES;
}

/**
 * Drop-in replacement for supabase.functions.invoke that targets the Nitro
 * product API. Returns the same { data, error } shape so call sites keep
 * working unchanged.
 */
export async function nitroInvoke<T = unknown>(
  functionName: string,
  options?: InvokeOptions,
): Promise<{ data: T | null; error: any }> {
  const builder = ROUTES[functionName];
  if (!builder) {
    return {
      data: null,
      error: new Error(`No Nitro route mapped for "${functionName}"`),
    };
  }
  const req = builder(options?.body);
  try {
    const data = await apiFetch<T>(req.path, {
      method: req.method,
      query: { ...req.query, ...options?.query },
      body: req.body,
      signal: options?.signal,
      headers: options?.headers,
    });
    return { data, error: null };
  } catch (err: any) {
    // Normalize ofetch errors to the { data, error } shape; keep server
    // message when available.
    const message =
      err?.data?.message || err?.message || "Nitro API request failed";
    return { data: null, error: new Error(message, { cause: err }) };
  }
}
