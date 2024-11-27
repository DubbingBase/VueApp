<template>
  <ion-page>
    <div class="actor">
      <div class="header" v-if="voiceActor">
        <img :src="profilePicture" alt="" />
        <div class="actor-name">
          {{ voiceActor.firstname }} {{ voiceActor.lastname }}
        </div>
      </div>

      <div class="body" v-if="voiceActor">
        <p>Date de naissance : {{ voiceActor.date_of_birth }}</p>
        {{ voiceActor.bio }}
        <!-- <div class="movies-wrapper">
        <Movie v-for="movie in movies" :value="getMovie(movie)"></Movie>
      </div>
      <div class="series-wrapper">
        <Serie v-for="serie in series" :value="getSerie(serie)"></Serie>
      </div> -->

        <div class="work" v-for="work in voiceActor.work">
          <router-link
            :to="{
              name: 'MovieDetails',
              params: {
                id: work.id,
              },
            }"
          >
            <div class="poster">
              <img :src="getImage(work.poster_path)" alt="" />
            </div>
          </router-link>
          <div class="caption">{{ work.title }}</div>
        </div>

        <Button @click="addWikiId">Saisir wikipedia id</Button>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getImage } from "../utils";
import { Actor } from "../../supabase/functions/_shared/actor";
import Movie from "../components/Movie.vue";
import Serie from "../components/Serie.vue";
import type { Serie as SerieModel } from "../../supabase/functions/_shared/serie";
import { IonPage } from "@ionic/vue";
import type {
  Movie as MovieModel,
  MovieResponse,
} from "../../supabase/functions/_shared/movie";
import { supabase } from "../api/supabase";

const route = useRoute();

type VoiceActorResponse = {
  voiceActor: {
    id: number;
    firstname: string;
    lastname: string;
    work: {
      id: string;
      actor_id: string;
      content_id: string;
    }[];
  };
  profile_picture: string;
  medias: (MovieResponse | SerieModel)[];
};

const voiceActor = ref<VoiceActorResponse["voiceActor"] | undefined>();
const medias = ref<VoiceActorResponse["medias"] | undefined>();
const profilePicture = ref<VoiceActorResponse["profile_picture"] | undefined>();

const active = ref(0);

const isMovie = (item: unknown): item is unknown => {
  return item.content_type === "movie";
};

const isSerie = (item: unknown): item is unknown => {
  return item.content_type === "tv";
};

const movies = computed(() => {
  return voiceActor.value?.work.filter(isMovie);
});

const series = computed(() => {
  return voiceActor.value?.work.filter(isSerie);
});

const getMovie = (item: unknown): MovieModel => {
  return medias.value?.find((media) => {
    return media.id === item.content_id;
  });
};

const getSerie = (item: unknown): SerieModel => {
  return medias.value?.find((media) => {
    return media.id === item.content_id;
  });
};

const addWikiId = () => {
  console.log("addWikiId");
};

onMounted(async () => {
  const id = route.params.id;

  const voiceActorResponseRaw = await supabase.functions.invoke("voice-actor", {
    body: { id },
  });
  const voiceActorResponse =
    (await voiceActorResponseRaw.data) as VoiceActorResponse;
  console.log("voiceActorResponse", voiceActorResponse);
  if (!voiceActorResponse) {
    console.error("voiceActorResponse is null");
    return;
  }
  voiceActor.value = voiceActorResponse.voiceActor;
  medias.value = voiceActorResponse.medias;
  profilePicture.value = voiceActorResponse.profile_picture;
});
</script>

<style scoped lang="scss">
.header {
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    height: 300px;
    width: 240px;
    object-fit: cover;
  }
}

.movies-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.series-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.work {
  // overflow: hidden;
  width: 28%;
  margin: 4px;
  display: flex;
  flex-direction: column;
  vertical-align: top;
  height: auto;
  flex: 1 0 auto;
  color: inherit;
  text-decoration: none;

  .poster {
    height: 100%;
    display: flex;
    align-items: start;
    flex: 0;

    img {
      border-radius: 12px;
      max-width: 100%;
      max-height: 100%;
      height: auto;
      // object-fit: cover;
      object-fit: contain;

      display: flex;
      flex-direction: column;
    }
  }

  .caption {
    text-align: center;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 8px 4px;
  }
}
</style>
