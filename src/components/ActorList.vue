<template>
  <div class="actors-list">
    <div class="inner-list">
      <template v-if="actors && actors.length">
        <div v-for="actor in actors" :key="actor.id" class="actor-wrapper">
          <div class="actor" @click="goToActor(actor.id)" :routerLink="{
            name: 'ActorDetails',
            params: { id: actor.id },
          }" tabindex="0" role="button" aria-label="Go to details for {{ actor.name }}">
            <ion-thumbnail class="avatar">
              <img v-if="actor.profile_path" :src="getImage(actor.profile_path)" :alt="actor.name + ' photo'" />
              <img v-else src="https://placehold.co/48x72?text=?" alt="No photo" />
            </ion-thumbnail>
            <ion-label class="line-label">
              <span class="ellipsis label actor">{{ actor.name }}</span>
              <span class="ellipsis label character">as {{ actor.character }}</span>
            </ion-label>
          </div>
          <div class="voice-actor-list">
            <template v-if="getVoiceActorByTmdbId(actor.id).length">
              <div class="voice-actor-container">
                <div class="voice-actor" @click="goToVoiceActor(item.voiceActorDetails.id)"
                  v-for="item in getVoiceActorByTmdbId(actor.id)" :key="item.voiceActorDetails.id" tabindex="0"
                  role="button"
                  aria-label="Go to details for {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}"
                >
                <MediaThumbnail
                  v-if="item.voiceActorDetails.profile_picture"
                  :path="item.voiceActorDetails.profile_picture"
                  from-storage
                ></MediaThumbnail>
                <MediaThumbnail
                  v-else
                  :path="undefined"
                ></MediaThumbnail>

                  <ion-label class="line-label">
                    <span class="ellipsis label voice-actor">
                      {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}
                    </span>
                    <span class="ellipsis label performance">
                      {{ item.performance }}
                    </span>
                  </ion-label>

                  <div class="voice-actor-actions" v-if="isAdmin">
                    <ion-button fill="clear" size="small" @click.stop="editVoiceActorLink(item)"
                      aria-label="Edit voice actor link">
                      <ion-icon :icon="createOutline"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" size="small" @click.stop="confirmDeleteVoiceActorLink(item)"
                      color="danger" aria-label="Delete voice actor link">
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="no-voice-actor">
              <div class="voice-actor-container">
                <div class="voice-actor">
                  <ion-thumbnail class="avatar">
                    <img src="https://placehold.co/48x72?text=?" alt="No photo" />
                  </ion-thumbnail>
                  <ion-label class="line-label">
                    <span class="ellipsis label">
                      No voice actor found.
                    </span>
                    <ion-button v-if="isAdmin" fill="clear" size="small" @click.stop="openVoiceActorSearch(actor)"
                      class="add-voice-actor-btn">
                      <ion-icon :icon="personAddOutline" slot="start"></ion-icon>
                      Add
                    </ion-button>
                  </ion-label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="no-actors">No actors found for this movie.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonThumbnail,
  IonLabel,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { createOutline, trashOutline, personAddOutline } from 'ionicons/icons';
import MediaThumbnail from "@/components/MediaThumbnail.vue";

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
.avatar {
  --border-radius: 4px;
  width: 48px;
  height: auto;
  min-height: 72px;
  flex: 1 0 auto;
}

.line-label {
  margin-left: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;

  .label {
    width: 100%;
    display: block;
  }

  .character {
    text-align: left;
    color: #ccc;
  }

  .actor,
  .voice-actor {
    font-weight: bold;
  }
}

.actor-wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 0 8px;
  background-color: #333;
  border-radius: 0.5rem;
  gap: 0.5rem;

  .actor {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 4px;
    background-color: #666;
    padding: 4px;
    border-radius: 4px;
  }

  .voice-actor-list {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .voice-actor-container {
    width: 100%;
  }

  .voice-actor {
    background-color: #666;
    flex: 1 0 auto;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 4px;
    border-radius: 4px;
    padding: 4px;
  }
}

.no-actors,
.no-voice-actor {
  color: var(--ion-color-medium);
  font-style: italic;
  text-align: center;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.add-voice-actor-btn {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  font-size: 0.85rem;
  height: auto;
  margin-top: 4px;
}

.add-voice-actor-btn ion-icon {
  margin-right: 4px;
}

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
