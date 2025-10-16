<template>
  <div class="actors-list">
    <div class="inner-list">
      <template v-if="loading">
        <!-- Don't show anything while loading -->
      </template>
      <template v-else-if="actors && actors.length">
        <ActorWithVoiceActors
          v-for="actor in actors"
          :key="actor.id"
          :actor="actor"
          :voiceActors="getVoiceActorsForActor(actor.id)"
          :onActorClick="handleActorClick"
          :onVoiceActorClick="handleVoiceActorClick"
          :mediaLanguage="mediaLanguage"
          :editVoiceActorLink="editVoiceActorLink"
          :confirmDeleteVoiceActorLink="confirmDeleteVoiceActorLink"
          :openVoiceActorSearch="openVoiceActorSearch"
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
  actors?: PersonData[];
  voiceActors?: Array<{
    id: number;
    voice_actor_id: number;
    work_id: number;
    work_type: string;
    performance: string;
    voiceActorDetails: {
      id: number;
      firstname: string;
      lastname: string;
      profile_picture?: string;
    };
  }>;
  goToActor: (id: number) => void;
  goToVoiceActor: (id: number) => void;
  loading?: boolean;
  mediaLanguage?: string;
  editVoiceActorLink?: (workItem: any) => void;
  confirmDeleteVoiceActorLink?: (workItem: any) => void;
  openVoiceActorSearch?: (actorId: number) => void;
}>();

console.log('actors', props.actors)
console.log('voiceActors', props.voiceActors)

// Filter voice actors for a specific actor
const getVoiceActorsForActor = (actorId: number) => {
  if (!props.voiceActors) return [];
  console.log('props.voiceActors', props.voiceActors)
  return props.voiceActors.filter((item: any) => item.actor_id === actorId).map((va: any) => ({
    id: va.voiceActorDetails.id,
    firstname: va.voiceActorDetails.firstname,
    lastname: va.voiceActorDetails.lastname,
    tags: va.performance ? [va.performance] : [],
    tmdb_id: va.voiceActorDetails.tmdb_id,
    profile_picture: va.voiceActorDetails.profile_picture,
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
