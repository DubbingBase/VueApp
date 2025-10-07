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
