<template>
    <div class="actor">
        <div class="header" v-if="voiceActor">
            <img :src="getImage(voiceActor.profile_path)" alt="" />
            <div class="actor-name">{{ voiceActor.firstname }} {{ voiceActor.lastname }}</div>
        </div>

        <div class="body" v-if="voiceActor">
            <TabView :activeIndex="active">
                <TabPanel header="À propos">
                    <p> Date de naissance :  {{ voiceActor.birthday }} </p>
                    {{ voiceActor.biography }}
                </TabPanel>
                <TabPanel header="Films">
                    <div class="movies-wrapper">
                        <movie v-for="movie in movies" :value="getMovie(movie)"></movie>
                    </div>
                </TabPanel>
                <TabPanel header="Séries">
                    <div class="series-wrapper">
                        <serie v-for="serie in series" :value="getSerie(serie)"></serie>
                    </div>
                </TabPanel>
            </TabView>
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
import movie from '../components/Movie.vue';
import serie from '../components/Serie.vue';
import type { Serie } from '../../supabase/functions/_shared/serie';
import type { Movie, MovieResponse } from '../../supabase/functions/_shared/movie';
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
    medias: (MovieResponse | Serie)[]
}

const voiceActor = ref<VoiceActorResponse['voiceActor'] | undefined>()
const medias = ref<VoiceActorResponse['medias'] | undefined>()

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

const getMovie = (item: unknown): Serie => {
    return medias.value?.find(media => {
        return media.id === item.content_id;
    })
}

const getSerie = (item: unknown): Serie => {
    return medias.value?.find(media => {
        return media.id === item.content_id;
    })
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
