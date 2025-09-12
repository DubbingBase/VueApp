<template>
  <div class="voice-actor" @click="goToVoiceActor(item.voiceActorDetails.id)" tabindex="0" role="button" :aria-label="`Go to details for ${item.voiceActorDetails.firstname} ${item.voiceActorDetails.lastname}`">
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
      <ion-button fill="clear" size="small" @click.stop="editVoiceActorLink(item)" aria-label="Edit voice actor link">
        <ion-icon :icon="createOutline"></ion-icon>
      </ion-button>
      <ion-button fill="clear" size="small" @click.stop="confirmDeleteVoiceActorLink(item)" color="danger" aria-label="Delete voice actor link">
        <ion-icon :icon="trashOutline"></ion-icon>
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonLabel, IonButton, IonIcon } from "@ionic/vue";
import { createOutline, trashOutline } from 'ionicons/icons';
import MediaThumbnail from "@/components/MediaThumbnail.vue";

defineProps<{
  item: {
    voiceActorDetails: any;
    performance: string;
  };
  isAdmin: boolean;
  goToVoiceActor: (id: number) => void;
  editVoiceActorLink: (item: any) => void;
  confirmDeleteVoiceActorLink: (item: any) => void;
}>();
</script>

<style scoped lang="scss">
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

.line-label {
  margin-left: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;

  .label {
    width: 100%;
    display: block;
  }

  .voice-actor {
    font-weight: bold;
  }
}

.voice-actor-actions {
  // Admin action buttons container
}
</style>
