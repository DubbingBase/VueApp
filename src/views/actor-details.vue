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
          <ion-segment v-model="active">
            <ion-segment-button value="about">
              <ion-label>À propos</ion-label>
            </ion-segment-button>
            <ion-segment-button value="movies">
              <ion-label>Films</ion-label>
            </ion-segment-button>
            <ion-segment-button value="series">
              <ion-label>Séries</ion-label>
            </ion-segment-button>
          </ion-segment>
          
          <ion-segment-view :activeIndex="active">
            <ion-segment-content value="about">
              <p>Date de naissance : {{ actor.birthday }}</p>
              {{ actor.biography }}
            </ion-segment-content>
            <ion-segment-content value="movies">
              <div class="movies-wrapper">
                <movie v-for="movie in movies" :value="movie"></movie>
              </div>
            </ion-segment-content>
            <ion-segment-content value="series">
              <div class="series-wrapper">
                <serie v-for="serie in series" :value="serie"></serie>
              </div>
            </ion-segment-content>
          </ion-segment-view>
        </div>
        <div v-if="actor && actor.voice_roles && actor.voice_roles.length" class="voice-roles-section">
          <div class="section-header">
            <h2>Rôles</h2>
            <ion-chip outline color="primary" class="role-count">
              {{ actor.voice_roles.length }} rôle{{ actor.voice_roles.length > 1 ? 's' : '' }}
            </ion-chip>
          </div>
          
          <!-- Group voice roles by media -->
          <div v-for="(roles, mediaId) in groupVoiceRolesByMedia()" :key="mediaId" class="media-voice-roles">
            <div class="media-header" @click="goToMedia(roles[0].mediaDetails.id)">
              <ion-thumbnail class="media-poster">
                <img 
                  v-if="roles[0].mediaDetails.poster_path"
                  :src="getImage(roles[0].mediaDetails.poster_path, 'w92')" 
                  :alt="roles[0].mediaDetails.title || roles[0].mediaDetails.name"
                />
                <div v-else class="fallback-poster">
                  <ion-icon :icon="film" />
                </div>
              </ion-thumbnail>
              <div class="media-title-wrapper">
                <h3 class="media-title">
                  {{ roles[0].mediaDetails.title || roles[0].mediaDetails.name }}
                  <span v-if="(roles[0].mediaDetails.release_date || roles[0].mediaDetails.first_air_date)" class="media-year">
                    ({{ new Date(roles[0].mediaDetails.release_date || roles[0].mediaDetails.first_air_date).getFullYear() }})
                  </span>
                </h3>
                <p v-if="roles[0].mediaDetails.overview" class="media-overview">
                  {{ roles[0].mediaDetails.overview.substring(0, 120) }}{{ roles[0].mediaDetails.overview.length > 120 ? '...' : '' }}
                </p>
              </div>
            </div>
            
            <!-- List of voice roles and their actors for this media -->
            <ion-list lines="none" class="voice-roles-list">
              <div v-for="role in roles" :key="role.id" class="voice-role-group">
                <div class="role-character" v-if="role.character">
                  <ion-icon :icon="mic" />
                  {{ role.character }}
                </div>
                
                <ion-item 
                  v-for="voiceActor in role.voice_actors"
                  :key="voiceActor.id"
                  class="voice-role-item"
                  button
                  detail
                  @click="goToVoiceActor(voiceActor.id)"
                  :aria-label="`Voir les détails de la voix de ${voiceActor.firstname} ${voiceActor.lastname}`"
                >
                  <ion-avatar slot="start" class="voice-actor-avatar">
                    <img
                      v-if="voiceActor.profile_picture"
                      :src="getImage(voiceActor.profile_picture)"
                      :alt="`${voiceActor.firstname} ${voiceActor.lastname}`"
                    />
                    <div v-else class="fallback-avatar">
                      <ion-icon :icon="person" />
                    </div>
                  </ion-avatar>
                  <ion-label class="voice-actor-details">
                    <h3 class="voice-actor-name">
                      {{ voiceActor.firstname }} {{ voiceActor.lastname }}
                    </h3>
                    <p class="voice-role-performance" v-if="voiceActor.performance">
                      {{ voiceActor.performance }}
                    </p>
                  </ion-label>
                </ion-item>
              </div>
            </ion-list>
            
            <!-- Double loop to group roles by media -->
            <div v-for="(roles, character) in groupRolesByCharacter(mediaRoles)" :key="character" class="character-roles">
              <h4 class="character-name">{{ character }}</h4>
              <ion-list lines="none" class="character-roles-list">
                <ion-item 
                  v-for="role in roles"
                  :key="role.id"
                  class="character-role-item"
                  button
                  detail
                  @click="goToVoiceActor(role.id)"
                  :aria-label="`Voir les détails de la voix de ${role.name || role.firstname + ' ' + role.lastname}`"
                >
                  <ion-avatar slot="start" class="voice-actor-avatar">
                    <img
                      v-if="role.profile_picture"
                      :src="getImage(role.profile_picture)"
                      :alt="role.name || role.firstname + ' ' + role.lastname"
                    />
                    <div v-else class="fallback-avatar">
                      <ion-icon :icon="person" />
                    </div>
                  </ion-avatar>
                  <ion-label class="voice-actor-details">
                    <h3 class="voice-actor-name">
                      {{ role.firstname }} {{ role.lastname }}
                    </h3>
                    <p class="voice-role-performance" v-if="role.performance">
                      <ion-icon :icon="mic" />
                      {{ role.performance }}
                    </p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </div>
          </div>
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
  IonSegment,
  IonSegmentButton,
  IonSegmentView,
  IonSegmentContent,
  IonThumbnail,
  IonContent,
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
  const { push } = useIonRouter();
  push({ name: 'VoiceActorDetails', params: { id } });
}

function goToMedia(media: any) {
  const { push } = useIonRouter();
  if (media.media_type === 'movie' || media.title) {
    push({ name: 'MovieDetails', params: { id: media.id } });
  } else if (media.media_type === 'tv' || media.name) {
    push({ name: 'SerieDetails', params: { id: media.id } });
  }
}

function hasVoiceActors(actor: any): actor is { voice_actors: any[] } {
  return actor && Array.isArray(actor.voice_actors);
}

function groupRolesByCharacter(actorRoles: any) {
  if (!actorRoles) return {};

  const grouped = {};

  actorRoles.forEach(role => {
    if (!role.id) return;
    
    const mediaId = role.id;
    if (!grouped[mediaId]) {
      grouped[mediaId] = [];
    }
    
    grouped[mediaId].push(role);
  });

  console.log('grouped', grouped);
  
  return grouped;
}

// Group voice roles by media
function groupVoiceRolesByMedia() {
  if (!actor.value?.voice_roles) return {};
  
  const grouped = {};
  
  actor.value.voice_roles.forEach(role => {
    if (!role.id) return;
    
    const mediaId = role.id;
    if (!grouped[mediaId]) {
      grouped[mediaId] = [];
    }
    
    grouped[mediaId].push(role);
  });

  console.log('grouped', grouped);
  
  return grouped;
}
</script>

<style scoped lang="scss">
.media-voice-roles {
  margin-bottom: 2rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  & + .media-voice-roles {
    margin-top: 1.5rem;
  }
}

.media-header {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--ion-color-light-shade);
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: var(--ion-color-light-tint);
  }
}

.media-title-wrapper {
  flex: 1;
  margin-left: 1rem;
}

.media-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  display: flex;
  align-items: center;
  
  .media-year {
    margin-left: 0.5rem;
    font-size: 0.9rem;
    font-weight: normal;
    color: var(--ion-color-medium);
  }
}

.media-overview {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  line-height: 1.4;
}

.voice-roles-list {
  padding: 0.5rem 0;
  background: var(--ion-color-light);
  
  .voice-role-item {
    --padding-start: 1rem;
    --padding-end: 1rem;
    --min-height: 72px;
    
    &::part(native) {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }
  }
}

.voice-actor-avatar {
  width: 48px;
  height: 48px;
  margin-right: 1rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  .fallback-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--ion-color-light-shade);
    border-radius: 50%;
    color: var(--ion-color-medium);
    
    ion-icon {
      font-size: 1.5rem;
    }
  }
}

.voice-actor-details {
  h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    color: var(--ion-color-dark);
  }
  
  p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--ion-color-medium);
    
    ion-icon {
      margin-right: 0.25rem;
      vertical-align: middle;
    }
  }
}

.character-roles {
  margin-top: 1rem;
  padding: 0 1rem 1rem;
  
  .character-name {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ion-color-primary);
  }
  
  .character-roles-list {
    background: var(--ion-color-light-shade);
    border-radius: 8px;
    overflow: hidden;
    
    .character-role-item {
      --background: transparent;
      --padding-start: 0.75rem;
      --padding-end: 0.75rem;
      --min-height: 64px;
      
      &::part(native) {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
    }
  }
}

.media-poster {
  width: 60px;
  height: 90px;
  margin: 0;
  background: var(--ion-color-light-shade);
  border-radius: 4px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .fallback-poster {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--ion-color-medium);
    
    ion-icon {
      font-size: 2rem;
    }
  }
}

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
      cursor: pointer;
      
      img {
        object-fit: cover;
        border-radius: 8px;
        transition: transform 0.2s ease;
        &:hover {
          transform: scale(1.05);
        }
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
