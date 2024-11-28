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
        <ion-thumbnail class="avatar" slot="start">
          <img v-if="match.poster_path" :src="getImage(match.poster_path)" />
          <img v-else src="https://placehold.co/48x72?text=?" />
        </ion-thumbnail>
        <ion-label>
          <h3 class="title ellipsis">{{ match.name ?? match.title }}</h3>
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
import { getImage } from "../utils";
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
  IonThumbnail,
  SearchbarInputEventDetail,
} from "@ionic/vue";
import { IonSearchbarCustomEvent } from "@ionic/core";
import { Movie } from "../../supabase/functions/_shared/movie";
import { Serie } from "../../supabase/functions/_shared/serie";
import { format, parse, parseISO } from 'date-fns'

const matches = ref<(Movie | Serie)[]>([]);

const date = (match: Movie | Serie) => {
  return format(parseISO(match.first_air_date ?? match.release_date), 'yyyy')
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

  matches.value = data.results;
};

const typeToRoute = (type: string) => {
  switch (type) {
    case "movie":
      return "MovieDetails";
    case "tv":
      return "SerieDetails";
    case "person":
      return "ActorDetails";
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
