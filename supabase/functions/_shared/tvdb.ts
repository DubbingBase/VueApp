import { ITVDBClient } from './interfaces.ts';

// Debug logging function
function debugLog(message: string, data?: any) {
  console.log(`[TVDB] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export class TVDBClient implements ITVDBClient {
  private apiKey: string;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.apiKey = Deno.env.get('TVDB_API_KEY')!;
    this.baseUrl = 'https://api4.thetvdb.com/v4';
    debugLog('TVDB Client initialized', {
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl
    });
  }

  private async authenticate(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    debugLog('Authenticating with TVDB API');

    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        apikey: this.apiKey
      }),
    });

    if (!response.ok) {
      throw new Error(`TVDB authentication failed: ${response.status}`);
    }

    const authData = await response.json();
    this.token = authData.data.token;
    // Token expires in 24 hours, set expiry to 23 hours for safety margin
    this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);

    debugLog('TVDB authentication successful', {
      hasToken: !!this.token,
      expiresAt: this.tokenExpiry
    });

    return this.token!;
  }

  async get(endpoint: string, params?: Record<string, string>) {
    const token = await this.authenticate();

    const url = new URL(`${this.baseUrl}/${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TVDB API error: ${response.status}`);
    }

    return response.json();
  }

  async getSeriesById(seriesId: number, extended?: { meta?: "episodes" | 'translations', short?: boolean }): Promise<any> {
    if (extended) {
      return this.get(`series/${seriesId}/extended`, {
        params: {
          extended: extended.meta,
          short: extended.short
        }
      });
    }
    return this.get(`series/${seriesId}`);
  }

  async getMovieById(movieId: number, extended?: { meta?: 'translations', short?: boolean }): Promise<any> {
    if (extended) {
      return this.get(`movies/${movieId}/extended`, {
        params: {
          extended: extended.meta,
          short: extended.short
        }
      });
    }
    return this.get(`series/${movieId}`);
  }

  async getEpisodesBySeries(seriesId: number, season?: number): Promise<any> {
    const endpoint = season
      ? `series/${seriesId}/episodes/${season}`
      : `series/${seriesId}/episodes`;
    return this.get(endpoint);
  }

  async getCharacterById(characterId: number): Promise<any> {
    return this.get(`characters/${characterId}`);
  }

  async getCharactersBySeries(seriesId: number): Promise<any> {
    return this.get(`series/${seriesId}/characters`);
  }
  async getCharactersByMovie(movieId: number): Promise<any> {
    return this.get(`movies/${movieId}/characters`);
  }

  async getPersonById(personId: number): Promise<any> {
    return this.get(`people/${personId}`);
  }

  async searchSeries(query: string): Promise<any> {
    return this.get('search', { query });
  }
}
