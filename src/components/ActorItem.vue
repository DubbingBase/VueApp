<template>
  <div class="actor-wrapper">
    <div class="character-name">{{ actor.character || actor.name }}</div>
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
      </ion-label>
    </div>
    <VoiceActorList :voiceActors="voiceActors" :actor="actor" :isAdmin="isAdmin" :goToVoiceActor="goToVoiceActor" :editVoiceActorLink="editVoiceActorLink" :confirmDeleteVoiceActorLink="confirmDeleteVoiceActorLink" :openVoiceActorSearch="openVoiceActorSearch" />
  </div>
</template>

<script setup lang="ts">
import {
  IonThumbnail,
  IonLabel,
} from "@ionic/vue";
import VoiceActorList from "@/components/VoiceActorList.vue";

defineProps<{
  actor: any;
  voiceActors: any[];
  isAdmin: boolean;
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
  --border-radius: 8px;
  width: 48px;
  height: auto;
  min-height: 72px;
  flex: 1 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.line-label {
  margin-left: 12px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  .label {
    width: 100%;
    display: block;
    color: #e0e0e0;
    font-size: 14px;
    line-height: 1.4;
  }

  .character {
    text-align: left;
    color: #b0b0b0;
    font-size: 12px;
  }

  .actor,
  .voice-actor {
    font-weight: 600;
  }
}

.actor-wrapper {
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin: 0 8px;
  background: #1a1a2e;
  border-radius: 12px;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .character-name {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    margin-bottom: 4px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .actor {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 8px;
    background: #16213e;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);

    &:hover {
      background: #0f3460;
      transform: scale(1.02);
    }

    &:focus {
      outline: 2px solid #533483;
      outline-offset: 2px;
    }
  }

  @media (max-width: 768px) {
    padding: 8px;
    margin: 0 4px;
    border-radius: 8px;

    .actor {
      padding: 6px;
      gap: 6px;
    }

    .line-label {
      margin-left: 8px;
    }
  }
}



</style>
