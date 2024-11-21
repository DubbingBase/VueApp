<template>
    <div class="trending-movies">
        <div class="list-header">
            Tendances - films
        </div>
        <div class="movies">
            <Movie :key="movie.id" v-for="movie in trendingMovies" :value="movie"></Movie>
        </div>
    </div>
    <div class="trending-series">
        <div class="list-header">
            Tendances - séries
        </div>
        <div class="series">
            <Show :key="show.id" v-for="show in trendingSeries" :value="show"></Show>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import type { TrendingResponse } from '../../supabase/functions/_shared/movie'
import Movie from '../components/Movie.vue'
import Show from '../components/Serie.vue'
import { supabase } from '../api/supabase'

const trendingMovies = ref<TrendingResponse["results"]>([])
const trendingSeries = ref<TrendingResponse["results"]>([])

onMounted(async () => {
    const trendingMovieResponseRaw = await supabase.functions.invoke('trending-movies')
    console.log('trendingMovieResponseRaw', trendingMovieResponseRaw)

    //  fetch("http://127.0.0.1:54321/functions/v1/trending-movies")
    // const trendingMovieResponse = await trendingMovieResponseRaw.json() as TrendingResponse
    trendingMovies.value = trendingMovieResponseRaw.data.results
    console.log('trendingMovies.value', trendingMovies.value)

    const trendingSeriesResponseRaw = await supabase.functions.invoke('trending-shows')
    // const trendingSeriesResponse = await trendingSeriesResponseRaw.json() as TrendingResponse
    trendingSeries.value = trendingSeriesResponseRaw.data.results
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
