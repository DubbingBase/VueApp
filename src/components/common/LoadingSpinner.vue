<template>
  <div class="loading-container" :class="{ 'inline': inline }">
    <ion-spinner
      :name="name"
      :color="color"
      :size="size"
    ></ion-spinner>
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue'

interface Props {
  name?: 'crescent' | 'bubbles' | 'circles' | 'circular' | 'dots' | 'lines' | 'lines-small' | 'lines-sharp' | 'lines-sharp-small'
  color?: string
  size?: string
  text?: string
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'crescent',
  color: 'primary',
  size: undefined,
  text: '',
  inline: false
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-container.inline {
  flex-direction: row;
  gap: 0.5rem;
}

.loading-text {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}
</style>
