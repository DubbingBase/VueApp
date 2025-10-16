export interface IDatabaseClient {
  getWorkWithVoiceActors(contentId: number): Promise<any>;
  getVoiceActorWithWork(voiceActorId: number): Promise<any>;
  getWorkByActor(actorId: number): Promise<any>;
}

export interface ITMDBClient {
  get(endpoint: string, params?: Record<string, string>): Promise<any>;
  getMediaWithCredits(contentType: 'movie' | 'tv', id: number): Promise<any>;
  getSeasonWithCredits(seriesId: number, seasonNumber: number): Promise<any>;
  getEpisodeWithCredits(seriesId: number, seasonNumber: number, episodeNumber: number): Promise<any>;
  fetchMediaDetails(contentId: number, contentType: string): Promise<any>;
  fetchMediaCredits(mediaType: string, mediaId: number): Promise<any>;
}

export interface ITVDBClient {
  get(endpoint: string, params?: Record<string, string>): Promise<any>;
  getSeriesById(seriesId: number): Promise<any>;
  getEpisodesBySeries(seriesId: number, season?: number): Promise<any>;
  getCharacterById(characterId: number): Promise<any>;
  getCharactersBySeries(seriesId: number): Promise<any>;
  getPersonById(personId: number): Promise<any>;
  searchSeries(query: string): Promise<any>;
}
