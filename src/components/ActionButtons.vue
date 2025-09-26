<template>
  <div class="action-buttons">
    <ion-button :disabled="isFetching" v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="$emit('fetch-infos')">
      <LoadingSpinner v-if="isFetching" :inline="true"></LoadingSpinner>
      <span v-else>Récupérer les informations</span>
    </ion-button>

    <ion-button
      v-if="hasWikidataId && !hasData"
      class="scan-btn"
      @click="$emit('take-photo')"
      :disabled="isScanning"
    >
      <LoadingSpinner v-if="isScanning" :inline="true"></LoadingSpinner>
      <ion-icon v-else :icon="cameraOutline" slot="start"></ion-icon>
      Scanner
    </ion-button>
  </div>
  <div v-if="fetchError" class="fetch-error">{{ fetchError }}</div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from "@ionic/vue";
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { cameraOutline } from 'ionicons/icons';

defineProps<{
  hasWikidataId: boolean;
  hasData: boolean;
  isFetching: boolean;
  isScanning: boolean;
  fetchError?: string;
}>();

defineEmits<{
  'fetch-infos': [];
  'take-photo': [];
}>();
</script>

<style scoped lang="scss">
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px auto;
  padding: 0 16px;
  max-width: 600px;
}

.fetch-infos-btn,
.scan-btn {
  flex: 1;
  --border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
  font-weight: 500;
  margin: 0;
  min-width: 0;
}

.fetch-infos-btn {
  --background: var(--ion-color-primary);
  --color: white;
}

.scan-btn {
  --background: var(--ion-color-medium);
  --color: var(--ion-color-dark);
  --background-hover: var(--ion-color-medium-shade);
  --background-activated: var(--ion-color-medium-tint);
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .fetch-infos-btn,
  .scan-btn {
    width: 100%;
  }
}

.fetch-error {
  color: #ff6666;
  text-align: center;
  margin-top: 16px;
}
</style>
