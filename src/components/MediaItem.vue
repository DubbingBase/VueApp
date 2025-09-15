<template>
  <router-link class="media-item" :to="{ name: routeName, params: routeParams }">
    <div class="poster">
      <img :src="getImage(imagePath)" alt="" />
    </div>
    <div class="caption">{{ title }}</div>
  </router-link>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { getImage } from "@/utils";

const props = defineProps({
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
});
</script>
<style lang="scss" scoped>
.media-item {
  flex-basis: 28%;
  min-width: 120px;
  max-width: 180px;
  margin: 4px;
  display: flex;
  flex-direction: column;
  vertical-align: top;
  height: auto;
  flex: 1 0 auto;
  color: inherit;
  text-decoration: none;
  border-radius: 12px;
  background-color: #2e2e2e;
  padding: 4px;

  .poster {
    max-height: 160px;
    display: flex;
    align-items: start;
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
  }
}

@media (max-width: 768px) {
  .media-item {
    flex-basis: 45%;
    min-width: 100px;
    max-width: 140px;
  }

  .poster {
    max-height: 120px;
  }
}

@media (max-width: 480px) {
  .media-item {
    flex-basis: 48%;
    min-width: 80px;
    max-width: 120px;
  }

  .poster {
    max-height: 100px;
  }

  .caption {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}
</style>
