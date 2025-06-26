<template>
  <div class="avatar">
    <IonImg class="avatar-image" v-if="path" :src="src" />
    <IonImg class="avatar-image" v-else :src="defaultSrc" />
  </div>
</template>

<script lang="ts" setup>
import { getImage } from "@/utils";
import { computed, toRefs } from "vue";
import { IonImg } from "@ionic/vue";

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
  radius: {
    type: String,
    required: false,
    default: '0',
  },
  rawPath: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const { path, height, width, rawPath, radius } = toRefs(props);

const src = computed(() => {
  if (!path?.value) {
    return defaultSrc.value;
  }
  return rawPath.value ? path.value : getImage(path.value);
});

const heightStyle = computed(() => {
  return `${height.value}px`;
});
const widthStyle = computed(() => {
  return `${width.value}px`;
});

const defaultSrc = computed(() => {
  return `https://placehold.co/${width.value}x${height.value}?text=?`;
});
</script>

<style lang="scss" scoped>
.avatar-image::part(image) {
  display: block;
  overflow: hidden;
  object-fit: cover;
  border-radius: v-bind(radius);
  height: v-bind(heightStyle);
  width: v-bind(widthStyle);
}
</style>