<template>
    <div class="movie">
        <div class="header" v-if="movie">
            <img
                :src="getImage(movie.backdrop_path)"
                alt=""
            />
            <div class="movie-title">{{ movie.title }}</div>
        </div>

        <div class="body">
            <div class="actor-wrapper" v-for="actor in actors">
                <div class="actor">
                    <img
                        class="profile-img"
                        :src="getImage(actor.profile_path)"
                        alt=""
                    />
                    <div>{{ actor.name }}</div>
                </div>
                <div class="character">
                    <div>{{ actor.character }}</div>
                </div>
                <div class="va-actor" v-if="getVoiceActorByTmdbId(actor.id)">
                    <img
                        class="profile-img"
                        :src="`https://api.dicebear.com/7.x/initials/svg?seed=${getVoiceActorByTmdbId(actor.id)?.va_firstname}`"
                        alt=""
                    />
                    <div>{{ getVoiceActorByTmdbId(actor.id)?.va_firstname }} {{ getVoiceActorByTmdbId(actor.id)?.va_lastname }}</div>
                </div>
                <div v-else class="va-actor" >
                    Nope
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getImage } from '../utils'
import { MovieResponse, VoiceActor } from '../model/movie'

const route = useRoute()

const movie = ref<MovieResponse['movie'] | undefined>()
const voiceActors = ref<MovieResponse['voiceActors']>([])

const actors = computed(() => {
    return movie.value?.credits.cast
})

const getVoiceActorByTmdbId = (tmdbId: number): VoiceActor | undefined => {
    const va = voiceActors.value.find(v => v.tmdb_id_actor === tmdbId)

    return va
}

onMounted(async () => {
    const id = route.params.id

    const movieResponseRaw = await fetch("http://localhost:8000/api/movie/" + id)
    const movieResponse = await movieResponseRaw.json() as MovieResponse
    movie.value = movieResponse.movie
    voiceActors.value = movieResponse.voiceActors
})
</script>

<style scoped lang="scss">
.movie-title {
    text-align: center;
}

.actor-wrapper {
    margin: 16px 0;
    display: flex;
    background-color: rgb(48, 48, 48);
    border-radius: 25px;
    align-items: center;

    .actor, .va-actor, .character {
        flex: 1;
    }

    .character {
        text-align: center;
    }

    .va-actor, .actor {
        text-align: center;
        margin: 8px 0;
    }

    .actor, .va-actor {
        .profile-img {
            width: 50%;
            border-radius: 16px;
        }
    }
}
</style>
