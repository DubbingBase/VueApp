<template>
  <MediaItem
    :imagePath="value.poster_path"
    :title="value.title"
    :routeName="'MovieDetails'"
    :routeParams="{ id: value.id }"
  />
</template>

<script lang="ts" setup>
 import { PropType, toRefs } from "vue";
 import { Movie } from "../../supabase/functions/_shared/movie";
 import MediaItem from "./MediaItem.vue";

 const props = defineProps({
   value: {
     type: Object as PropType<Movie>,
     required: true,
   },
 });

 const { value } = toRefs(props);
</script>

