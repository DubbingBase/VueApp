import { ITMDBClient } from './interfaces.ts';
import { TMDB_CONFIG, buildTmdbImageUrl } from './tmdb-urls.ts';
import { SUPABASE_CONFIG, safeProcessImageUrl, STORAGE_BUCKETS } from './supabase-urls.ts';

// Debug logging function
function debugLog(message: string, data?: any) {
  console.log(`[TMDB] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export class TMDBClient implements ITMDBClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = Deno.env.get('TMDB_API_KEY')!;
    this.baseUrl = 'https://api.themoviedb.org/3';
    debugLog('TMDB Client initialized', {
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl
    });
  }

  async get(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.set('language', 'fr-FR');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
  }

  async getMediaWithCredits(contentType: 'movie' | 'tv', id: number) {
    return this.get(`${contentType}/${id}`, {
      'append_to_response': 'credits,external_ids'
    });
  }

  async getSeasonWithCredits(seriesId: number, seasonNumber: number) {
    return this.get(`tv/${seriesId}/season/${seasonNumber}`, {
      'append_to_response': 'credits,external_ids'
    });
  }

  async getEpisodeWithCredits(seriesId: number, seasonNumber: number, episodeNumber: number) {
    return this.get(`tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      'append_to_response': 'credits,external_ids'
    });
  }

  async fetchMediaDetails(contentId: number, contentType: string) {
    return await this.get(`${contentType}/${contentId}`, {
      append_to_response: 'credits,external_ids'
    });
  }

  async fetchMediaCredits(mediaType: string, mediaId: number) {
    return await this.get(`${mediaType}/${mediaId}/credits`);
  }
}
