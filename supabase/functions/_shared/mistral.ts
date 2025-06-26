export interface MistralMovieExtractOutput {
    items?: MistralMovieExtractItemOutput[]
}

export interface MistralMovieExtractItemOutput {
    actor: string
    voiceActorName: string
    voiceActorFirstname: string
    performance?: string
}


export interface MistralVoiceActorExtractOutput {
    items?: MistralVoiceActorExtractItemOutput[]
}

export interface MistralVoiceActorExtractItemOutput {
    actor: string
    performance?: string
    production?: string
    year?: number
}
