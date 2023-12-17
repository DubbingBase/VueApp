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
                    Content III
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getImage } from '../utils'
import { Actor } from '../model/actor'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import movie from '../components/Movie.vue'

const route = useRoute()

const actor = ref<Actor | undefined>()

const active = ref(0)

const movies = computed(() => {
    return actor.value?.combined_credits.cast.filter((cast) => {
        return cast.media_type === 'movie'
    })
})

const series = computed(() => {
    return actor.value?.combined_credits.cast.filter((cast) => {
        return cast.media_type === 'tv'
    })
})


onMounted(async () => {
    const id = route.params.id

    const actorResponseRaw = await fetch("http://localhost:8000/api/actor/" + id)
    const actorResponse = await actorResponseRaw.json() as Actor
    actor.value = actorResponse

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
    }

}

.movies-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
</style>
