<template>
    <div class="trending-movies">
        <div class="list-header">
            Tendances - films
        </div>
        <div class="movies">
            <movie v-for="movie in trendingMovies" :value="movie"></movie>
        </div>
    </div>
    <div class="trending-series">
        <div class="list-header">
            Tendances - séries
        </div>
        <div class="series">
            <div
                class="serie"
                v-for="serie in trendingSeries"
                :to="{
                    name: 'SerieDetails',
                    params: {
                        id: serie.id
                    }
                }"
            >
                <div class="poster">
                    <img
                        :src="getImage(serie.poster_path)"
                        alt=""
                    >
                </div>
                <div class="caption">{{ serie.name }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import type { TrendingResponse } from '../model/movie'
import { getImage } from '../utils'
import movie from '../components/Movie.vue'

const trendingMovies = ref<TrendingResponse["results"]>([])
const trendingSeries = ref<TrendingResponse["results"]>([])

onMounted(async () => {
    const trendingMovieResponseRaw = await fetch("http://localhost:8000/api/home/trending-movies")
    const trendingMovieResponse = await trendingMovieResponseRaw.json() as TrendingResponse
    trendingMovies.value = trendingMovieResponse.results

    const trendingSeriesResponseRaw = await fetch("http://localhost:8000/api/home/trending-series")
    const trendingSeriesResponse = await trendingSeriesResponseRaw.json() as TrendingResponse
    trendingSeries.value = trendingSeriesResponse.results
})
</script>

<style scoped lang="scss">
.movies, .series {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
}

.list-header {
    margin-bottom: 4px;
}
</style>
