<template>
  <div class="voice-actor-item" @click="navigate">
    <div class="poster">
      <img :src="profileImage" alt="" />
    </div>
    <div class="caption">{{ fullName }}</div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from "vue";
import { Tables } from "../../supabase/functions/_shared/database.types";
import { useRouter } from "vue-router";

type VoiceActor = Tables<'voice_actors'>;

const props = defineProps({
  value: {
    type: Object as PropType<VoiceActor>,
    required: true,
  },
});

const router = useRouter();

const fullName = computed(() => `${props.value.firstname} ${props.value.lastname}`);

const profileImage = computed(() => {
  if (props.value.profile_picture) {
    return props.value.profile_picture;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${fullName.value}`;
});

const navigate = () => {
  router.push({
    name: "VoiceActorDetails",
    params: {
      id: props.value.id,
    },
  });
};
</script>

<style lang="scss" scoped>
.voice-actor-item {
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
  cursor: pointer;

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
  .voice-actor-item {
    flex-basis: 45%;
    min-width: 100px;
    max-width: 140px;
  }

  .poster {
    max-height: 120px;
  }
}

@media (max-width: 480px) {
  .voice-actor-item {
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
