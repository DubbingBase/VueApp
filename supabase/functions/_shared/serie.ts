import { WorkAndVoiceActor } from "./movie.ts";
import { WithCast, WithExtrernalIds } from "./other.ts";

export interface Serie {
    adult: boolean
    backdrop_path: string
    id: number
    name: string
    original_language: string
    original_title:string
    overview: string
    poster_path: string
    media_type: "tv"
    genre_ids: Array<number>
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
}

export interface TrendingResponse {
    page: number
    results: Array<Serie>
    total_pages : number
    total_results : number
}

export interface SerieResponse {
    serie: Serie & WithCast & WithExtrernalIds
    voiceActors: Array<WorkAndVoiceActor>
}