<template>
  <ion-thumbnail class="avatar">
    <img v-if="path" :src="src" />
    <img v-else :src="defaultSrc" />
  </ion-thumbnail>
</template>

<script lang="ts" setup>
import { getImage } from "@/utils";
import { computed, toRefs } from "vue";
import { IonThumbnail } from "@ionic/vue";

const props = defineProps({
  path: {
    type: String,
    required: false,
    default: undefined,
  },
  height: {
    type: Number,
    required: false,
    default: 72,
  },
  width: {
    type: Number,
    required: false,
    default: 48,
  },
  rawPath: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const { path, height, width, rawPath } = toRefs(props);

const src = computed(() => {
  if (!path?.value) {
    return defaultSrc.value;
  }
  return rawPath.value ? path.value : getImage(path.value);
});

const defaultSrc = computed(() => {
  return `https://placehold.co/${width.value}x${height.value}?text=?`;
});
</script>

<style lang="scss" scoped></style>
