<template>
  <div class="actor-with-voice-actors">
    <!-- Character Name -->
    <div v-if="actor.character" class="character-name">{{ actor.character }}</div>

    <!-- Main Actor Display -->
    <div class="main-actor">
      <PersonItem
        :person="actor"
        type="actor"
        :getImage="getImage"
        @click="handleActorClick"
      />
    </div>

    <!-- Voice Actors List -->
    <div v-if="voiceActors && voiceActors.length" class="voice-actors-section">
      <div class="voice-actors-scroll">
        <div class="voice-actors-container">
          <PersonItem
            v-for="voiceActor in voiceActors"
            :key="voiceActor.id"
            :person="voiceActor"
            type="voice-actor"
            :getImage="getImage"
            @click="handleVoiceActorClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonItem, { PersonData } from './PersonItem.vue';

export interface ActorWithVoiceActorsProps {
  actor: PersonData;
  voiceActors?: PersonData[];
  getImage?: (path: string) => string;
  onActorClick?: (actor: PersonData) => void;
  onVoiceActorClick?: (voiceActor: PersonData) => void;
}

const props = withDefaults(defineProps<ActorWithVoiceActorsProps>(), {
  voiceActors: () => [],
  onActorClick: () => {},
  onVoiceActorClick: () => {},
});

const emit = defineEmits<{
  actorClick: [actor: PersonData];
  voiceActorClick: [voiceActor: PersonData];
}>();

const handleActorClick = () => {
  props.onActorClick(props.actor);
  emit('actorClick', props.actor);
};

const handleVoiceActorClick = (voiceActor: PersonData) => {
  props.onVoiceActorClick(voiceActor);
  emit('voiceActorClick', voiceActor);
};
</script>

<style scoped lang="scss">
.actor-with-voice-actors {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);

  .character-name {
    font-size: 16px;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 8px;
    padding: 4px 8px;
    border-radius: 8px;
  }

  .main-actor {
    width: 100%;
  }

  .voice-actors-section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .voice-actors-label {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
      margin-bottom: 4px;
    }

    .voice-actors-scroll {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

      &::-webkit-scrollbar {
        height: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }

    .voice-actors-container {
      display: flex;
      gap: 12px;
      min-width: max-content;
    }
  }

  @media (max-width: 768px) {
    padding: 8px;
    gap: 12px;
    border-radius: 8px;

    .character-name {
      font-size: 14px;
      margin-bottom: 6px;
      padding: 3px 6px;
      border-radius: 6px;
    }

    .voice-actors-section {
      gap: 6px;

      .voice-actors-label {
        font-size: 12px;
      }

      .voice-actors-container {
        gap: 8px;
      }
    }
  }
}
</style>
