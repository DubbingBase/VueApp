<template>
    <div class="trending-movies">
        <div class="list-header">
            Tendances - films
        </div>
        <div class="movies">
            <router-link
                class="movie"
                v-for="movie in trendingMovies"
                :to="{
                    name: 'MovieDetails',
                    params: {
                        id: movie.id
                    }
                }"
            >
                <div class="poster">
                    <img
                        :src="getImage(movie.poster_path)"
                        alt=""
                    >
                </div>
                <div class="caption">{{ movie.title }}</div>
            </router-link>
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

    .movie, .serie {
        // overflow: hidden;
        width: 28%;
        margin: 4px;
        display: flex;
        flex-direction: column;
        vertical-align: top;
        height: auto;
        flex: 1 0 auto;

        .poster {
            height: 100%;
            display: flex;
            align-items: start;
            flex: 0;

            img {
                border-radius: 12px;
                max-width: 100%;
                max-height: 100%;
                height: auto;
                // object-fit: cover;
                object-fit: contain;

                display: flex;
                flex-direction: column;
            }
        }

        .caption {
            text-align: center;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            margin: 8px 4px;
        }
    }
}

.list-header {
    margin-bottom: 4px;
}
</style>
