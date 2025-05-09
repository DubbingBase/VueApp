<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="backHref" />
        </ion-buttons>
        <ion-title>{{ episode?.name || 'Détail de l\'épisode' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-button :disabled="isFetching" v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="fetchEpisodeInfos">
        <ion-spinner v-if="isFetching"></ion-spinner>
        <span v-else>Récupérer les informations de l'épisode</span>
      </ion-button>
      <ion-spinner v-if="isLoading" class="loading-spinner" name="crescent" />
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="episode && !isLoading" class="episode-detail">
        <div class="banner">
          <img v-if="episode.still_path" :src="getImage(episode.still_path)" class="poster" :alt="episode.name" />
          <div class="meta">
            <h2>{{ episode.episode_number }}. {{ episode.name }}</h2>
            <div class="subtitle">
              <span v-if="episode.air_date">Diffusé le {{ episode.air_date }}</span>
            </div>
            <div class="overview" v-if="episode.overview">{{ episode.overview }}</div>
          </div>
        </div>
        <div class="voices">
  <h3>Distribution originale et voix françaises</h3>
  <div v-if="episode && episode.credits && episode.credits.cast && episode.credits.cast.length">
    <div class="actors-list">
      <div class="inner-list">
        <div
          v-for="origActor in episode.credits.cast"
          :key="origActor.id"
          class="actor-wrapper"
        >
          <div
            class="actor"
            @click="() => {}"
            aria-label="Voir les détails de l'acteur {{ origActor.name }}"
          >
            <ion-thumbnail class="avatar">
              <img
                v-if="origActor.profile_path"
                :src="getImage(origActor.profile_path)"
                :alt="origActor.name"
              />
              <img v-else src="https://placehold.co/48x72?text=?" alt="?" />
            </ion-thumbnail>
            <ion-label class="line-label">
              <span class="ellipsis label actor">{{ origActor.name }}</span>
              <span class="ellipsis label character">{{ origActor.character }}</span>
            </ion-label>
          </div>
          <template v-if="matchedVoiceActors(origActor).length">
            <div
              class="voice-actor"
              v-for="va in matchedVoiceActors(origActor)"
              :key="va.voiceActorDetails ? va.voiceActorDetails.id : va.id"
              @click="goToVoiceActor(va.voiceActorDetails ? va.voiceActorDetails.id : va.id)"
              aria-label="Voir les détails de la voix de {{ va.voiceActorDetails ? (va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname) : va.id }}"
              style="cursor:pointer"
            >
              <ion-thumbnail class="avatar">
                <img
                  v-if="va.voiceActorDetails && va.voiceActorDetails.profile_picture"
                  :src="getImage(va.voiceActorDetails.profile_picture)"
                  :alt="va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname"
                />
                <img v-else src="https://placehold.co/48x72?text=VA" alt="?" />
              </ion-thumbnail>
              <ion-label class="line-label">
                <span class="ellipsis label voice-actor">
                  {{ va.voiceActorDetails ? (va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname) : (va.firstname && va.lastname ? va.firstname + ' ' + va.lastname : va.id) }}
                </span>
                <span class="ellipsis label performance">
                  {{ va.performance }}
                </span>
              </ion-label>
            </div>
          </template>
          <template v-else>
            <span class="no-voice-actor">Aucun comédien de doublage trouvé pour ce personnage.</span>
          </template>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Aucun acteur original trouvé pour cet épisode.</div>
</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonSpinner } from "@ionic/vue";
import { getImage } from "../utils";
import { supabase } from "../api/supabase";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const error = ref("");
const episode = ref<any>(null);
const dbVoiceActors = ref<any[]>([]);

const wikiDataId = computed(() => episode.value?.external_ids?.wikidata_id);
const hasWikidataId = computed(() => !!wikiDataId.value);
const hasData = computed(() => dbVoiceActors.value.length > 0);
const isFetching = ref(false);

const backHref = computed(() => {
  return router.resolve({ name: 'SeasonDetails', params: { id: route.params.id, season: route.params.season } }).href;
});

async function fetchEpisodeInfos() {
  const id = wikiDataId.value;
  if (!id || !episode.value) {
    console.error("id or episode is undefined");
    return;
  }
  isFetching.value = true;
  try {
    await supabase.functions.invoke("prepare_movie", {
      body: {
        wikiId: id,
        tmdbId: route.params.id,
        type: "episode",
        seasonNumber: route.params.season,
        episodeNumber: episode.value.episode_number,
      },
    });
    location.reload();
  } catch (e) {
    console.error(e);
  } finally {
    isFetching.value = false;
  }
}

function frenchActors(cast: any[]) {
  return cast.filter(a => a.known_for_department === 'Acting' && (!a.original_language || a.original_language === 'fr'));
}

function goToVoiceActor(id: number) {
  router.push({ name: 'VoiceActorDetails', params: { id } });
}

function matchedVoiceActors(origActor: any) {
  // Try to match by actor_id or fallback to known field
  return dbVoiceActors.value.filter(
    va => va.actor_id === origActor.id || va.original_actor_id === origActor.id || va.actorId === origActor.id
  );
}

onMounted(async () => {
  isLoading.value = true;
  error.value = "";
  try {
    const serieId = route.params.id;
    const seasonNumber = route.params.season;
    const episodeNumber = route.params.episode;
    const { data } = await supabase.functions.invoke("episode", { body: { id: serieId, season_number: seasonNumber, episode_number: episodeNumber } });
    episode.value = data.episode;
    dbVoiceActors.value = data.db_voice_actors || [];
    if (!episode.value) error.value = "Épisode introuvable.";
  } catch (e: any) {
    error.value = e.message || "Erreur lors du chargement.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.episode-detail {
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
      }
      .overview {
        margin-top: 0.5rem;
      }
    }
  }
}
.voices {
  margin-top: 1.5rem;
  h3 {
    margin-bottom: 0.5rem;
  }
  .actors-list {
    list-style: none;
    padding: 0;
    .inner-list {
      display: flex;
      gap: 8px;
      flex-direction: column;
      border-radius: 2rem;
      padding-top: 8px;
    }
  }
}

.actor-wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 0 8px;
  background-color: #3f3f3f;
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
.error {
  color: #e74c3c;
  text-align: center;
  margin: 1.5rem 0;
}
</style>
