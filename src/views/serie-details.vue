<template>
  <ion-page>
    <ion-header class="header">
      <ion-toolbar class="toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" />
        </ion-buttons>
        <ion-title>{{ show?.name || "Détails de la série" }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" aria-label="Paramètres">
            <SolarSettingsMinimalisticOutline />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Banner with backdrop and metadata -->
      <div class="banner" v-if="show">
        <img
          class="banner-backdrop"
          width="100%"
          :src="getImage(show.backdrop_path)"
          alt="Backdrop"
          v-if="show.backdrop_path"
        />
        <div class="banner-overlay"></div>
      </div>
      <div v-else class="banner banner-placeholder">
        <div class="banner-title">Chargement…</div>
      </div>

      <div v-if="show" class="movie-info-card">
        <img
          v-if="show.poster_path"
          class="movie-poster"
          :src="getImage(show.poster_path)"
          :alt="show.title + ' poster'"
        />
        <div class="movie-info">
          <div class="movie-title-row">
            <h2 class="movie-title">{{ show.title }}</h2>
            <span v-if="show.first_air_date" class="movie-year">{{
              show.first_air_date.slice(0, 4)
            }}</span>
          </div>
          <div v-if="show.genres && show.genres.length" class="movie-genres">
            <span
              v-for="genre in show.genres"
              :key="genre.id"
              class="movie-genre-chip"
              >{{ genre.name }}</span
            >
          </div>
          <div v-if="show.vote_average" class="movie-rating">
            ⭐ {{ show.vote_average.toFixed(1) }}
          </div>
          <div v-if="show.overview" class="movie-overview">
            {{ show.overview }}
          </div>
          <div class="movie-meta">
            <span v-if="show.original_language"
              >🌐 {{ show.original_language.toUpperCase() }}</span
            >
            <span v-if="show.first_air_date">📅 {{ show.first_air_date }}</span>
          </div>
        </div>
      </div>

      <ion-spinner
        v-if="isLoading"
        class="loading-spinner"
        name="crescent"
      ></ion-spinner>

      <div class="tabs" v-show="!isLoading">
        <div class="summary">
          <div v-if="show" class="show-title">{{ show.name }}</div>
        </div>
        <ion-segment scrollable>
          <ion-segment-button value="details" content-id="details">
            <!-- <ion-icon :icon="playCircle" /> -->
            Détail
          </ion-segment-button>
          <ion-segment-button value="seasons" content-id="seasons">
            <!-- <ion-icon :icon="radio" /> -->
            Saisons
          </ion-segment-button>
          <ion-segment-button value="peoples" content-id="peoples">
            <!-- <ion-icon :icon="search" /> -->
            Personnes
          </ion-segment-button>
        </ion-segment>
        <ion-segment-view>
          <ion-segment-content class="segmented-content" id="details">
            <div class="example-content" v-if="show">
              <div class="banner-title">{{ show.title }}</div>
              <div
                class="banner-genres"
                v-if="show.genres && show.genres.length"
              >
                <span
                  v-for="genre in show.genres"
                  :key="genre.id"
                  class="genre-chip"
                  >{{ genre.name }}</span
                >
              </div>
              <div class="banner-stats">
                <span v-if="show.vote_average"
                  >⭐ {{ show.vote_average.toFixed(1) }}</span
                >
                <span v-if="show.status">• {{ show.status }}</span>
                <span v-if="show.first_air_date"
                  >• {{ show.first_air_date
                  }}<span
                    v-if="
                      show.last_air_date &&
                      show.last_air_date !== show.first_air_date
                    "
                  >
                    – {{ show.last_air_date }}</span
                  ></span
                >
              </div>
              <div class="banner-overview" v-if="show.overview">
                {{ show.overview }}
              </div>
            </div>
          </ion-segment-content>
          <ion-segment-content class="segmented-content" id="seasons">
            <div class="seasons" v-if="show">
              <div
                expand="block"
                @click="goToSeason(show.id, season.season_number)"
                class="season"
                v-for="season in show.seasons"
                :key="season.id"
              >
                <MediaThumbnail :path="season.poster_path"></MediaThumbnail>
                <div class="text">
                  <div class="season-title">{{ season.name }}</div>
                  <div class="season-subtitle">
                    {{ season.air_date }} &sdot;
                    {{ season.episode_count }} épisodes
                  </div>
                </div>
              </div>
            </div>
          </ion-segment-content>
          <ion-segment-content class="segmented-content" id="peoples">
            <div class="actors-list">
              <div class="inner-list">
                <div
                  v-for="actor in actors"
                  :key="actor.id"
                  class="actor-wrapper"
                >
                  <div
                    class="actor"
                    @click="goToActor(actor.id)"
                    :routerLink="{
                      name: 'ActorDetails',
                      params: { id: actor.id },
                    }"
                    aria-label="Voir les détails de l'acteur {{ actor.name }}"
                  >
                    <ion-thumbnail class="avatar">
                      <img
                        v-if="actor.profile_path"
                        :src="getImage(actor.profile_path)"
                        :alt="actor.name"
                      />
                      <img
                        v-else
                        src="https://placehold.co/48x72?text=?"
                        alt="?"
                      />
                    </ion-thumbnail>
                    <ion-label class="line-label">
                      <span class="ellipsis label actor">{{ actor.name }}</span>
                      <span class="ellipsis label character"
                        >as {{ actor.character }}</span
                      >
                    </ion-label>
                  </div>
                  <template v-if="getVoiceActorByTmdbId(actor.id).length">
                    <div class="voice-actor-container">
                      <div
                        class="voice-actor"
                        v-for="item in getVoiceActorByTmdbId(actor.id)"
                        :key="item.voiceActorDetails.id"
                        @click="goToVoiceActor(item.voiceActorDetails.id)"
                        aria-label="Voir les détails de la voix de {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}"
                      >
                        <ion-thumbnail class="avatar">
                          <img
                            v-if="item.voiceActorDetails.profile_picture"
                            :src="
                              getImage(item.voiceActorDetails.profile_picture)
                            "
                            :alt="
                              item.voiceActorDetails.firstname +
                              ' ' +
                              item.voiceActorDetails.lastname
                            "
                          />
                          <img
                            v-else
                            src="https://placehold.co/48x72?text=VA"
                            :alt="
                              item.voiceActorDetails.firstname +
                              ' ' +
                              item.voiceActorDetails.lastname
                            "
                          />
                        </ion-thumbnail>
                        <ion-label class="line-label">
                          <span class="ellipsis label voice-actor">
                            {{ item.voiceActorDetails.firstname }}
                            {{ item.voiceActorDetails.lastname }}
                          </span>
                          <span class="ellipsis label performance">
                            {{ item.performance }}
                          </span>
                        </ion-label>
                        <div class="voice-actor-actions" v-if="isAdmin">
                          <ion-button
                            fill="clear"
                            size="small"
                            @click.stop="editVoiceActorLink(item)"
                            aria-label="Modifier le doubleur"
                          >
                            <ion-icon :icon="createOutline"></ion-icon>
                          </ion-button>
                          <ion-button
                            fill="clear"
                            size="small"
                            @click.stop="confirmDeleteVoiceActorLink(item)"
                            color="danger"
                            aria-label="Supprimer le doubleur"
                          >
                            <ion-icon :icon="trashOutline"></ion-icon>
                          </ion-button>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div v-else class="no-voice-actor">
                    <div class="voice-actor-container">
                      <div class="voice-actor">
                        <ion-thumbnail class="avatar">
                          <img
                            src="https://placehold.co/48x72?text=?"
                            alt="No photo"
                          />
                        </ion-thumbnail>
                        <ion-label class="line-label">
                          <span class="ellipsis label">
                            No voice actor found.
                          </span>
                          <ion-button
                            v-if="isAdmin"
                            fill="clear"
                            size="small"
                            @click.stop="openVoiceActorSearch(actor)"
                            class="add-voice-actor-btn"
                          >
                            <ion-icon
                              :icon="personAddOutline"
                              slot="start"
                            ></ion-icon>
                            Add
                          </ion-button>
                        </ion-label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ion-segment-content>
        </ion-segment-view>
      </div>

      <ion-button
        :disabled="isFetching"
        v-if="hasWikidataId && !hasData"
        class="fetch-infos-btn"
        @click="fetchInfos"
      >
        <ion-spinner v-if="isFetching"></ion-spinner>
        <span v-else
          >Récupérer les informations {{ wikiDataId }} {{ hasData }}</span
        >
      </ion-button>

      <!-- Voice Actor Search Modal -->
      <ion-modal
        :is-open="showVoiceActorSearch"
        @didDismiss="showVoiceActorSearch = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Select Voice Actor</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showVoiceActorSearch = false">
                <ion-icon :icon="closeCircle"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
          <ion-toolbar>
            <ion-searchbar
              v-model="searchTerm"
              @ionInput="searchVoiceActors"
              placeholder="Search voice actors..."
              animated
              :debounce="300"
            ></ion-searchbar>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list>
            <ion-item v-if="isSearching" class="ion-text-center">
              <ion-spinner></ion-spinner>
            </ion-item>
            <ion-item v-else-if="searchError" class="ion-text-center">
              <ion-text color="danger">{{ searchError }}</ion-text>
            </ion-item>
            <ion-item
              v-else-if="!searchResults.length && searchTerm"
              class="ion-text-center"
            >
              <ion-text>No voice actors found</ion-text>
            </ion-item>
            <ion-item
              v-for="va in searchResults"
              :key="va.id"
              button
              @click="linkVoiceActor(va, route.params.id as string)"
            >
              <ion-avatar slot="start" v-if="va.profile_picture">
                <img
                  :src="va.profile_picture"
                  :alt="va.firstname + ' ' + va.lastname"
                />
              </ion-avatar>
              <ion-avatar slot="start" v-else>
                <img
                  src="https://placehold.co/40?text=VA"
                  :alt="va.firstname + ' ' + va.lastname"
                />
              </ion-avatar>
              <ion-label>
                <h3>{{ va.firstname }} {{ va.lastname }}</h3>
                <p v-if="va.nationality">{{ va.nationality }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonSegment,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonLabel,
  IonSpinner,
  IonThumbnail,
  IonIcon,
  IonModal,
  IonSearchbar,
  IonList,
  IonItem,
  IonText,
  IonAvatar,
  toastController,
} from "@ionic/vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useIonRouter } from "@ionic/vue";
import MediaThumbnail from "@/components/MediaThumbnail.vue";
import { useVoiceActorManagement } from "@/composables/useVoiceActorManagement";
import {
  personAddOutline,
  createOutline,
  trashOutline,
  closeCircle,
} from "ionicons/icons";
import SolarSettingsMinimalisticOutline from "~icons/solar/settings-minimalistic-outline";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/api/supabase";

const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);

const route = useRoute();
const ionRouter = useIonRouter();

const show = ref<any>(null);
const isLoading = ref(true);
const isFetching = ref(false);
const error = ref("");

// Initialize voice actor management
const {
  // State
  showVoiceActorSearch,
  searchTerm,
  searchResults,
  isSearching,
  searchError,
  voiceActors,
  isLoading: isLoadingVoiceActors,
  error: voiceActorError,

  // Methods
  getImage,
  getVoiceActorByTmdbId,
  openVoiceActorSearch,
  searchVoiceActors,
  linkVoiceActor,
  editVoiceActorLink,
  confirmDeleteVoiceActorLink,
  deleteVoiceActorLink,
  goToVoiceActor,
} = useVoiceActorManagement("tv");

const actors = computed(() => {
  return show.value?.credits?.cast || [];
});

// Voice actor methods are now provided by the composable

const wikiDataId = computed(() => {
  return show.value?.external_ids?.wikidata_id;
});

const hasWikidataId = computed(() => {
  return !!wikiDataId.value;
});

const hasData = computed(() => {
  return voiceActors.value.length > 0;
});

const getSerie = async (id: string) => {
  try {
    const response = await supabase.functions.invoke("show", {
      body: { id },
    });
    return response;
  } catch (e: any) {
    console.error("Error fetching series data:", e);
    error.value = "Failed to load series details.";
    throw e;
  }
};

const fetchInfos = async () => {
  const id = wikiDataId.value;

  if (!id) {
    console.error("id is undefined");
    return;
  }

  console.log("id", id);
  isFetching.value = true;
  const showResponseRaw = await supabase.functions.invoke("prepare_movie", {
    body: {
      wikiId: id,
      tmdbId: route.params.id,
      type: "tv",
    },
  });
  const data = showResponseRaw.data;

  console.log("data", data);
  if (data.ok) {
    location.reload();
  } else {
    toastController
      .create({
        message: data.error,
        duration: 2000,
        position: "top",
        color: "danger",
      })
      .then((toast) => {
        toast.present();
      });
    isFetching.value = false;
    isLoading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  const id = route.params.id;
  try {
    const response = await getSerie(id as string);
    show.value = response.data.serie || response.data.show; // Handle both response formats
    show.value.credits = response.data.aggregateCredits;
    // Load voice actors for this serie
    if (response.data.voiceActors) {
      voiceActors.value = response.data.voiceActors;
    }
  } catch (err) {
    console.error("Error fetching serie:", err);
    error.value = "Failed to load serie details";
  } finally {
    isLoading.value = false;
  }
});

// Navigation methods
const goToSeason = (id: number, seasonNumber: number) => {
  ionRouter.push({
    name: "SeasonDetails",
    params: {
      id: id,
      season: seasonNumber,
    },
  });
};

const goToActor = (id: number) => {
  ionRouter.push({
    name: "ActorDetails",
    params: { id },
  });
};
</script>

<style scoped lang="scss">
$coverHeight: 150px;
$block: #1d1d1d;
$background: #1b1b1b;
$border: #1b1b1b;

.show-title {
  text-align: center;
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
}

.line-label {
  margin-left: 8px;
  .label {
    width: 100%;
    display: block;
  }

  .character {
    text-align: left;
    color: #777;
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
  background-color: #{$block};
  border-radius: 0.5rem;
  gap: 0.5rem;

  .actor {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  .voice-actor {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 4px;
  }
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $coverHeight;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

.tabs {
  z-index: 1;
  position: relative;
  top: -80px;
}

.summary {
  background-color: #{$block};
}

.actors-list {
  .inner-list {
    display: flex;
    gap: 8px;
    flex-direction: column;
    border-radius: 2rem;
    padding-top: 8px;
  }
}

ion-segment {
  --background: #{$block};
  border-radius: 0;
}

.segmented-content {
  background-color: #{$background};
}

.seasons {
  margin: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .season {
    --background: #{$block};
    --color: #000;
    --padding-bottom: 0;
    --padding-top: 0;
    --padding-end: 0;
    --padding-start: 0;

    display: flex;
    flex-direction: row;
    gap: 16px;
    background-color: #{$block};
    border-radius: 8px;
    border: 2px solid #{$border};
    padding: 8px;

    &::part(native) {
      .button-inner {
        width: 100%;
      }
    }
  }
}

.toolbar {
  --background: transparent !important;
  --border-width: 0 !important;
}

.no-actors,
.no-voice-actor {
  color: var(--ion-color-medium);
  font-style: italic;
  padding: 10px 0;
  text-align: center;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
}


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
}

.movie-meta {
  display: flex;
  gap: 18px;
  color: #aaa;
  font-size: 0.95rem;
}
</style>
