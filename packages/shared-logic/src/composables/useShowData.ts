export async function fetchShowData(
  id: string | number,
  locale?: string,
): Promise<any | null> {
  const headers: Record<string, string> = {};
  if (locale) {
    headers["Accept-Language"] = locale;
  }

  try {
    const data = await $fetch<any>(`/api/show/${id}`, { headers });
    if (!data || !data.serie) {
      console.error(
        "fetchShowData: Response is null or missing serie property",
      );
      return null;
    }
    return data;
  } catch (e) {
    console.error("fetchShowData error:", e);
    return null;
  }
}
