<template>
  <div class="actor-wrapper">
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



}



</style>
