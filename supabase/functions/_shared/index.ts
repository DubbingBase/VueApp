import { DatabaseClient } from './database.ts';
import { TMDBClient } from './tmdb.ts';
import { TVDBClient } from './tvdb.ts';
import { MediaService } from './media-service.ts';
import { IDatabaseClient } from './interfaces.ts';
import { ITMDBClient } from './interfaces.ts';
import { ITVDBClient } from './interfaces.ts';

// Export clients as implementations of their respective interfaces
export const databaseClient: IDatabaseClient = new DatabaseClient();
export const tmdbClient: ITMDBClient = new TMDBClient();
export const tvdbClient: ITVDBClient = new TVDBClient();

// Export MediaService instance
export const mediaService = new MediaService(databaseClient, tmdbClient);

// Export classes for direct instantiation if needed
export { DatabaseClient } from './database.ts';
export { TMDBClient } from './tmdb.ts';
export { TVDBClient } from './tvdb.ts';
export { MediaService } from './media-service.ts';

// Export interfaces
export type { IDatabaseClient, ITMDBClient, ITVDBClient } from './interfaces.ts';
