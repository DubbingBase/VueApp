import { apiFetch } from "./http";

interface RequestOptions {
  method?: "GET" | "POST";
  body?: any;
  query?: Record<string, any>;
  signal?: AbortSignal;
}

/**
 * Typed client for the Nitro product API (https://dubbingbase.com/api).
 * Callers provide the concrete API path and request details.
 */
export async function nitroRequest<T = any>(
  path: string,
  options?: RequestOptions,
): Promise<{ data: T | null; error: any }> {
  try {
    const data = await apiFetch<T>(path, {
      method: options?.method ?? "GET",
      query: options?.query,
      body: options?.body,
      signal: options?.signal,
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
