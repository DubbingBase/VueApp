<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import type { TrendingResponse } from '../model/movie'

const TheRetour = ref<TrendingResponse["results"]>([])

const getImage = (backdrop: string) => {
    return `https://image.tmdb.org/t/p/w500/${backdrop}`
}

onMounted(async () => {
    const retourbrut = await fetch("http://localhost:8000/api/home")
    const a = await retourbrut.json() as TrendingResponse
    TheRetour.value = a.results
    console.log('TheRetour', TheRetour.value)
})
</script>

<template>
    <div class="movies">
        <div
            class="movie"
            v-for="movie in TheRetour"
            :to="{
                name: 'MovieDetails',
                params: {
                    id: movie.id
                }
            }"
        >
            <img :src="getImage(movie.backdrop_path)" alt="">
            <p>{{ movie.title }}</p>
        </div>
    </div>
</template>

<style scoped>
.movies {
    display: flex;
    flex-direction: row;
    overflow: auto;

    .movie {
        min-width: 28%;
        border: 1px solid black;
        margin: 4px;
        max-height: 120px;
        display: flex;
        flex-direction: column;

        img {
            height: 100%;
            object-fit: cover;
        }
    }
}
</style>
