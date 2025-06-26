<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Accueil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Bienvenue !</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="trending-movies">
        <div class="list-header">🎬 Tendances - Films</div>
        <div class="movies">
          <template v-if="isLoadingMovies">
            <div v-for="i in 3" :key="'movie-skeleton-' + i" class="skeleton-loader"></div>
          </template>
          <template v-else-if="errorMovies">
            <div class="error-message">Impossible de charger les films populaires. Veuillez réessayer plus tard.</div>
          </template>
          <template v-else-if="trendingMovies.length === 0">
            <div class="empty-message">Aucun film tendance trouvé.</div>
          </template>
          <template v-else>
            <Movie
              :key="movie.id"
              v-for="movie in trendingMovies"
              :value="movie"
            ></Movie>
          </template>
        </div>
      </div>
      <div class="trending-series">
        <div class="list-header">📺 Tendances - Séries</div>
        <div class="series">
          <template v-if="isLoadingSeries">
            <div v-for="i in 3" :key="'series-skeleton-' + i" class="skeleton-loader"></div>
          </template>
          <template v-else-if="errorSeries">
            <div class="error-message">Impossible de charger les séries populaires. Veuillez réessayer plus tard.</div>
          </template>
          <template v-else-if="trendingSeries.length === 0">
            <div class="empty-message">Aucune série tendance trouvée.</div>
          </template>
          <template v-else>
            <Show
              :key="show.id"
              v-for="show in trendingSeries"
              :value="show"
            ></Show>
          </template>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { TrendingResponse } from "../../supabase/functions/_shared/movie";
import Movie from "../components/Movie.vue";
import Show from "../components/Serie.vue";
import { supabase } from "../api/supabase";
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/vue";

const trendingMovies = ref<TrendingResponse["results"]>([]);
const trendingSeries = ref<TrendingResponse["results"]>([]);
const isLoadingMovies = ref(true);
const isLoadingSeries = ref(true);
const errorMovies = ref("");
const errorSeries = ref("");

onMounted(async () => {
  isLoadingMovies.value = true;
  isLoadingSeries.value = true;
  errorMovies.value = "";
  errorSeries.value = "";
  try {
    const trendingMovieResponseRaw = await supabase.functions.invoke("trending-movies");
    if (trendingMovieResponseRaw.error) throw new Error(trendingMovieResponseRaw.error.message || "Erreur inconnue");
    trendingMovies.value = trendingMovieResponseRaw.data.results || [];
  } catch (e: any) {
    errorMovies.value = e.message || "Erreur lors du chargement des films.";
    trendingMovies.value = [];
  } finally {
    isLoadingMovies.value = false;
  }

  try {
    const trendingSeriesResponseRaw = await supabase.functions.invoke("trending-shows");
    if (trendingSeriesResponseRaw.error) throw new Error(trendingSeriesResponseRaw.error.message || "Erreur inconnue");
    trendingSeries.value = trendingSeriesResponseRaw.data.results || [];
  } catch (e: any) {
    errorSeries.value = e.message || "Erreur lors du chargement des séries.";
    trendingSeries.value = [];
  } finally {
    isLoadingSeries.value = false;
  }
});
</script>

<style scoped lang="scss">
.movies,
.series {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 8px 0 16px 0;
  overflow-x: auto;
  scroll-padding: 16px;
  height: 248px;
}

.skeleton-loader {
  height: 169px;
  max-width: 160px;
  aspect-ratio: 3/4;
  min-width: 80px;
  min-height: 120px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ececec 25%, #f3f3f3 37%, #ececec 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

@media (max-width: 600px) {
  .skeleton-loader {
    width: 40vw;
    max-width: 120px;
  }
}

@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.trending-movies, .trending-series {
  margin-bottom: 32px;
  padding-left: 12px;
}

.list-header {
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 1.15em;
  letter-spacing: 0.02em;
}

.error-message {
  color: #d32f2f;
  background: #fff0f0;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 8px 0;
}

.empty-message {
  color: #777;
  font-style: italic;
  margin: 8px 0;
}

</style>
