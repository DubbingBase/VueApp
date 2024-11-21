<template>
    <div class="actor">
        <div class="header" v-if="actor">
            <img :src="getImage(actor.profile_path)" alt="" />
            <div class="actor-name">{{ actor.name }}</div>
        </div>

        <div class="body" v-if="actor">
            <TabView :activeIndex="active">
                <TabPanel header="À propos">
                    <p> Date de naissance :  {{ actor.birthday }} </p>
                    {{ actor.biography }}
                </TabPanel>
                <TabPanel header="Films">
                    <div class="movies-wrapper">
                        <movie v-for="movie in movies" :value="movie"></movie>
                    </div>
                </TabPanel>
                <TabPanel header="Séries">
                    <div class="series-wrapper">
                        <serie v-for="serie in series" :value="serie"></serie>
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
import type { Movie } from '../../supabase/functions/_shared/movie';
import { supabase } from '../api/supabase';

const route = useRoute()

const actor = ref<Actor | undefined>()

const active = ref(0)

const isMovie = (item: Movie | Serie): item is Movie => {
    return item.media_type === 'movie'
}

const isSerie = (item: Movie | Serie): item is Serie => {
    return item.media_type === 'tv'
}

const movies = computed(() => {
    return actor.value?.combined_credits.cast.filter(isMovie)
})

const series = computed(() => {
    return actor.value?.combined_credits.cast.filter(isSerie)
})


onMounted(async () => {
    const id = route.params.id

    const actorResponseRaw = await await supabase.functions.invoke('actor', { body: { id } })
    const actorResponse = await actorResponseRaw.data as { actor: Actor}
    actor.value = actorResponse.actor
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
