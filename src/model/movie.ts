export interface Movie{
    "adult": boolean
    "backdrop_path": string
    "id": number
    "title": string
    "original_language": string
    "original_title":string
    "overview": string
    "poster_path": string
    "media_type": "movie"
    "genre_ids": Array<number>
    "popularity": number
    "release_date": string
    "video": boolean
    "vote_average": number
    "vote_count": number
}

export interface TrendingResponse{
    "page": number
    results: Array<Movie>
    total_pages : number
    total_results : number
}