<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Voix</ion-title>
        <ion-buttons slot="end" v-if="isAdmin">
          <router-link :to="{ name: 'EditVoiceActor', params: { id: voiceActor?.id } }">
            <ion-button size="small" color="primary">Edit</ion-button>
          </router-link>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="actor">
        <div class="sort-controls" v-if="voiceActor">
          <ion-item>
            <ion-label>Trier par:</ion-label>
            <ion-select :value="sortBy" @ionChange="sortBy = $event.detail.value" interface="popover">
              <ion-select-option 
                v-for="option in sortOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>
        
        <div
          class="header"
          v-if="voiceActor"
        >
          <MediaThumbnail
            v-if="profilePicture"
            :path="profilePicture"
            from-storage
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

          <!-- Chronological view -->
          <template v-if="sortBy === 'chronological'">
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
                <div class="caption">
                  {{ work.media.release_date || work.media.first_air_date }}
                </div>

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
          </template>

          <!-- Grouped by actor view -->
          <template v-else>
            <div v-if="groupedWork.length === 0" class="no-works">
              <p>Aucune œuvre trouvée</p>
            </div>
            <div v-else>
              <div v-for="group in groupedWork" :key="group.actorId" class="actor-group">
                <div v-if="group.works.length > 0" class="actor-header">
                  <router-link 
                    :to="{ name: 'ActorDetails', params: { id: group.works[0].data.actor.id } }" 
                    class="actor-link"
                  >
                    <MediaThumbnail 
                      :height="40" 
                      :width="40" 
                      radius="50%" 
                      :path="group.works[0].data.actor.profile_path" 
                      class="actor-avatar"
                    />
                    <h3 class="actor-name">
                      {{ group.actorName }}
                      <span class="work-count">({{ group.works.length }} {{ group.works.length > 1 ? 'œuvres' : 'œuvre' }})</span>
                    </h3>
                  </router-link>
                </div>
                
                <div class="works-container">
                  <div
                    v-for="(work, index) in group.works"
                    :key="`work-${work.work.id}-${index}`"
                    class="work"
                  >
                    <div class="poster">
                      <router-link :to="{
                        name: work.media.media_type === 'movie' ? 'MovieDetails' : 'SerieDetails',
                        params: { id: work.media.id }
                      }">
                        <MediaThumbnail :path="work.media.poster_path" />
                      </router-link>
                    </div>
                    
                    <div class="infos">
                      <div class="title">{{ work.media.title || work.media.name }}</div>
                      <div class="character">{{ work.data.character }}</div>
                      <div class="year">
                        {{ (work.media.release_date || work.media.first_air_date)?.substring(0, 4) || '' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- <ion-button @click="addWikiId">Saisir wikipedia id</ion-button> -->
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
// Admin check: get user from supabase.auth and check for admin role
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
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute();

// Local admin check using Supabase auth

const { isAdmin } = storeToRefs(authStore);

// Sorting options
const sortBy = ref<'chronological' | 'actor'>('actor');
const sortOptions = [
  { value: 'chronological', label: 'Chronologique' },
  { value: 'actor', label: 'Par acteur' }
];

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

// Define a type for our enhanced work item
type EnhancedWorkItem = {
  media: MovieModel | SerieModel;
  work: { id: string; actor_id: string; content_id: number };
  data: {
    character: string | undefined;
    actor: {
      id: string;
      name: string;
      character?: string;
      profile_path?: string | null;
    };
  };
  sortDate: string;
};

// Get base enhanced work data
const baseEnhancedWork = computed<EnhancedWorkItem[]>(() => {
  if (!voiceActor.value?.work) {
    console.log('No voice actor work data available');
    return [];
  }
  
  const result = voiceActor.value.work
    .map((work) => {
      const media = medias.value.find((media) => media.id === work.content_id);
      
      if (!media) {
        console.warn(`No media found for work with content_id: ${work.content_id}`);
        return null;
      }
      
      // Ensure credits exist and has cast
      if (!media.credits?.cast) {
        console.warn(`No credits.cast found for media ${media.id}`);
        return null;
      }

      const actor = media.credits.cast.find((cast: any) => cast.id === work.actor_id);
      
      if (!actor) {
        console.warn(`No actor found with id: ${work.actor_id} in media ${media.id}`);
        return null;
      }
      
      const character = actor.character;
      const data = {
        character,
        actor: { 
          id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path
        },
      };

      return {
        media,
        work,
        data,
        sortDate: media.release_date || media.first_air_date || '9999-12-31' // Fallback for missing dates
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
    
  return result;
});

// For chronological view
const enhancedWork = computed(() => {
  if (!baseEnhancedWork.value) return [];
  
  return [...baseEnhancedWork.value].sort((a, b) => {
    if (!a || !b) return 0;
    return a.sortDate > b.sortDate ? -1 : 1; // Newest first
  });
});

// For grouped by actor view
const groupedWork = computed<{actorId: string; actorName: string; works: EnhancedWorkItem[]}[]>(() => {
  if (!baseEnhancedWork.value || baseEnhancedWork.value.length === 0) {
    return [];
  }
  
  const grouped: Record<string, EnhancedWorkItem[]> = {};
  
  baseEnhancedWork.value.forEach(work => {
    const actorId = work.data.actor.id;
    
    if (!grouped[actorId]) {
      grouped[actorId] = [];
    }
    
    grouped[actorId].push(work);
  });
  
  // Convert to array of {actorId, actorName, works}, sort actors by name, and sort their works by date
  const result = Object.entries(grouped)
    .map(([actorId, works]) => {
      // Sort works by date (newest first)
      const sortedWorks = [...works].sort((a, b) => {
        const dateA = a.media.release_date || a.media.first_air_date || '';
        const dateB = b.media.release_date || b.media.first_air_date || '';
        return dateB.localeCompare(dateA);
      });
      
      return {
        actorId,
        actorName: works[0]?.data.actor?.name || 'Unknown',
        works: sortedWorks
      };
    })
    // Sort actors by name
    .sort((a, b) => a.actorName.localeCompare(b.actorName));
  
  return result;
});

const addWikiId = () => {
  console.log("addWikiId");
};

onMounted(async () => {
  const id = route.params.id;

  console.log('Fetching voice actor with ID:', id);
  
  const voiceActorResponseRaw = await supabase.functions.invoke("voice-actor", {
    body: { id },
  });
  
  const voiceActorResponse = (await voiceActorResponseRaw.data) as VoiceActorResponse;
  
  console.log("Raw voice actor response:", voiceActorResponse);
  
  if (!voiceActorResponse) {
    console.error("voiceActorResponse is null");
    return;
  }
  
  console.log('Voice actor data:', voiceActorResponse.voiceActor);
  console.log('Number of works:', voiceActorResponse.voiceActor.work?.length || 0);
  console.log('Number of medias:', voiceActorResponse.medias?.length || 0);
  
  // Log first few works and medias for inspection
  if (voiceActorResponse.voiceActor.work) {
    console.log('First 3 works:', voiceActorResponse.voiceActor.work.slice(0, 3));
  }
  
  if (voiceActorResponse.medias) {
    console.log('First 3 medias:', voiceActorResponse.medias.slice(0, 3).map(m => ({
      id: m.id,
      title: m.title || m.name,
      credits: m.credits ? {
        cast: m.credits.cast?.slice(0, 3).map(c => ({ id: c.id, name: c.name, character: c.character })),
        crew: m.credits.crew?.slice(0, 3).map(c => ({ id: c.id, name: c.name, job: c.job }))
      } : 'No credits'
    })));
  }
  
  voiceActor.value = voiceActorResponse.voiceActor;
  medias.value = voiceActorResponse.medias;

  profilePicture.value = voiceActorResponse.voiceActor.profile_picture;
  
  // Add a small delay to ensure computed properties are updated
  setTimeout(() => {
    console.log('baseEnhancedWork after update:', baseEnhancedWork.value);
    console.log('groupedWork after update:', groupedWork.value);
  }, 100);
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
.no-works {
  text-align: center;
  padding: 2rem;
  color: var(--ion-color-medium);
}

.actor-group {
  margin-bottom: 2.5rem;
  
  .actor-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--ion-color-light-shade);
    
    .actor-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      width: 100%;
      
      .actor-avatar {
        margin-right: 0.75rem;
        flex-shrink: 0;
      }
      
      .actor-name {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
        display: flex;
        flex-direction: column;
        
        .work-count {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--ion-color-medium);
          margin-top: 0.2rem;
        }
      }
    }
  }
  
  .works-container {
    padding-left: 1.25rem;
    margin-left: 1.25rem;
    border-left: 2px solid var(--ion-color-light-shade);
    
    .work {
      display: flex;
      margin-bottom: 1.25rem;
      padding: 0.75rem;
      background: var(--ion-color-light);
      border-radius: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .poster {
        flex: 0 0 60px;
        margin-right: 1rem;
        
        img {
          border-radius: 4px;
          width: 60px;
          height: 90px;
          object-fit: cover;
        }
      }
      
      .infos {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        
        .title {
          font-weight: 500;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }
        
        .character {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          margin-bottom: 0.25rem;
          font-style: italic;
        }
        
        .year {
          font-size: 0.85rem;
          color: var(--ion-color-medium);
        }
      }
    }
  }
}

.sort-controls {
  padding: 8px 16px;
  background: var(--ion-color-light);
  
  ion-item {
    --background: transparent;
    --padding-start: 0;
    --inner-padding-end: 0;
    --min-height: 40px;
    
    ion-label {
      margin-right: 16px;
      margin-bottom: 0;
      font-weight: 500;
    }
    
    ion-select {
      --padding-start: 12px;
      --padding-end: 36px;
      --padding-top: 8px;
      --padding-bottom: 8px;
      background: var(--ion-color-light-shade);
      border-radius: 8px;
      width: 100%;
      max-width: 200px;
    }
  }
}

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
