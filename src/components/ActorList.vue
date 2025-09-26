<template>
  <div class="actors-list">
    <div class="inner-list">
      <template v-if="actors && actors.length">
        <ActorWithVoiceActors
          v-for="actor in actors"
          :key="actor.id"
          :actor="actor"
          :voiceActors="getVoiceActorsForActor(actor.id)"
          :getImage="getImage"
          :onActorClick="handleActorClick"
          :onVoiceActorClick="handleVoiceActorClick"
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
import { PersonData } from './PersonItem.vue';

// Props
const props = defineProps<{
  actors?: any[];
  voiceActors?: any[];
  goToActor: (id: number) => void;
  goToVoiceActor: (id: number) => void;
  getImage: (path: string) => string;
}>();

console.log('actors', props.actors)
console.log('voiceActors', props.voiceActors)

// Filter voice actors for a specific actor
const getVoiceActorsForActor = (actorId: number) => {
  if (!props.voiceActors) return [];
  console.log('props.voiceActors', props.voiceActors)
  return props.voiceActors.filter((item: any) => item.actor_id === actorId).map(va => ({
    id: va.voiceActorDetails.id,
    firstname: va.voiceActorDetails.firstname,
    lastname: va.voiceActorDetails.lastname,
    tags: [va.performance]
  } satisfies PersonData));
};

// Wrapper functions to handle prop type requirements
const handleActorClick = (actor: any) => {
  props.goToActor(actor.id);
};

const handleVoiceActorClick = (voiceActor: any) => {
  props.goToVoiceActor(voiceActor.id);
};
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
