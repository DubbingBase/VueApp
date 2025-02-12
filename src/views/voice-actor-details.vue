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
      <div class="actor">
        <div
          class="header"
          v-if="voiceActor"
        >
          <MediaThumbnail
            v-if="profilePicture"
            :path="profilePicture"
            raw-path
          ></MediaThumbnail>
          <MediaThumbnail
            v-else
            @click="uploadImage"
            :path="profilePicture"
          ></MediaThumbnail>
          <div class="actor-name">
            {{ voiceActor.firstname }} {{ voiceActor.lastname }}
          </div>
        </div>

        <div
          class="body"
          v-if="voiceActor"
        >
          <p>Date de naissance : {{ voiceActor.date_of_birth }}</p>
          <p>{{ voiceActor.bio }}</p>

          <div
            class="work"
            v-for="work in enhancedWork"
            :key="work.media.id"
          >
            <div class="poster">
              <div class="movie">
                <router-link :to="{
                  name:
                    work.media.media_type === 'movie'
                      ? 'MovieDetails'
                      : 'SerieDetails',
                  params: {
                    id: work.media.id,
                  },
                }">
                  <div class="poster">
                    <MediaThumbnail :path="work.media.poster_path" />
                  </div>
                </router-link>
              </div>
            </div>

            <div class="infos">
              <div class="caption">{{ work.media.title ?? work.media.name }}</div>
              <div class="caption">{{ work.data.character }}</div>

              <div class="actor">
                <router-link class="actor-link" :to="{
                  name: 'ActorDetails',
                  params: {
                    id: work.data.actor.id,
                  },
                }">
                  <div class="poster">
                    <MediaThumbnail :height="32" :width="32" radius="50%" :path="work.data.actor.profile_path" />
                  </div>
                  <div class="caption">{{ work.data.actor.name }}</div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- <ion-button @click="addWikiId">Saisir wikipedia id</ion-button> -->
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Serie as SerieModel } from "../../supabase/functions/_shared/serie";
import {
  IonPage,
  IonButton,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonContent,
  IonHeader,
} from "@ionic/vue";
import type { Movie as MovieModel } from "../../supabase/functions/_shared/movie";
import { supabase } from "../api/supabase";
import MediaThumbnail from "@/components/MediaThumbnail.vue";
import { useFileDialog } from "@vueuse/core";

const route = useRoute();

type VoiceActorResponse = {
  voiceActor: {
    id: number;
    firstname: string;
    lastname: string;
    work: {
      id: string;
      actor_id: string;
      content_id: number;
    }[];
  };
  profile_picture: string;
  medias: (MovieModel | SerieModel)[];
};

const voiceActor = ref<VoiceActorResponse["voiceActor"] | undefined>();
const medias = ref<VoiceActorResponse["medias"]>([]);
const profilePicture = ref<VoiceActorResponse["profile_picture"] | undefined>();

// mix work and medias
const enhancedWork = computed(() => {
  return voiceActor.value?.work
    .map((work) => {
      const media = medias.value.find((media) => {
        console.log("media.id", media.id);
        console.log("work.content_id", work.content_id);
        return media.id === work.content_id;
      });

      if (media) {
        const actor = media.credits.cast.find((cast) => cast.id === work.actor_id);
        const character = actor?.character;
        const data = {
          character,
          actor,
        };

        return {
          media,
          work,
          data,
        }
      } else {
        return null;
      }
    })
    .filter((item) => item !== null);
});

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

  console.log("enhancedWork.value", enhancedWork.value);
});

const { files, open, reset, onCancel, onChange } = useFileDialog({
  accept: "image/*", // Set to accept only image files
  directory: false, // Select directories instead of files if set true
});

onChange(async (files) => {
  const file = files?.[0];
  if (!file) {
    return;
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('voice_actor_id', voiceActor.value?.id)

  const { data, error } = await supabase.functions.invoke('upload_profile_picture', {
    body: formData
  })

  profilePicture.value = data.fullPath;
});

onCancel(() => {
  /** do something on cancel */
});

const uploadImage = async () => {
  open();
};
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

.body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.work {
  // overflow: hidden;
  width: 100%;
  margin: 4px;
  display: flex;
  flex-direction: row;
  vertical-align: top;
  height: auto;
  flex: 1 0 auto;
  color: inherit;
  text-decoration: none;
  gap: 16px;

  .infos {
    display: flex;
    flex-direction: column;
    flex: 1;

    .actor-link {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }

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
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
