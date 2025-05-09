<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" />
        </ion-buttons>
        <ion-title>{{ season?.name || 'Détails de la saison' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-button :disabled="isFetching" v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="fetchInfos">
        <ion-spinner v-if="isFetching"></ion-spinner>
        <span v-else>Récupérer les informations</span>
      </ion-button>
      <ion-spinner v-if="isLoading" class="loading-spinner" name="crescent" />
      <div v-if="season && !isLoading" class="season-details">
        <div class="banner">
          <img v-if="season.poster_path" :src="getImage(season.poster_path)" class="poster" :alt="season.name" />
          <div class="meta">
            <h2>{{ season.name }}</h2>
            <div class="subtitle">
              <span v-if="season.air_date">Première diffusion : {{ season.air_date }}</span>
              <span v-if="season.episode_count">• {{ season.episode_count }} épisodes</span>
            </div>
            <div class="overview" v-if="season.overview">{{ season.overview }}</div>
          </div>
        </div>
        <ion-segment v-model="activeTab" class="season-tabs">
          <ion-segment-button value="details">Détails</ion-segment-button>
          <ion-segment-button value="episodes">Épisodes</ion-segment-button>
          <ion-segment-button value="voices">Voix FR</ion-segment-button>
        </ion-segment>
        <div v-if="activeTab === 'details'">
          <!-- Details Tab Content -->
          <div class="details-content">
            <div class="overview" v-if="season.overview">{{ season.overview }}</div>
          </div>
        </div>
        <div v-else-if="activeTab === 'episodes'">
          <!-- Episodes Tab Content -->
          <ion-list v-if="season.episodes && season.episodes.length">
            <ion-item v-for="ep in season.episodes" :key="ep.id" class="episode-item"
              @click="goToEpisode(ep.episode_number)">
              <ion-thumbnail slot="start" v-if="ep.still_path">
                <img :src="getImage(ep.still_path)" :alt="ep.name" />
              </ion-thumbnail>
              <ion-label>
                <h2>{{ ep.episode_number }}. {{ ep.name }}</h2>
                <p v-if="ep.air_date">Diffusé le {{ ep.air_date }}</p>
                <p v-if="ep.overview">{{ ep.overview }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <div v-else>Aucun épisode trouvé.</div>
        </div>
        <div v-else-if="activeTab === 'voices'">
          <!-- Voices Tab Content -->
          <div v-if="season && season.credits && season.credits.cast && season.credits.cast.length">
            <h3>Voix françaises de la saison</h3>
            <div>
              <div class="actors-list">
                <div class="inner-list">
                  <div v-for="origActor in season.credits.cast" :key="origActor.id" class="actor-wrapper">
                    <div class="actor" aria-label="Voir les détails de l'acteur {{ origActor.name }}">
                      <ion-thumbnail class="avatar">
                        <img v-if="origActor.profile_path" :src="getImage(origActor.profile_path)"
                          :alt="origActor.name" />
                        <img v-else src="https://placehold.co/48x72?text=?" alt="?" />
                      </ion-thumbnail>
                      <ion-label class="line-label">
                        <span class="ellipsis label actor">{{ origActor.name }}</span>
                        <span class="ellipsis label character">{{ origActor.character }}</span>
                      </ion-label>
                    </div>
                    <template v-if="matchedVoiceActors && matchedVoiceActors(origActor).length">
                      <div class="voice-actor" v-for="va in matchedVoiceActors(origActor)"
                        :key="va.voiceActorDetails ? va.voiceActorDetails.id : va.id"
                        @click="goToVoiceActor(va.voiceActorDetails ? va.voiceActorDetails.id : va.id)"
                        aria-label="Voir les détails de la voix de {{ va.voiceActorDetails ? (va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname) : va.id }}"
                        style="cursor:pointer">
                        <ion-thumbnail class="avatar">
                          <img v-if="va.voiceActorDetails && va.voiceActorDetails.profile_picture"
                            :src="getImage(va.voiceActorDetails.profile_picture)"
                            :alt="va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname" />
                          <img v-else src="https://placehold.co/48x72?text=VA" alt="?" />
                        </ion-thumbnail>
                        <ion-label class="line-label">
                          <span class="ellipsis label voice-actor">
                            {{ va.voiceActorDetails ? (va.voiceActorDetails.firstname + ' ' +
                              va.voiceActorDetails.lastname) : (va.firstname && va.lastname ? va.firstname + ' ' +
                            va.lastname : va.id) }}
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
          </div>
          <div v-else>
            <h3>Voix françaises de l'épisode</h3>
            <div v-if="episodeCredits && episodeCredits.cast && episodeCredits.cast.length">
              <div class="actors-list">
                <div class="inner-list">
                  <div v-for="origActor in frenchActors(episodeCredits.cast)" :key="origActor.id" class="actor-wrapper">
                    <div class="actor">
                      <ion-thumbnail class="avatar">
                        <img v-if="origActor.profile_path" :src="getImage(origActor.profile_path)"
                          :alt="origActor.name" />
                        <img v-else src="https://placehold.co/48x72?text=?" alt="?" />
                      </ion-thumbnail>
                      <ion-label class="line-label">
                        <span class="ellipsis label actor">{{ origActor.name }}</span>
                        <span class="ellipsis label character">{{ origActor.character }}</span>
                      </ion-label>
                    </div>
                    <template v-if="dbVoiceActors && dbVoiceActors.length">
                      <div class="voice-actor"
                        v-for="va in dbVoiceActors.filter(v => v.original_actor_id === origActor.id || v.actor_id === origActor.id)"
                        :key="va.voiceActorDetails ? va.voiceActorDetails.id : va.id"
                        @click="goToVoiceActor(va.voiceActorDetails ? va.voiceActorDetails.id : va.id)"
                        aria-label="Voir les détails de la voix de {{ va.voiceActorDetails ? (va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname) : va.id }}"
                        style="cursor:pointer">
                        <ion-thumbnail class="avatar">
                          <img v-if="va.voiceActorDetails && va.voiceActorDetails.profile_picture"
                            :src="getImage(va.voiceActorDetails.profile_picture)"
                            :alt="va.voiceActorDetails.firstname + ' ' + va.voiceActorDetails.lastname" />
                          <img v-else src="https://placehold.co/48x72?text=VA" alt="?" />
                        </ion-thumbnail>
                        <ion-label class="line-label">
                          <span class="ellipsis label voice-actor">
                            {{ va.voiceActorDetails ? (va.voiceActorDetails.firstname + ' ' +
                              va.voiceActorDetails.lastname) : (va.firstname && va.lastname ? va.firstname + ' ' +
                            va.lastname : va.id) }}
                          </span>
                          <span class="ellipsis label performance">
                            {{ va.performance }}
                          </span>
                        </ion-label>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>Aucun comédien de doublage trouvé pour cet épisode.</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonSpinner, IonList, IonItem, IonThumbnail, IonLabel, IonSegment, IonSegmentButton } from "@ionic/vue";
import { getImage } from "../utils";
import { supabase } from "../api/supabase";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const error = ref("");
const season = ref<any>(null);
const seasonCredits = ref<any>(null);
const seasonVoiceActors = ref<any[]>([]);
const dbVoiceActors = ref<any[]>([]);
const episodeCredits = ref<any>(null);
const activeTab = ref("details");

const wikiDataId = computed(() => {
  return season.value?.external_ids?.wikidata_id;
});
const hasWikidataId = computed(() => !!wikiDataId.value);
const hasData = computed(() => {
  return dbVoiceActors.value.length > 0;
});
const isFetching = ref(false);

async function fetchInfos() {
  const id = wikiDataId.value;
  if (!id) {
    console.error("id is undefined");
    return;
  }
  isFetching.value = true;
  try {
    await supabase.functions.invoke("prepare_movie", {
      body: {
        wikiId: id,
        tmdbId: route.params.id,
        type: "season",
        seasonNumber: route.params.season,
      },
    });
    location.reload();
  } catch (e) {
    console.error(e);
  } finally {
    isFetching.value = false;
  }
}

function matchedVoiceActors(origActor: any) {
  // Try to match by actor_id or fallback to known field
  return dbVoiceActors.value.filter(
    va => va.actor_id === origActor.id || va.original_actor_id === origActor.id || va.actorId === origActor.id
  );
}

function goToVoiceActor(id: number) {
  router.push({ name: 'VoiceActorDetails', params: { id } });
}

function goToEpisode(episodeNumber: number) {
  // Navigate to the dedicated episode route, or update the query param
  router.replace({
    name: 'SeasonByEpisodes',
    params: { id: route.params.id, season: route.params.season, episode: episodeNumber },
  });
}

function frenchActors(cast: any[]) {
  // Filter for French voice actors (dub), fallback to all if language not available
  return cast.filter(a => a.known_for_department === 'Acting' && (!a.original_language || a.original_language === 'fr'));
}

async function fetchData() {
  isLoading.value = true;
  error.value = "";
  try {
    const serieId = route.params.id;
    const seasonNumber = route.params.season;
    // Only fetch season data here
    const { data } = await supabase.functions.invoke("season", { body: { id: serieId, season_number: seasonNumber } });
    season.value = data.season;
    dbVoiceActors.value = data.db_voice_actors || [];
    if (!season.value) error.value = "Saison introuvable.";
  } catch (e: any) {
    error.value = e.message || "Erreur lors du chargement.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
watch(() => route.query.episode, fetchData);
</script>

<style lang="scss" scoped>
.season-details {
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

        span+span {
          margin-left: 1em;
        }
      }

      .overview {
        margin-top: 0.5rem;
      }
    }
  }

  .episode-item {
    margin-bottom: 0.5rem;
  }
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
