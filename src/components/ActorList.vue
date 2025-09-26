<template>
  <div class="actors-list">
    <div class="inner-list">
      <template v-if="actors && actors.length">
        <ActorWithVoiceActors
          v-for="actor in actors"
          :key="actor.id"
          :actor="actor"
          :voiceActors="voiceActors || []"
          :getImage="getImage"
          :onActorClick="(actor) => goToActor(actor.id)"
          :onVoiceActorClick="(voiceActor) => goToVoiceActor(voiceActor.id)"
          @actor-click="(actor) => goToActor(actor.id)"
          @voice-actor-click="(voiceActor) => goToVoiceActor(voiceActor.id)"
        />
      </template>
      <template v-else>
        <NoActors />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActorWithVoiceActors from './ActorWithVoiceActors.vue';
import NoActors from './NoActors.vue';

// Props
defineProps<{
  actors?: any[];
  voiceActors?: any[];
  goToActor: (id: number) => void;
  goToVoiceActor: (id: number) => void;
  getImage: (path: string) => string;
}>();
</script>

<style scoped lang="scss">
.actors-list {
  z-index: 1;
  position: relative;

  .inner-list {
    display: flex;
    gap: 12px;
    flex-direction: column;
    border-radius: 1.5rem;
    padding: 16px;

    @media (max-width: 768px) {
      padding: 12px;
      gap: 8px;
      border-radius: 1rem;
    }
  }

  .no-items {
    text-align: center;
    color: var(--ion-color-medium);
    font-style: italic;
    padding: 20px;

    p {
      margin: 0;
    }
  }
}
</style>
