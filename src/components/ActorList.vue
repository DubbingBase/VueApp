<template>
  <div class="actors-list">
    <div class="inner-list">
      <template v-if="actors && actors.length">
        <ActorItem v-for="actor in actors" :key="actor.id" :actor="actor" :voiceActors="getVoiceActorByTmdbId(actor.id)" :isAdmin="isAdmin" :goToActor="goToActor" :goToVoiceActor="goToVoiceActor" :editVoiceActorLink="editVoiceActorLink" :confirmDeleteVoiceActorLink="confirmDeleteVoiceActorLink" :openVoiceActorSearch="openVoiceActorSearch" :getImage="getImage" />
      </template>
      <NoActors v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import ActorItem from './ActorItem.vue';
import NoActors from './NoActors.vue';

// Props
defineProps<{
  actors: any[];
  voiceActors: any[];
  isAdmin: boolean;
  getVoiceActorByTmdbId: (tmdbId: number) => any[];
  goToActor: (id: number) => void;
  goToVoiceActor: (id: number) => void;
  editVoiceActorLink: (item: any) => void;
  confirmDeleteVoiceActorLink: (item: any) => void;
  openVoiceActorSearch: (actor: any) => void;
  getImage: (path: string) => string;
}>();
</script>

<style scoped lang="scss">
.actors-list {
  z-index: 1;
  position: relative;
  top: -80px;

  .inner-list {
    background-color: #000;
    display: flex;
    gap: 8px;
    flex-direction: column;
    border-radius: 2rem;
    padding-top: 8px;
  }
}
</style>
