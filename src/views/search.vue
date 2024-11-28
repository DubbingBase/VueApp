<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Search</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          :debounce="300"
          @ionInput="search($event)"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content>
    <ion-list>
      <ion-item
        :routerLink="{
          name: typeToRoute(match.media_type),
          params: { id: match.id },
        }"
        v-for="match in matches"
        :key="match.id"
      >
        <MediaThumbnail :path="matchToImage(match)"></MediaThumbnail>
        <ion-label>
          <h3 class="title ellipsis">{{ matchToName(match) }}</h3>
          <p class="subtitle">{{ date(match) }} <ion-chip>{{ match.media_type }}</ion-chip></p>
        </ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { supabase } from "../api/supabase";
import { ref } from "vue";
import {
  IonHeader,
  IonSearchbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonItem,
  IonList,
  IonChip,
  IonToolbar,
  IonPage,
  SearchbarInputEventDetail,
} from "@ionic/vue";
import { IonSearchbarCustomEvent } from "@ionic/core";
import { Movie } from "../../supabase/functions/_shared/movie";
import { Serie } from "../../supabase/functions/_shared/serie";
import { format, parseISO } from 'date-fns'
import MediaThumbnail from "@/components/MediaThumbnail.vue";

const matches = ref<(Movie | Serie)[]>([]);

const matchToImage = (el: unknown) => {
  return el.profile_path ?? el.poster_path
}

const matchToName = (el: unknown) => {
  return el.name ?? el.title ?? (el.firstname ?? '') + ' ' + (el.lastname ?? '')
}

const date = (match: Movie | Serie) => {
  const date = match.first_air_date ?? match.release_date
  if (date) {
    return format(parseISO(date), 'yyyy')
  }
}

const search = async (
  event: IonSearchbarCustomEvent<SearchbarInputEventDetail>
) => {
  console.log(event.target.value);

  const { data, error } = await supabase.functions.invoke("search", {
    body: {
      query: event.target.value,
    },
  });

  console.log("data", data);

  matches.value = data;
};

const typeToRoute = (type: string) => {
  switch (type) {
    case "movie":
      return "MovieDetails";
    case "tv":
      return "SerieDetails";
    case "person":
      return "ActorDetails";
    case "voice_actor":
      return "VoiceActorDetails";
    default:
      return "home";
  }
};
</script>

<style lang="scss" scoped>
.results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;

  .overview {
    font-size: 1rem;
    color: #666;
  }
}

.avatar {
  --border-radius: 4px;
  width: 48px;
  height: auto;
  min-height: 72px;
}

.title {
  width: 100%;
}

.subtitle {
  display: flex;
  align-items: center;
}
</style>
