<template>
  <div class="actor-with-voice-actors">
    <!-- Character Name -->
    <div class="character-name">
      <div v-for="(role, index) in actor.roles" :key="role.character">
        {{ index > 0 ? "/ " : "" }} {{ role.character }}
      </div>
    </div>

    <!-- Main Actor Display -->
    <div class="main-actor">
      <PersonItem :person="actor" type="actor">
        <template #actions >
          <ion-button v-if="voiceActors.length === 0 && shouldShowVoiceActors" fill="clear" size="small" @click.stop="openVoiceActorSearch && openVoiceActorSearch(actor.id)" aria-label="Add voice actor link">
            <ion-icon :icon="addCircle"></ion-icon>
          </ion-button>
        </template>
      </PersonItem>
    </div>

    <!-- Voice Actors List -->
    <div v-if="voiceActors && voiceActors.length && shouldShowVoiceActors" class="voice-actors-section">
      <div class="voice-actors-scroll">
        <div class="voice-actors-container">
          <template v-for="voiceActor in voiceActors" :key="voiceActor.id">
            <router-link
              class="voice-actor-item no-link"
              :to="{ name: 'VoiceActorDetails', params: { id: voiceActor.id } }"
            >
              <PersonItem
                class="voice-actor-item"
                :person="voiceActor"
                type="voice-actor"
              >
              <template #actions>
                <ion-button fill="clear" size="small" @click.stop="editVoiceActorLink && editVoiceActorLink({ id: actor.id, voiceActorDetails: voiceActor })" aria-label="Edit voice actor link">
                  <ion-icon :icon="createOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" size="small" @click.stop="confirmDeleteVoiceActorLink && confirmDeleteVoiceActorLink({ id: actor.id, voiceActorDetails: voiceActor })" color="danger" aria-label="Delete voice actor link">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </template>
              </PersonItem>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonItem, { PersonData } from "./PersonItem.vue";
import { createOutline, trashOutline, addCircle } from 'ionicons/icons';
import { useLanguagePreference } from '@/composables/useLanguagePreference';
import { computed } from 'vue';

export interface ActorWithVoiceActorsProps {
  actor: PersonData;
  voiceActors?: PersonData[];
  onActorClick?: (actor: PersonData) => void;
  onVoiceActorClick?: (voiceActor: PersonData) => void;
  mediaLanguage?: string;
  editVoiceActorLink?: (workItem: any) => void;
  confirmDeleteVoiceActorLink?: (workItem: any) => void;
  addVoiceActorLink?: (actor: PersonData) => void;
  openVoiceActorSearch?: (actorId: number) => void;
}

const props = withDefaults(defineProps<ActorWithVoiceActorsProps>(), {
  voiceActors: () => [],
  onActorClick: () => {},
  onVoiceActorClick: () => {},
  mediaLanguage: () => '',
  editVoiceActorLink: undefined,
  confirmDeleteVoiceActorLink: undefined,
  openVoiceActorSearch: undefined,
});

// Use language preference composable
const { preferredLanguage } = useLanguagePreference();

const shouldShowVoiceActors = computed(() => {
  return props.mediaLanguage.toLowerCase() !== preferredLanguage.value.toLowerCase()
});
</script>

<style scoped lang="scss">
.actor-with-voice-actors {
  display: flex;
  flex-direction: column;
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
    display: flex;
    flex-direction: row;
    gap: 8px;
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

      .himself-item {
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background-color: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .himself-content {
          flex: 1;
          min-width: 0;

          .himself-text {
            font-size: 14px;
            font-weight: 600;
            color: #e0e0e0;
            line-height: 1.4;
          }
        }
      }
    }
  }
}

.voice-actor-item {
  width: 100%;
}
</style>
