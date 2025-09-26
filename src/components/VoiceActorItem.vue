<template>
  <div v-if="item" class="voice-actor-wrapper">
    <div class="voice-actor" @click="goToVoiceActor(voiceActor.id)" tabindex="0" role="button" :aria-label="`Go to details for ${voiceActor.firstname} ${voiceActor.lastname}`">
    <MediaThumbnail
      v-if="voiceActor.profile_picture"
      :path="voiceActor.profile_picture"
      from-storage
    ></MediaThumbnail>
    <MediaThumbnail
      v-else
      :path="undefined"
    ></MediaThumbnail>

    <ion-label class="line-label">
      <span class="ellipsis label voice-actor">
        {{ voiceActor.firstname }} {{ voiceActor.lastname }}
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonLabel, IonButton, IonIcon } from "@ionic/vue";
import { createOutline, trashOutline } from 'ionicons/icons';
import MediaThumbnail from "@/components/MediaThumbnail.vue";

const props = defineProps<{
  item: {
    voiceActorDetails: any;
    performance: string;
  };
  isAdmin: boolean;
  goToVoiceActor: (id: number) => void;
  editVoiceActorLink: (item: any) => void;
  confirmDeleteVoiceActorLink: (item: any) => void;
}>();

const voiceActor = computed(() => props.item?.voiceActorDetails || props.item);
</script>

<style scoped lang="scss">
.voice-actor-wrapper {
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin: 0 8px;
  border-radius: 12px;
  gap: 8px;
  transition: all 0.3s ease;

  .voice-actor {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 8px;
    margin: 0 4px;
    border-radius: 8px;

    .voice-actor {
      padding: 6px;
      gap: 6px;
    }

    .line-label {
      margin-left: 8px;
    }
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

  .voice-actor {
    font-weight: 600;
  }

  .performance {
    text-align: left;
    color: #b0b0b0;
    font-size: 12px;
  }
}

.voice-actor-actions {
  // Admin action buttons container
}
</style>
