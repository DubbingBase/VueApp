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

export interface MovieWithCast {
    genres: Array<Genre>
    credits: {
        cast: Array<Cast>
    }
}

export interface MovieWithExtrernalIds {
    external_ids: {
        imdb_id?: string
        wikidata_id?: string
        facebook_id?: string
        instagram_id?: string
        twitter_id?: string
    }
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
    tmdb_content_id: number
    actor_id: number
    voice_actor_id: number
    highlight: boolean
    suggestions: any
    status: string
    source_id: any
    voiceActorDetails: VoiceActorDetails
}

export interface MovieResponse {
    movie: Movie & MovieWithCast & MovieWithExtrernalIds
    voiceActors: Array<WorkAndVoiceActor>
}