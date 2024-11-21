<template>
    <div class="serie">
        <div class="header" v-if="serie">
            <img
                :src="getImage(serie.backdrop_path)"
                alt=""
            />
            <div class="serie-title">{{ serie.name }}</div>
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
import { SerieResponse, VoiceActor } from '../../supabase/functions/_shared/serie'
import { MovieResponse } from '../../supabase/functions/_shared/movie';
import { supabase } from '../api/supabase';

const route = useRoute()

const serie = ref<SerieResponse['serie'] | undefined>()
const voiceActors = ref<SerieResponse['voiceActors']>([])

const actors = computed(() => {
    return serie.value?.credits.cast
})

const getVoiceActorByTmdbId = (tmdbId: number): VoiceActor | undefined => {
    const va = voiceActors.value.find(v => v.tmdb_id_actor === tmdbId)

    return va
}

onMounted(async () => {
    const id = route.params.id

    const movieResponseRaw = await supabase.functions.invoke('show', { body: { id } })
    // const movieResponse = await movieResponseRaw.json() as MovieResponse
    const data = movieResponseRaw.data as SerieResponse
    serie.value = data.serie
    voiceActors.value = data.voiceActors
})
</script>

<style scoped lang="scss">
.serie-title {
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
</style>
