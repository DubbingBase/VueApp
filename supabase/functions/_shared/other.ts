export interface Cast {
    gender: number
    id: number
    name: string
    profile_path: string
    cast_id: number
    character: string
}

export interface Genre {
    id: number
    name: string
}

export interface WithCast {
    genres: Array<Genre>
    credits: {
        cast: Array<Cast>
    }
}

export interface WithExtrernalIds {
    external_ids: {
        imdb_id?: string
        wikidata_id?: string
        facebook_id?: string
        instagram_id?: string
        twitter_id?: string
    }
}