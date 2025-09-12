<template>
  <div v-if="movie" class="movie-info-card">
    <img v-if="movie.poster_path" class="movie-poster" :src="getImage(movie.poster_path)"
      :alt="movie.title + ' poster'" />
    <div class="movie-info">
      <div class="movie-title-row">
        <h2 class="movie-title">{{ movie.title }}</h2>
        <span v-if="movie.release_date" class="movie-year">{{ movie.release_date.slice(0, 4) }}</span>
      </div>
      <div v-if="movie.genres && movie.genres.length" class="movie-genres">
        <span v-for="genre in movie.genres" :key="genre.id" class="movie-genre-chip">{{ genre.name }}</span>
      </div>
      <div v-if="movie.vote_average" class="movie-rating">
        ⭐ {{ movie.vote_average.toFixed(1) }}
      </div>
      <div v-if="movie.overview" class="movie-overview">
        {{ movie.overview }}
      </div>
      <div class="movie-meta">
        <span v-if="movie.runtime">⏱ {{ movie.runtime }} min</span>
        <span v-if="movie.original_language">🌐 {{ movie.original_language.toUpperCase() }}</span>
        <span v-if="movie.release_date">📅 {{ movie.release_date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MovieResponse } from '../../supabase/functions/_shared/movie';

type MovieType = MovieResponse["movie"] & { runtime?: number };

interface Props {
  movie: MovieType | undefined;
  getImage: (path: string) => string;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.movie-info-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background: rgba(20, 20, 20, 0.95);
  margin: 0 auto 16px auto;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  padding: 16px;
  position: relative;
  top: -80px;
  z-index: 2;
}

.movie-poster {
  width: 120px;
  height: 180px;
  border-radius: 0.5rem;
  object-fit: cover;
  margin-right: 16px;
  background: #222;
}

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.movie-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.movie-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0;
}

.movie-year {
  color: #ccc;
  font-size: 1.1rem;
}

.movie-genres {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.movie-genre-chip {
  background: #444;
  color: #fff;
  border-radius: 1rem;
  padding: 2px 10px;
  font-size: 0.9rem;
}

.movie-rating {
  font-size: 1.2rem;
  color: gold;
}

.movie-overview {
  font-size: 1rem;
  color: #eee;
  max-height: 100px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.movie-meta {
  display: flex;
  gap: 18px;
  color: #aaa;
  font-size: 0.95rem;
}
</style>
