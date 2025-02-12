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
          <div v-for="actor in actors" :key="actor.id" class="actor-wrapper">
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
            <div class="voice-actor-list">
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
      </div>

      <div class="background">
        <img v-if="movie" :src="getImage(movie.backdrop_path)" alt="" />
        <div v-if="movie" class="movie-title">{{ movie.title }}</div>
      </div>

      <ion-button v-if="hasWikidataId && !hasData" class="fetch-infos-btn" @click="fetchInfos">
        <ion-spinner v-if="isFetching"></ion-spinner>
        <span v-else>Récupérer les informations</span>
      </ion-button>
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

  const movieResponseRaw = await supabase.functions.invoke("movie", {
    body: { id },
  });
  // const movieResponse = await movieResponseRaw.json() as MovieResponse
  const data = movieResponseRaw.data as MovieResponse;
  movie.value = data.movie;
  voiceActors.value = data.voiceActors;
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
