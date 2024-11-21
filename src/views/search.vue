<template>
  <div>
    <h1>Search</h1>
    <InputText @input="search" />

    <div class="results">
      <router-link :to="{ name: typeToRoute(match.media_type), params: { id: match.id } }" v-for="match in matches" :key="match.id" class="result">
        <div class="title">{{ match.name ?? match.title }}</div>
        <div class="overview">{{ match.media_type }}</div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import { supabase } from '../api/supabase';
import { ref } from 'vue';

const matches = ref([])

const search = async(event: any) => {
  console.log(event.target.value)

  const { data, error } = await supabase.functions.invoke('search', {
    body: {
      query: event.target.value
    }
  })

  console.log('data', data)

  matches.value = data.results
}

const typeToRoute = (type: string) => {
  switch (type) {
    case 'movie':
      return 'MovieDetails'
    case 'tv':
      return 'SerieDetails'
    case 'person':
      return 'ActorDetails'
    default:
      return 'home'
  }
}
</script>

<style lang="scss" scoped>
.results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;

  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .overview {
    font-size: 1rem;
    color: #666;
  }
}
</style>