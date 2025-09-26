<template>
  <router-link class="media-item" :to="{ name: routeName, params: routeParams }" :style="{ flexBasis: MEDIA_ITEM_DEFAULT_WIDTH + 'px', minWidth: MEDIA_ITEM_DEFAULT_WIDTH + 'px', maxWidth: MEDIA_ITEM_DEFAULT_WIDTH + 'px' }">
    <div class="poster">
      <img v-if="!loading" :src="getImage(imagePath)" alt="" :style="{ width: MEDIA_ITEM_DEFAULT_WIDTH + 'px', height: MEDIA_ITEM_DEFAULT_HEIGHT + 'px' }" />
      <ion-skeleton-text :animated="true" v-else :style="{ width: MEDIA_ITEM_DEFAULT_WIDTH + 'px', height: MEDIA_ITEM_DEFAULT_HEIGHT + 'px', borderRadius: '12px', margin: 0 }"></ion-skeleton-text>
    </div>
    <div class="caption">
      <template v-if="!loading">{{ title }}</template>
      <ion-skeleton-text :animated="true" v-else :style="{ width: '100%', height: '32px', borderRadius: '4px', margin: 0 }"></ion-skeleton-text>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { IonSkeletonText } from "@ionic/vue";
import { getImage } from "@/utils";
import { MEDIA_ITEM_DEFAULT_WIDTH, MEDIA_ITEM_DEFAULT_HEIGHT } from "@/constants/thumbnails";

defineProps({
  imagePath: {
    type: String as PropType<string | undefined>,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  routeName: {
    type: String,
    required: true,
  },
  routeParams: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss" scoped>
.media-item {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  vertical-align: top;
  height: auto;
  flex: 1 0 auto;
  color: inherit;
  text-decoration: none;
  border-radius: 12px;
  padding: 0;

  .poster {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;

      display: flex;
      flex-direction: column;
    }
  }

  .caption {
    font-size: 14px;
    flex: 1 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 8px 4px;
    word-break: break-word;
    text-align: left;
  }
}

</style>
