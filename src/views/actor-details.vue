<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Acteur</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="actor">
        <div class="header" v-if="actor">
          <img :src="getImage(actor.profile_path)" alt="" />
          <div class="actor-name">{{ actor.name }}</div>
        </div>

        <div class="body" v-if="actor">
          <TabView :activeIndex="active">
            <TabPanel header="À propos">
              <p>Date de naissance : {{ actor.birthday }}</p>
              {{ actor.biography }}
            </TabPanel>
            <TabPanel header="Films">
              <div class="movies-wrapper">
                <movie v-for="movie in movies" :value="movie"></movie>
              </div>
            </TabPanel>
            <TabPanel header="Séries">
              <div class="series-wrapper">
                <serie v-for="serie in series" :value="serie"></serie>
              </div>
            </TabPanel>
          </TabView>
        </div>
        <div v-if="actor && actor.voice_roles && actor.voice_roles.length" class="voice-roles-section">
          <h3>Rôles de doublage</h3>
          <div class="actors-list">
            <div class="inner-list">
              <div
                v-for="role in actor.voice_roles"
                :key="role.voice_actor_id"
                class="voice-actor"
                @click="goToVoiceActor(role.voice_actor_id)"
                aria-label="Voir les détails de la voix de {{ role.voiceActorDetails?.name || role.voiceActorDetails?.firstname + ' ' + role.voiceActorDetails?.lastname }}"
              >
                <ion-thumbnail class="avatar">
                  <img
                    v-if="role.voiceActorDetails?.profile_picture"
                    :src="getImage(role.voiceActorDetails.profile_picture)"
                    :alt="role.voiceActorDetails?.name || role.voiceActorDetails?.firstname + ' ' + role.voiceActorDetails?.lastname"
                  />
                  <img v-else src="https://placehold.co/48x72?text=VA" alt="?" />
                </ion-thumbnail>
                <ion-label class="line-label">
                  <span class="ellipsis label voice-actor">
                    {{ role.voiceActorDetails?.firstname }} {{ role.voiceActorDetails?.lastname }}
                  </span>
                  <span class="ellipsis label performance">
                    {{ role.performance }}
                  </span>
                </ion-label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  IonPage,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonHeader,
} from "@ionic/vue";
import { getImage } from "../utils";
import { Actor } from "../../supabase/functions/_shared/actor";
import movie from "../components/Movie.vue";
import serie from "../components/Serie.vue";
import type { Serie } from "../../supabase/functions/_shared/serie";
import type { Movie } from "../../supabase/functions/_shared/movie";
import { supabase } from "../api/supabase";

const route = useRoute();

const actor = ref<Actor | undefined>();

const active = ref(0);

const isMovie = (item: Movie | Serie): item is Movie => {
  return item.media_type === "movie";
};

const isSerie = (item: Movie | Serie): item is Serie => {
  return item.media_type === "tv";
};

const credits = computed(() => {
  return (
    actor.value?.combined_credits ??
    actor.value?.credits ?? {
      cast: [],
      crew: [],
    }
  );
});

const movies = computed(() => {
  return credits.value.cast.filter(isMovie);
});

const series = computed(() => {
  return credits.value.cast.filter(isSerie);
});

onMounted(async () => {
  const id = route.params.id;

  const actorResponseRaw = await await supabase.functions.invoke("actor", {
    body: { id },
  });
  const actorResponse = (await actorResponseRaw.data) as { actor: Actor };
  actor.value = actorResponse.actor;
});
function goToVoiceActor(id: number) {
  // Use the router to navigate to the voice actor details page
  // (Assumes you are using vue-router and have a VoiceActorDetails route)
  // @ts-ignore: router is not typed here, but is globally available in setup
  // If using <script setup>, import useRouter from 'vue-router' and use it
  const { push } = useRouter();
  push({ name: 'VoiceActorDetails', params: { id } });
}

function hasVoiceRoles(actor: any): actor is { voice_roles: any[] } {
  return actor && Array.isArray(actor.voice_roles);
}
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
</style>
