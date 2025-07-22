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
          <div class="section-header">
            <h2>Rôles de doublage</h2>
            <ion-chip outline color="primary" class="role-count">
              {{ actor.voice_roles.length }} rôle{{ actor.voice_roles.length > 1 ? 's' : '' }}
            </ion-chip>
          </div>
          <ion-list lines="none" class="voice-roles-list">
            <ion-item 
              v-for="role in actor.voice_roles"
              :key="role.voice_actor_id"
              class="voice-role-item"
              button
              detail
              @click="goToVoiceActor(role.voice_actor_id)"
              :aria-label="`Voir les détails de la voix de ${role.voiceActorDetails?.name || role.voiceActorDetails?.firstname + ' ' + role.voiceActorDetails?.lastname}`"
            >
              <ion-avatar slot="start" class="voice-actor-avatar">
                <img
                  v-if="role.voiceActorDetails?.profile_picture"
                  :src="getImage(role.voiceActorDetails.profile_picture)"
                  :alt="role.voiceActorDetails?.name || role.voiceActorDetails?.firstname + ' ' + role.voiceActorDetails?.lastname"
                />
                <div v-else class="fallback-avatar">
                  <ion-icon :icon="person" />
                </div>
              </ion-avatar>
              <ion-label class="voice-actor-details">
                <h3 class="voice-actor-name">
                  {{ role.voiceActorDetails?.firstname }} {{ role.voiceActorDetails?.lastname }}
                </h3>
                <p class="voice-role-performance">
                  <ion-icon :icon="mic" />
                  {{ role.performance }}
                </p>
                <p v-if="role.mediaDetails" class="media-details">
                  <ion-thumbnail class="media-poster">
                    <img 
                      v-if="role.mediaDetails.poster_path"
                      :src="getImage(role.mediaDetails.poster_path, 'w92')" 
                      :alt="role.mediaDetails.title"
                    />
                    <div v-else class="fallback-poster">
                      <ion-icon :icon="film" />
                    </div>
                  </ion-thumbnail>
                  <span class="media-info">
                    <strong>{{ role.mediaDetails.title }}</strong>
                    <span v-if="role.mediaDetails.release_date" class="media-year">
                      ({{ new Date(role.mediaDetails.release_date).getFullYear() }})
                    </span>
                    <span v-if="role.mediaDetails.overview" class="media-overview">
                      {{ role.mediaDetails.overview.substring(0, 100) }}{{ role.mediaDetails.overview.length > 100 ? '...' : '' }}
                    </span>
                  </span>
                </p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useIonRouter } from "@ionic/vue";
import { useRoute } from "vue-router";
import {
  IonPage,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonChip,
  IonIcon,
} from "@ionic/vue";
import { mic, person, language, film } from 'ionicons/icons';
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
  const { push } = useIonRouter();
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
  padding: 1rem 0;
  background: linear-gradient(to bottom, var(--ion-color-light) 0%, transparent 100%);
  margin-bottom: 1rem;

  img {
    height: 200px;
    width: 160px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 1rem;
  }
}

.movies-wrapper, .series-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem;
}

.voice-roles-section {
  margin: 1.5rem 0;
  padding: 0 1rem;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ion-text-color);
    }
    
    .role-count {
      margin-left: 0.75rem;
      font-size: 0.8rem;
      height: 1.75rem;
    }
  }
}

.voice-roles-list {
  background: transparent;
  
  .voice-role-item {
    --padding-start: 0.5rem;
    --padding-end: 0.5rem;
    --inner-padding-end: 0.5rem;
    margin-bottom: 0.75rem;
    border-radius: 8px;
    background: var(--ion-item-background);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .voice-actor-avatar {
      width: 48px;
      height: 48px;
      margin-right: 0.75rem;
      
      img {
        object-fit: cover;
        border-radius: 8px;
      }
      
      .fallback-avatar {
        width: 100%;
        height: 100%;
        background: var(--ion-color-light);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ion-color-medium);
        
        ion-icon {
          font-size: 1.5rem;
        }
      }
    }
    
    .voice-actor-details {
      h3 {
        font-weight: 500;
        margin: 0 0 0.25rem 0;
        color: var(--ion-text-color);
      }
      
      p {
        margin: 0.25rem 0;
        font-size: 0.85rem;
        color: var(--ion-color-medium);
        display: flex;
        align-items: center;
        
        ion-icon {
          margin-right: 0.5rem;
          font-size: 1rem;
          color: var(--ion-color-primary);
        }
      }
      
      .voice-role-performance {
        font-weight: 500;
        color: var(--ion-color-primary) !important;
      }
      
      .media-details {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--ion-color-light);
        
        .media-poster {
          width: 40px;
          height: 60px;
          margin: 0;
          background: var(--ion-color-light);
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .fallback-poster {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--ion-color-medium);
            
            ion-icon {
              font-size: 1.5rem;
            }
          }
        }
        
        .media-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
          
          .media-year {
            color: var(--ion-color-medium);
            margin-left: 0.25rem;
          }
          
          .media-overview {
            color: var(--ion-color-medium);
            font-size: 0.8rem;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .voice-roles-section {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }
  
  .voice-roles-list {
    .voice-role-item {
      --padding-start: 1rem;
      --padding-end: 1rem;
      --inner-padding-end: 1rem;
    }
  }
}
</style>
