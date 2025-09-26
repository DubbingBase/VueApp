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

      <MediaInfoCard :media="show" :getImage="getImage" />

      <LoadingSpinner v-if="isLoading" />

      <div class="tabs" v-show="!isLoading">
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
            <ActorList
              :actors="actors"
              :voice-actors="voiceActors"
              :is-admin="isAdmin"
              :get-voice-actor-by-tmdb-id="getVoiceActorByTmdbId"
              :go-to-actor="goToActor"
              :go-to-voice-actor="goToVoiceActor"
              :edit-voice-actor-link="editVoiceActorLink"
              :confirm-delete-voice-actor-link="confirmDeleteVoiceActorLink"
              :open-voice-actor-search="openVoiceActorSearch"
              :get-image="getImage"
            />
          </ion-segment-content>
        </ion-segment-view>
      </div>

      <ActionButtons
        :has-wikidata-id="hasWikidataId"
        :has-data="hasData"
        :is-fetching="isFetching"
        :is-scanning="isScanning"
        @fetch-infos="fetchInfos"
        @take-photo="takePhoto"
      />

      <ion-toast
        :is-open="showScanResult"
        :message="scanResult"
        :duration="3000"
        @didDismiss="showScanResult = false"
      ></ion-toast>

      <VoiceActorSearchModal
        :is-open="showVoiceActorSearch"
        :search-term="searchTerm"
        :search-results="searchResults"
        :is-searching="isSearching"
        :search-error="searchError"
        :media-id="route.params.id as string"
        :search-voice-actors="searchVoiceActors"
        :link-voice-actor="linkVoiceActor"
        @close="showVoiceActorSearch = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonSegment,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  toastController,
  IonToast,
} from "@ionic/vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useIonRouter } from "@ionic/vue";
import MediaThumbnail from "@/components/MediaThumbnail.vue";
import MediaInfoCard from "@/components/MediaInfoCard.vue";
import ActorList from "@/components/ActorList.vue";
import ActionButtons from "@/components/ActionButtons.vue";
import VoiceActorSearchModal from "@/components/VoiceActorSearchModal.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import { useVoiceActorManagement } from "@/composables/useVoiceActorManagement";
// Removed unused imports
import SolarSettingsMinimalisticOutline from "~icons/solar/settings-minimalistic-outline";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/api/supabase";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

  // Methods
  getImage,
  getVoiceActorByTmdbId,
  openVoiceActorSearch,
  searchVoiceActors,
  linkVoiceActor,
  editVoiceActorLink,
  confirmDeleteVoiceActorLink,
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

// Scan functionality
const isScanning = ref(false);
const scanResult = ref('');
const showScanResult = ref(false);

const takePhoto = async () => {
  try {
    isScanning.value = true;
    await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });

    // Here you would typically send the image to your vision API
    // For now, we'll just show a success message
    scanResult.value = 'Image captured successfully! Processing...';
    showScanResult.value = true;

    // Simulate API call
    setTimeout(() => {
      // TODO: Replace with actual API call to your vision LLM
      scanResult.value = 'Processing complete! Ready to add voice actors.';
      // Here you would process the response and potentially auto-fill the voice actor form
    }, 2000);

  } catch (error) {
    console.error('Error taking photo:', error);
    scanResult.value = 'Error capturing image. Please try again.';
    showScanResult.value = true;
  } finally {
    isScanning.value = false;
  }
};

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
}

.summary {
  background-color: #{$block};
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
</style>
