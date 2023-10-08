<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import type { TrendingResponse } from '../model/movie'

const TheRetour = ref<TrendingResponse["results"]>([])

onMounted(async () => {
    const retourbrut = await fetch("http://localhost:8000/api/home")
    const a = await retourbrut.json() as TrendingResponse
    TheRetour.value = a.results
    console.log('TheRetour', TheRetour.value)
})
</script>

<template>
<div>
    <div v-for="movie in TheRetour">
        <p>{{ movie.title }}</p>
        <p>{{ movie.original_title }}</p>
    </div>
</div>
</template>

<style scoped>

</style>
