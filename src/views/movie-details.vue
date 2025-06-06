<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Voix</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="actors-list">
        <div class="inner-list">
          <template v-if="actors && actors.length">
            <div v-for="actor in actors" :key="actor.id" class="actor-wrapper">
              <div
                class="actor"
                @click="goToActor(actor.id)"
                :routerLink="{
                  name: 'ActorDetails',
                  params: { id: actor.id },
                }"
                tabindex="0"
                role="button"
                aria-label="Go to details for {{ actor.name }}"
              >
                <ion-thumbnail class="avatar">
                  <img
                    v-if="actor.profile_path"
                    :src="getImage(actor.profile_path)"
                    :alt="actor.name + ' photo'"
                  />
                  <img v-else src="https://placehold.co/48x72?text=?" alt="No photo" />
                </ion-thumbnail>
                <ion-label class="line-label">
                  <span class="ellipsis label actor">{{ actor.name }}</span>
                  <span class="ellipsis label character">as {{ actor.character }}</span>
                </ion-label>
              </div>
              <div class="voice-actor-list">
                <template v-if="getVoiceActorByTmdbId(actor.id).length">
                  <div
                    class="voice-actor"
                    @click="goToVoiceActor(item.voiceActorDetails.id)"
                    v-for="item in getVoiceActorByTmdbId(actor.id)"
                    :key="item.voiceActorDetails.id"
                    tabindex="0"
                    role="button"
                    aria-label="Go to details for {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}"
                  >
                    <ion-thumbnail class="avatar">
                      <img
                        v-if="item.voiceActorDetails.profile_picture"
                        :src="getImage(item.voiceActorDetails.profile_picture)"
                        :alt="item.voiceActorDetails.firstname + ' ' + item.voiceActorDetails.lastname + ' photo'"
                      />
                      <img v-else src="https://placehold.co/48x72?text=?" alt="No photo" />
                    </ion-thumbnail>
                    <ion-label class="line-label">
                      <span class="ellipsis label voice-actor">
                        {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}
                      </span>
                      <span class="ellipsis label performance">
                        {{ item.performance }}
                      </span>
                    </ion-label>
                  </div>
                </template>
                <div v-else class="no-voice-actor">No voice actor found.</div>
              </div>
            </div>
          </template>
          <div v-else class="no-actors">No actors found for this movie.</div>
        </div>
      </div>

      <div class="background">
        <img v-if="movie" :src="getImage(movie.backdrop_path)" alt="Movie background image" />
        <div class="background-overlay"></div>
      </div>

      <div v-if="movie" class="movie-info-card">
        <img
          v-if="movie.poster_path"
          class="movie-poster"
          :src="getImage(movie.poster_path)"
          :alt="movie.title + ' poster'"
        />
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

      <ion-button :disabled="isFetching" v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="fetchInfos">
        <ion-spinner v-if="isFetching"></ion-spinner>
        <span v-else>Récupérer les informations</span>
      </ion-button>
      <div v-if="fetchError" class="fetch-error">{{ fetchError }}</div>
      <ion-spinner v-if="isLoading" class="main-spinner"></ion-spinner>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonLabel,
  IonSpinner,
  IonThumbnail,
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getImage } from "../utils";
import { MovieResponse } from "../../supabase/functions/_shared/movie";
import { supabase } from "../api/supabase";
import { WorkAndVoiceActor } from "../../supabase/functions/_shared/movie";

const route = useRoute();
const router = useRouter();

const movie = ref<MovieResponse["movie"] | undefined>();
const voiceActors = ref<MovieResponse["voiceActors"]>([]);

const actors = computed(() => {
  return movie.value?.credits.cast;
});

const getVoiceActorByTmdbId = (tmdbId: number): WorkAndVoiceActor[] => {
  const va = voiceActors.value.filter((v) => v.actor_id === tmdbId);

  return va;
};

const goToActor = (id: number) => {
  router.push({
    name: "ActorDetails",
    params: {
      id,
    },
  });
};

const goToVoiceActor = (id: number) => {
  router.push({
    name: "VoiceActorDetails",
    params: {
      id,
    },
  });
};

const wikiDataId = computed(() => {
  return movie.value?.external_ids?.wikidata_id;
});

const hasWikidataId = computed(() => {
  return !!wikiDataId.value;
});

const hasData = computed(() => {
  return voiceActors.value.length > 0;
});

const isFetching = ref(false);
const isLoading = ref(true);
const fetchError = ref<string | null>(null);

const fetchInfos = async () => {
  const id = wikiDataId.value;

  if (!id) {
    console.error("id is undefined");
    return;
  }

  console.log("id", id);
  isFetching.value = true;
  const movieResponseRaw = await supabase.functions.invoke("prepare_movie", {
    body: {
      wikiId: id,
      tmdbId: route.params.id,
      type: "movie",
    },
  });
  const data = movieResponseRaw.data;

  console.log("data", data);
  location.reload();
};

onMounted(async () => {
  const id = route.params.id;
  isLoading.value = true;
  fetchError.value = null;
  try {
    const movieResponseRaw = await supabase.functions.invoke("movie", {
      body: { id },
    });
    const data = movieResponseRaw.data as MovieResponse;
    movie.value = data.movie;
    voiceActors.value = data.voiceActors;
  } catch (e: any) {
    fetchError.value = 'Failed to load movie details.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped lang="scss">
.movie-title {
  text-align: center;
}

.header > img {
  object-fit: cover;
  width: 100%;
}

.fetch-infos-btn {
  position: fixed;
  bottom: 0px;
  right: 4px;
  padding: 4px;
  z-index: 1;
}

.avatar {
  --border-radius: 4px;
  width: 48px;
  height: auto;
  min-height: 72px;
  flex: 1 0 auto;
}

.line-label {
  margin-left: 8px;
  width: 100%;
  .label {
    width: 100%;
    display: block;
  }

  .character {
    text-align: left;
    color: #ccc;
  }

  .actor,
  .voice-actor {
    font-weight: bold;
  }
}

.actor-wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 0 8px;
  background-color: #333;
  border-radius: 0.5rem;
  gap:0.5rem;

  .actor {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 4px;
    background-color: #666;
    padding: 4px;
    border-radius: 4px;
  }

  .voice-actor-list {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .voice-actor {
    background-color: #666;
    flex: 1 0  auto;
    width: 90%;
    display: flex;
    flex-direction: row;
    gap: 4px;
    border-radius: 4px;
    padding: 4px;
  }
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 210px;
  overflow: hidden;
}
.background img {
  width: 100vw;
  height: 210px;
  object-fit: cover;
  filter: blur(2px) brightness(0.6);
}
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 210px;
  background: rgba(0,0,0,0.5);
  z-index: 1;
}

.movie-info-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background: rgba(20,20,20,0.95);
  margin: 0 auto 16px auto;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.3);
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
}
.movie-meta {
  display: flex;
  gap: 18px;
  color: #aaa;
  font-size: 0.95rem;
}
.main-spinner {
  display: block;
  margin: 32px auto;
}
.fetch-error {
  color: #ff6666;
  text-align: center;
  margin-top: 16px;
}
.no-actors, .no-voice-actor {
  color: #bbb;
  text-align: center;
  margin: 12px 0;
}


.actors-list {
  z-index: 1;
  position: relative;
  padding-top: 200px;

  .inner-list {
    background-color: #000;
    display: flex;
    gap: 8px;
    flex-direction: column;
    border-radius: 2rem;
    padding-top: 8px;
  }
}
</style>
