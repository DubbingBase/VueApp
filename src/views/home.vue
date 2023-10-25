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
            <div class="poster">
                <img
                    :src="getImage(movie.poster_path)"
                    alt=""
                >
            </div>
            <div class="caption">{{ movie.title }}</div>
        </div>
    </div>
</template>

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

<style scoped lang="scss">
.movies {
    display: flex;
    flex-direction: row;
    overflow-x: auto;

    .movie {
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
}</style>
