<template>
    <div class="actor">
        <div class="header" v-if="voiceActor">
            <img :src="profilePicture" alt="" />
            <div class="actor-name">{{ voiceActor.firstname }} {{ voiceActor.lastname }}</div>
        </div>

        <div class="body" v-if="voiceActor">
            <TabView :activeIndex="active">
                <TabPanel header="À propos">
                    <p> Date de naissance :  {{ voiceActor.date_of_birth }} </p>
                    {{ voiceActor.bio }}
                </TabPanel>
                <TabPanel header="Films">
                    <div class="movies-wrapper">
                        <Movie v-for="movie in movies" :value="getMovie(movie)"></Movie>
                    </div>
                </TabPanel>
                <TabPanel header="Séries">
                    <div class="series-wrapper">
                        <pre>length: {{ series?.length }}</pre>
                        <Serie v-for="serie in series" :value="getSerie(serie)"></Serie>
                    </div>
                </TabPanel>
            </TabView>

            <Button @click="addWikiId">Saisir wikipedia id</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getImage } from '../utils';
import { Actor } from '../../supabase/functions/_shared/actor';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Movie from '../components/Movie.vue';
import Serie from '../components/Serie.vue';
import type { Serie as SerieModel } from '../../supabase/functions/_shared/serie';
import type { Movie as MovieModel, MovieResponse } from '../../supabase/functions/_shared/movie';
import { supabase } from '../api/supabase';

const route = useRoute()

type VoiceActorResponse = {
    voiceActor: {
        id: number
        firstname: string
        lastname: string
        work: {
            id: string
            actor_id: string
            content_id: string
        }[]
    }
    profile_picture: string
    medias: (MovieResponse | SerieModel)[]
}

const voiceActor = ref<VoiceActorResponse['voiceActor'] | undefined>()
const medias = ref<VoiceActorResponse['medias'] | undefined>()
const profilePicture = ref<VoiceActorResponse['profile_picture'] | undefined>()

const active = ref(0)

const isMovie = (item: unknown): item is unknown => {
    return item.content_type === 'movie'
}

const isSerie = (item: unknown): item is unknown => {
    return item.content_type === 'tv'
}

const movies = computed(() => {
    return voiceActor.value?.work.filter(isMovie)
})

const series = computed(() => {
    return voiceActor.value?.work.filter(isSerie)
})

const getMovie = (item: unknown): MovieModel => {
    return medias.value?.find(media => {
        return media.id === item.content_id;
    })
}

const getSerie = (item: unknown): SerieModel => {
    return medias.value?.find(media => {
        return media.id === item.content_id;
    })
}

const addWikiId = () => {
    console.log('addWikiId')
}

onMounted(async () => {
    const id = route.params.id

    const voiceActorResponseRaw = await supabase.functions.invoke('voice-actor', { body: { id } })
    const voiceActorResponse = await voiceActorResponseRaw.data as VoiceActorResponse
    console.log('voiceActorResponse', voiceActorResponse)
    if (!voiceActorResponse) {
        console.error('voiceActorResponse is null')
        return
    }
    voiceActor.value = voiceActorResponse.voiceActor
    medias.value = voiceActorResponse.medias
    profilePicture.value = voiceActorResponse.profile_picture
})


</script>

<style scoped lang="scss">
.header {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
        height: 300px;
        width: 240px;
        object-fit: cover;
    }
}

.movies-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.series-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
</style>
