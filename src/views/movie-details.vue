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
                <router-link
                    class="actor"
                    :to="{
                    name: 'ActorDetails',
                    params: {
                        id: actor.id
                    }
                }">
                    <img
                        class="profile-img"
                        :src="getImage(actor.profile_path)"
                        alt=""
                    />
                    <div>{{ actor.name }}</div>
                </router-link>
                <div class="character">
                    <div>{{ actor.character }}</div>
                </div>
                <div class="voice-actors">
                    <VoiceActor v-for="va in getVoiceActorByTmdbId(actor.id)" :key="va.id" :model-value="va"></VoiceActor>
                </div>
            </div>
        </div>

        <Button class="fetch-infos-btn" @click="fetchInfos">Récupérer les informations</Button>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getImage } from '../utils'
import { MovieResponse, WorkAndVoiceActor } from '../../supabase/functions/_shared/movie'
import { supabase } from '../api/supabase';
import VoiceActor from '../components/VoiceActor.vue';

const route = useRoute()

const movie = ref<MovieResponse['movie'] | undefined>()
const voiceActors = ref<MovieResponse['voiceActors']>([])

const actors = computed(() => {
    return movie.value?.credits.cast
})

const getVoiceActorByTmdbId = (tmdbId: number): WorkAndVoiceActor[] => {
    const va = voiceActors.value.filter(v => v.actor_id === tmdbId)

    return va
}

const fetchInfos = async () => {
    const id = movie.value?.external_ids?.wikidata_id

    if (!id) {
        console.error('id is undefined')
        return
    }

    console.log('id', id)
    const movieResponseRaw = await supabase.functions.invoke('prepare_movie', {
        body: {
            wikiId: id,
            tmdbId: route.params.id,
            type: 'movie'
        }
    })
    const data = movieResponseRaw.data

    console.log('data', data)
    location.reload()
}

onMounted(async () => {
    const id = route.params.id

    const movieResponseRaw = await supabase.functions.invoke('movie', { body: { id } })
    // const movieResponse = await movieResponseRaw.json() as MovieResponse
    const data = movieResponseRaw.data as MovieResponse
    movie.value = data.movie
    voiceActors.value = data.voiceActors
})
</script>

<style scoped lang="scss">
.movie-title {
    text-align: center;
}

.header >img{
    object-fit: cover;
    width: 100%;
}
.actor-wrapper {
    margin: 16px 0;
    display: flex;
    background-color: rgb(48, 48, 48);
    border-radius: 25px;
    align-items: center;

    .actor, .va-actor, .character {
        flex: 1;
        text-decoration: none;
        color:inherit;
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

.fetch-infos-btn {
    position: absolute;
    bottom: 64px;
    right: 16px;
    padding: 4px;

}
</style>
