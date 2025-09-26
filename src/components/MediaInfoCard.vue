<template>
  <div v-if="media" class="media-info-card">
    <img v-if="media.poster_path" class="media-poster" :src="getImage(media.poster_path)"
      :alt="(media.title || media.name) + ' poster'" />
    <div class="media-info">
      <div class="media-title-row">
        <h2 class="media-title">{{ media.title || media.name }}</h2>
      </div>
      <div v-if="media.genres && media.genres.length" class="media-genres">
        <span v-for="genre in media.genres" :key="genre.id" class="media-genre-chip">{{ genre.name }}</span>
      </div>
      <div v-if="media.vote_average" class="media-rating">
        ⭐ {{ media.vote_average.toFixed(1) }}
      </div>
      <div v-if="media.overview" class="media-overview">
        {{ media.overview }}
      </div>
      <div class="media-meta">
        <span v-if="media.runtime && !media.first_air_date">⏱ {{ media.runtime }} min</span>
        <span v-if="media.original_language">🌐 {{ media.original_language.toUpperCase() }}</span>
        <span v-if="media.release_date || media.first_air_date">📅 {{ media.release_date || media.first_air_date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MovieResponse } from '../../supabase/functions/_shared/movie';

type MovieType = MovieResponse["movie"] & { runtime?: number };
type SerieType = {
  id: number;
  name?: string;
  title?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  original_language?: string;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  genres?: { id: number; name: string }[];
  status?: string;
  seasons?: any[];
  external_ids?: { wikidata_id?: string };
  credits?: { cast?: any[] };
  runtime?: number;
};

type MediaType = MovieType | SerieType;

interface Props {
  media: MediaType | undefined;
  getImage: (path: string) => string;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.media-info-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background: rgba(20, 20, 20, 0.95);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  padding: 16px;
  position: relative;
  z-index: 2;
}

.media-poster {
  width: 120px;
  height: 180px;
  border-radius: 0.5rem;
  object-fit: cover;
  margin-right: 16px;
  background: #222;
}

.media-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.media-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.media-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.media-year {
  color: #ccc;
  font-size: 1.1rem;
}

.media-genres {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.media-genre-chip {
  background: #444;
  color: #fff;
  padding: 2px 10px;
  font-size: 0.9rem;
}

.media-rating {
  font-size: 1.2rem;
  color: gold;
}

.media-overview {
  font-size: 1rem;
  color: #eee;
  max-height: 100px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.media-meta {
  display: flex;
  gap: 18px;
  color: #aaa;
  font-size: 0.95rem;
}
</style>
