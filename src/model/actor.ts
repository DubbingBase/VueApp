import { Movie } from "./movie"
import { Serie } from "./serie"

export interface ActorCredits {
    cast: Array<Movie|Serie>
}


export interface Actor {
    biography: string
    birthday: string
    deathday: string
    gender: 1 | 2
    id: number
    name: string
    place_of_birth: string
    profile_path: string
    combined_credits: ActorCredits
}



