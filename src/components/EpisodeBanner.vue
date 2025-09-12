<template>
  <div class="banner">
    <img
      v-if="episode.still_path"
      :src="getImage(episode.still_path)"
      class="poster"
      :alt="episode.name"
    />
    <div class="meta">
      <h2>Episode {{ episode.episode_number }}: {{ episode.name }}</h2>
      <div class="subtitle">
        <span v-if="episode.air_date">Diffusé le {{ episode.air_date }}</span>
      </div>
      <div class="overview" v-if="episode.overview">
        {{ episode.overview }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  episode: any;
  getImage: (path: string) => string;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.banner {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 1.5rem;

  .poster {
    width: 120px;
    border-radius: 8px;
    box-shadow: 0 2px 8px #0003;
  }

  .meta {
    flex: 1;

    h2 {
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: #888;
      font-size: 0.95em;
      margin-bottom: 0.5rem;

      span + span {
        margin-left: 1em;
      }
    }

    .overview {
      margin-top: 0.5rem;
    }
  }
}
</style>
