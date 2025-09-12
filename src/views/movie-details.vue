<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Voix</ion-title>
        <ion-buttons slot="end" v-if="isAdmin">
          <ion-button @click="goToEditPage">
            <ion-icon :icon="pencil"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="background">
        <img width="100%" v-if="movie" :src="getImage(movie.backdrop_path)" alt="Movie background image" />
        <div class="background-overlay"></div>
      </div>

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

      <div class="actors-list">
        <div class="inner-list">
          <template v-if="actors && actors.length">
            <div v-for="actor in actors" :key="actor.id" class="actor-wrapper">
              <div class="actor" @click="goToActor(actor.id)" :routerLink="{
                name: 'ActorDetails',
                params: { id: actor.id },
              }" tabindex="0" role="button" aria-label="Go to details for {{ actor.name }}">
                <ion-thumbnail class="avatar">
                  <img v-if="actor.profile_path" :src="getImage(actor.profile_path)" :alt="actor.name + ' photo'" />
                  <img v-else src="https://placehold.co/48x72?text=?" alt="No photo" />
                </ion-thumbnail>
                <ion-label class="line-label">
                  <span class="ellipsis label actor">{{ actor.name }}</span>
                  <span class="ellipsis label character">as {{ actor.character }}</span>
                </ion-label>
              </div>
              <div class="voice-actor-list">
                <template v-if="getVoiceActorByTmdbId(actor.id).length">
                  <div class="voice-actor-container">
                    <div class="voice-actor" @click="goToVoiceActor(item.voiceActorDetails.id)"
                      v-for="item in getVoiceActorByTmdbId(actor.id)" :key="item.voiceActorDetails.id" tabindex="0"
                      role="button"
                      aria-label="Go to details for {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}"
                    >
                    <MediaThumbnail
                      v-if="item.voiceActorDetails.profile_picture"
                      :path="item.voiceActorDetails.profile_picture"
                      from-storage
                    ></MediaThumbnail>
                    <MediaThumbnail
                      v-else
                      :path="undefined"
                    ></MediaThumbnail>

                      <ion-label class="line-label">
                        <span class="ellipsis label voice-actor">
                          {{ item.voiceActorDetails.firstname }} {{ item.voiceActorDetails.lastname }}
                        </span>
                        <span class="ellipsis label performance">
                          {{ item.performance }}
                        </span>
                      </ion-label>

                      <div class="voice-actor-actions" v-if="isAdmin">
                        <ion-button fill="clear" size="small" @click.stop="editVoiceActorLink(item)"
                          aria-label="Edit voice actor link">
                          <ion-icon :icon="createOutline"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" size="small" @click.stop="confirmDeleteVoiceActorLink(item)"
                          color="danger" aria-label="Delete voice actor link">
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
                        <img src="https://placehold.co/48x72?text=?" alt="No photo" />
                      </ion-thumbnail>
                      <ion-label class="line-label">
                        <span class="ellipsis label">
                          No voice actor found.
                        </span>
                        <ion-button v-if="isAdmin" fill="clear" size="small" @click.stop="openVoiceActorSearch(actor)"
                          class="add-voice-actor-btn">
                          <ion-icon :icon="personAddOutline" slot="start"></ion-icon>
                          Add
                        </ion-button>
                      </ion-label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="no-actors">No actors found for this movie.</div>
        </div>
      </div>



      <div class="action-buttons">
        <ion-button :disabled="isFetching" v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="fetchInfos">
          <ion-spinner v-if="isFetching"></ion-spinner>
          <span v-else>Récupérer les informations</span>
        </ion-button>

        <ion-button
          v-if="hasWikidataId && !hasData"
          class="scan-btn"
          @click="takePhoto"
          :disabled="isScanning"
        >
          <ion-spinner v-if="isScanning"></ion-spinner>
          <ion-icon v-else :icon="cameraOutline" slot="start"></ion-icon>
          Scanner
        </ion-button>
      </div>
      <div v-if="fetchError" class="fetch-error">{{ fetchError }}</div>
      <ion-spinner v-if="isLoading" class="main-spinner"></ion-spinner>
    </ion-content>

    <ion-toast
      :is-open="showScanResult"
      :message="scanResult"
      :duration="3000"
      @didDismiss="showScanResult = false"
    ></ion-toast>

  <!-- Voice Actor Search Modal -->
    <ion-modal :is-open="showVoiceActorSearch" @didDismiss="showVoiceActorSearch = false">
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
          <ion-searchbar v-model="searchTerm" @ionInput="searchVoiceActors" placeholder="Search voice actors..."
            animated :debounce="300"></ion-searchbar>
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
          <ion-item v-else-if="!searchResults.length && searchTerm" class="ion-text-center">
            <ion-text>No voice actors found</ion-text>
          </ion-item>
          <ion-item v-for="va in searchResults" :key="va.id" button
            @click="linkVoiceActor(va, route.params.id as string)">
            <ion-avatar slot="start" v-if="va.profile_picture">
              <img :src="va.profile_picture" :alt="va.firstname + ' ' + va.lastname" />
            </ion-avatar>
            <ion-avatar slot="start" v-else>
              <img src="https://placehold.co/40?text=VA" :alt="va.firstname + ' ' + va.lastname" />
            </ion-avatar>
            <ion-label>
              <h3>{{ va.firstname }} {{ va.lastname }}</h3>
              <p v-if="va.nationality">{{ va.nationality }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonThumbnail,
  IonLabel,
  IonSpinner,
  IonModal,
  IonSearchbar,
  IonList,
  IonItem,
  IonText,
  IonAvatar,
  alertController,
  toastController,
  IonToast
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useIonRouter } from '@ionic/vue';
import { pencil, personAddOutline, searchOutline, closeCircle, createOutline, trashOutline, cameraOutline } from 'ionicons/icons';
import { MovieResponse } from "../../supabase/functions/_shared/movie";
import { supabase } from "../api/supabase";
import { WorkAndVoiceActor } from "../../supabase/functions/_shared/movie";
import { useVoiceActorManagement } from '@/composables/useVoiceActorManagement';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import MediaThumbnail from "@/components/MediaThumbnail.vue";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);

const route = useRoute();
const router = useRouter();
const ionRouter = useIonRouter();

// Initialize voice actor management
const {
  // State
  showVoiceActorSearch,
  searchTerm,
  searchResults,
  isSearching,
  searchError,
  voiceActors,
  isLoading,
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
  goToActor,
} = useVoiceActorManagement('movie');

const movie = ref<MovieResponse["movie"] | undefined>();
const actors = computed(() => {
  return movie.value?.credits.cast;
});

const wikiDataId = computed(() => {
  return movie.value?.external_ids?.wikidata_id;
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

const isFetching = ref(false);
const fetchError = ref('');

const takePhoto = async () => {
  try {
    isScanning.value = true;
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });

    const response = await supabase.functions.invoke("process_image", {
      body: {
        image: image.base64String,
        mediaId: parseInt(route.params.id as string)
      }
    });

    if (response.data.ok) {
      scanResult.value = 'Image processed successfully!';
      showScanResult.value = true;
    } else {
      scanResult.value = response.data.error || 'Error processing image.';
      showScanResult.value = true;
    }
  } catch (error) {
    console.error('Error taking photo:', error);
    scanResult.value = 'Error capturing image. Please try again.';
    showScanResult.value = true;
  } finally {
    isScanning.value = false;
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
  const movieResponseRaw = await supabase.functions.invoke("prepare_movie", {
    body: {
      wikiId: id,
      tmdbId: route.params.id,
      type: "movie",
    },
  });
  const data = movieResponseRaw.data;

  console.log("data", data);

  if (data.ok) {
    location.reload();
  } else {
    toastController.create({
      message: data.error,
      duration: 2000,
      position: 'top',
      color: 'danger',
    }).then((toast) => {
      toast.present();
    });
    isFetching.value = false;
    fetchError.value = data.error;
    isLoading.value = false;

  }
};

const fetchMovieData = async () => {
  const id = route.params.id;
  try {
    const movieResponseRaw = await supabase.functions.invoke("movie", {
      body: { id },
    });
    const data = movieResponseRaw.data as MovieResponse;
    movie.value = data.movie;
    console.log("data.voiceActors", data.voiceActors);
    voiceActors.value = data.voiceActors;
  } catch (e: any) {
    console.error('Error fetching movie data:', e);
    fetchError.value = 'Failed to load movie details.';
  }
};

// Navigate to edit page
const goToEditPage = () => {
  if (movie.value?.id) {
    router.push({
      name: 'AddVoiceCast',
      params: { id: movie.value.id }
    });
  }
};

// // Edit voice actor link
// const editVoiceActorLink = (workItem: any) => {
//   if (!movie.value?.id) return;

//   router.push({
//     name: 'AddVoiceCast',
//     params: {
//       movieId: movie.value.id,
//       actorId: workItem.actor_id,
//       workId: workItem.id
//     }
//   });
// };

// Confirm before deleting a voice actor link
// const confirmDeleteVoiceActorLink = async (workItem: any) => {
//   const alert = await alertController.create({
//     header: 'Confirm Delete',
//     message: `Are you sure you want to remove ${workItem.voiceActorDetails.firstname} ${workItem.voiceActorDetails.lastname} as the voice for ${workItem.character}?`,
//     buttons: [
//       {
//         text: 'Cancel',
//         role: 'cancel'
//       },
//       {
//         text: 'Delete',
//         role: 'destructive',
//         handler: () => deleteVoiceActorLink(workItem.id)
//       }
//     ]
//   });
//   await alert.present();
// };

// Delete a voice actor link
// const deleteVoiceActorLink = async (workId: number) => {
//   try {
//     const { error } = await supabase
//       .from('works')
//       .delete()
//       .eq('id', workId);

//     if (error) throw error;

//     // Refresh the data
//     await fetchMovieData();

//     const toast = await toastController.create({
//       message: 'Voice actor link removed',
//       duration: 2000,
//       color: 'success',
//       position: 'top'
//     });
//     await toast.present();
//   } catch (err) {
//     console.error('Error deleting voice actor link:', err);
//     const toast = await toastController.create({
//       message: 'Failed to remove voice actor link',
//       duration: 2000,
//       color: 'danger',
//       position: 'top'
//     });
//     await toast.present();
//   }
// };

// Check admin status when component mounts
onMounted(async () => {
  const id = route.params.id;
  isLoading.value = true;
  fetchError.value = null;
  try {
    await fetchMovieData();
  } catch (e: any) {
    console.error('Error fetching movie data:', e);
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

.header>img {
  object-fit: cover;
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px auto;
  padding: 0 16px;
  max-width: 600px;
}

.fetch-infos-btn,
.scan-btn {
  flex: 1;
  --border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
  font-weight: 500;
  margin: 0;
  min-width: 0;
}

.fetch-infos-btn {
  --background: var(--ion-color-primary);
  --color: white;
}

.scan-btn {
  --background: var(--ion-color-medium);
  --color: var(--ion-color-dark);
  --background-hover: var(--ion-color-medium-shade);
  --background-activated: var(--ion-color-medium-tint);
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .fetch-infos-btn,
  .scan-btn {
    width: 100%;
  }
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
  display: flex;
  justify-content: space-between;

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
  gap: 0.5rem;

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

  .voice-actor-container {
    width: 100%;
  }

  .voice-actor {
    background-color: #666;
    flex: 1 0 auto;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 4px;
    border-radius: 4px;
    padding: 4px;
  }
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

.main-spinner {
  display: block;
  margin: 32px auto;
}

.fetch-error {
  color: #ff6666;
  text-align: center;
  margin-top: 16px;
}

.no-actors,
.no-voice-actor {
  color: var(--ion-color-medium);
  font-style: italic;
  text-align: center;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.add-voice-actor-btn {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  font-size: 0.85rem;
  height: auto;
  margin-top: 4px;
}

.add-voice-actor-btn ion-icon {
  margin-right: 4px;
}

.actors-list {
  z-index: 1;
  position: relative;
  top: -80px;

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
