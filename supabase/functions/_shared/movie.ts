import { WithCast, WithExtrernalIds } from "./other.ts";

export interface Movie {
    adult: boolean
    backdrop_path: string
    id: number
    title: string
    original_language: string
    original_title:string
    overview: string
    poster_path: string
    media_type: "movie"
    genre_ids: Array<number>
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
}

export interface TrendingResponse {
    page: number
    results: Array<Movie>
    total_pages : number
    total_results : number
}

export interface VoiceActorDetails {
    id: number
    bio: any
    awards: any
    lastname: string
    firstname: string
    nationality: any
    years_active: any
    date_of_birth: any
    social_media_links: any
  }

export interface WorkAndVoiceActor {
    id: number
    content_id: number
    actor_id: number
    voice_actor_id: number
    highlight: boolean
    suggestions: any
    status: string
    source_id: any
    voiceActorDetails: VoiceActorDetails
    performance?: string
}

export interface MovieResponse {
    movie: Movie & WithCast & WithExtrernalIds
    voiceActors: Array<WorkAndVoiceActor>
}