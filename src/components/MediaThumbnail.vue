<template>
  <div class="avatar">
    <IonImg class="avatar-image" v-if="src" :src="src" />
  </div>
</template>

<script lang="ts" setup>
import { getImage } from "@/utils";
import { computed, toRefs } from "vue";
import { IonImg } from "@ionic/vue";
import { supabase } from "@/api/supabase";
import { computedAsync } from "@vueuse/core";
import { THUMBNAIL_DEFAULT_WIDTH, THUMBNAIL_DEFAULT_HEIGHT } from '@/constants/thumbnails';

const props = defineProps({
  path: {
    type: String,
    required: false,
    default: undefined,
  },
  height: {
    type: Number,
    required: false,
    default: THUMBNAIL_DEFAULT_HEIGHT,
  },
  width: {
    type: Number,
    required: false,
    default: THUMBNAIL_DEFAULT_WIDTH,
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
  },
  fromStorage: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { path, height, width, rawPath, radius, fromStorage } = toRefs(props);

const defaultSrc = computed(() => {
  return `https://placehold.co/${width.value}x${height.value}?text=?`;
});

const src = computed(() => {
  console.log("---");
  if (!path?.value) {
    console.log("path is undefined");
    return defaultSrc.value;
  }

  if(rawPath.value){
    console.log("rawPath is true");
    return path.value;
  }

  if(fromStorage.value){
    console.log("fromStorage is true", getImageUrl.value);
    return getImageUrl.value;
  }

  console.log("getImage");
  return getImage(path.value);
});

const getImageUrl = computedAsync(async () => {
  if (!path?.value) {
    console.log("path is undefined in getImageUrl");
    return defaultSrc.value;
  }

  const oldImage = supabase.storage
    .from('voice_actor_profile_pictures')
    .getPublicUrl(path.value);
  console.log("oldImage", oldImage)

  if (!oldImage.data?.publicUrl) {
    console.log("publicUrl is undefined, using default");
    return defaultSrc.value;
  }

  return oldImage.data.publicUrl;
}, defaultSrc.value);

const heightStyle = computed(() => {
  return `${height.value}px`;
});
const widthStyle = computed(() => {
  return `${width.value}px`;
});
</script>

<style lang="scss" scoped>
.avatar-image::part(image) {
  display: block;
  overflow: hidden;
  object-fit: cover;
  border-radius: var(--thumbnail-border-radius);
  height: v-bind(heightStyle);
  width: v-bind(widthStyle);
  border: var(--thumbnail-border);
  box-shadow: var(--thumbnail-box-shadow-small);
}
</style>
