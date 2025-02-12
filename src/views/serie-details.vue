<template>
  <ion-page>
    <ion-header class="header">
      <ion-toolbar class="toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="clear">
            <SolarSettingsMinimalisticOutline></SolarSettingsMinimalisticOutline>
          </ion-button>
          <ion-button fill="clear">
            <SolarSettingsMinimalisticOutline>
            </SolarSettingsMinimalisticOutline>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="tabs">
        <div class="summary">
          <div v-if="show" class="show-title">{{ show.name }}</div>
        </div>
        <ion-segment>
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
            <div class="example-content">Listen now content</div>
          </ion-segment-content>
          <ion-segment-content class="segmented-content" id="seasons">
            <div class="seasons" v-if="show">
              <div
                expand="block"
                @click="goToSeason(season.id, season.season_number)"
                class="season"
                v-for="season in show.seasons"
                :key="season.id"
              >
                <MediaThumbnail :path="season.poster_path"></MediaThumbnail>
                <div class="text">
                  <div class="season-title">{{ season.name }}</div>
                  <div class="season-subtitle">
                    {{ season.air_date }} &sdot; {{ season.episode_count }} épisodes
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
                      params: {
                        id: actor.id,
                      },
                    }"
                  >
                    <ion-thumbnail class="avatar">
                      <img
                        v-if="actor.profile_path"
                        :src="getImage(actor.profile_path)"
                      />
                      <img v-else src="https://placehold.co/48x72?text=?" />
                    </ion-thumbnail>
                    <ion-label class="line-label">
                      <span class="ellipsis label actor">{{ actor.name }}</span>
                      <span class="ellipsis label character"
                        >as {{ actor.character }}</span
                      >
                    </ion-label>
                  </div>
                  <div
                    class="voice-actor"
                    @click="goToVoiceActor(item.voiceActorDetails.id)"
                    v-for="item in getVoiceActorByTmdbId(actor.id)"
                    :key="item.voiceActorDetails.id"
                  >
                    <ion-thumbnail class="avatar">
                      <img
                        v-if="item.voiceActorDetails.profile_picture"
                        :src="getImage(item.voiceActorDetails.profile_picture)"
                      />
                      <img v-else src="https://placehold.co/48x72?text=?" />
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
                  </div>
                </div>
              </div>
            </div>
          </ion-segment-content>
        </ion-segment-view>
      </div>

      <div class="background">
        <img v-if="show" :src="getImage(show.backdrop_path)" alt="" />
      </div>

      <ion-button :disabled="isFetching" v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="fetchInfos">
        <ion-spinner v-if="isFetching"></ion-spinner>
        <span v-else>Récupérer les informations {{ wikiDataId }} {{ hasData }}</span>
      </ion-button>
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
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getImage } from "../utils";
import { SerieResponse } from "../../supabase/functions/_shared/serie";
import { supabase } from "../api/supabase";
import { WorkAndVoiceActor } from "../../supabase/functions/_shared/movie";
import MediaThumbnail from "@/components/MediaThumbnail.vue";
import SolarSettingsMinimalisticOutline from "~icons/solar/settings-minimalistic-outline";

const route = useRoute();
const router = useRouter();

const show = ref<SerieResponse["serie"] | undefined>();
const voiceActors = ref<SerieResponse["voiceActors"]>([]);

const actors = computed(() => {
  return show.value?.credits.cast;
});

const getVoiceActorByTmdbId = (tmdbId: number): WorkAndVoiceActor[] => {
  const va = voiceActors.value.filter((v) => v.actor_id === tmdbId);

  return va;
};

const goToSeason = (id: number, seasonNumber: number) => {
  router.push({
    name: "SeasonDetails",
    params: {
      id: id,
      season: seasonNumber,
    },
  });
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
  return show.value?.external_ids?.wikidata_id;
});

const hasWikidataId = computed(() => {
  return !!wikiDataId.value;
});

const hasData = computed(() => {
  return voiceActors.value.length > 0;
});

const isFetching = ref(false);

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
  location.reload();
};

onMounted(async () => {
  const id = route.params.id;

  const showResponseRaw = await supabase.functions.invoke("show", {
    body: { id },
  });
  // const showResponse = await showResponseRaw.json() as SerieResponse
  const data = showResponseRaw.data as SerieResponse;
  show.value = data.serie;
  voiceActors.value = data.voiceActors;
});
</script>

<style scoped lang="scss">
$coverHeight: 150px;
$block: #3f3f3f;
$background: #292929;
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
  padding-top: calc(#{$coverHeight} - 44px);
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
</style>
