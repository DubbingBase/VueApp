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

  .inner-list {
    background: #1a1a2e;
    display: flex;
    gap: 12px;
    flex-direction: column;
    border-radius: 1.5rem;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;

    @media (max-width: 768px) {
      padding: 12px;
      gap: 8px;
      border-radius: 1rem;
    }
  }
}
</style>
