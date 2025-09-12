<template>
  <ion-list v-if="episodes && episodes.length">
    <ion-item
      v-for="ep in episodes"
      :key="ep.id"
      class="episode-item"
      @click="goToEpisode(ep.episode_number)"
    >
      <ion-thumbnail slot="start" v-if="ep.still_path">
        <img :src="getImage(ep.still_path)" :alt="ep.name" />
      </ion-thumbnail>
      <ion-label>
        <h2>{{ ep.episode_number }}. {{ ep.name }}</h2>
        <p v-if="ep.air_date">Diffusé le {{ ep.air_date }}</p>
        <p v-if="ep.overview">{{ ep.overview }}</p>
      </ion-label>
    </ion-item>
  </ion-list>
  <div v-else>Aucun épisode trouvé.</div>
</template>

<script lang="ts" setup>
import { IonList, IonItem, IonThumbnail, IonLabel } from "@ionic/vue";

interface Props {
  episodes: any[];
  getImage: (path: string) => string;
  goToEpisode: (episodeNumber: number) => void;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.episode-item {
  margin-bottom: 0.5rem;
}
</style>
