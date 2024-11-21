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

export interface Genre {
    id: number
    name: string
}

export interface Cast {
    gender: number
    id: number
    name: string
    profile_path: string
    cast_id: number
    character: string
}

export interface SerieWithCast extends Serie {
    genres: Array<Genre>
    credits: {
        cast: Array<Cast>
    }
}

export interface TrendingResponse {
    page: number
    results: Array<Serie>
    total_pages : number
    total_results : number
}

export interface VoiceActor {
    va_lastname: string
    va_firstname: string
    tmdb_id_actor: number
}

export interface SerieResponse {
    serie: SerieWithCast
    voiceActors: Array<VoiceActor>
}