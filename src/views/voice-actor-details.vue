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
        <VoiceActorHeader
          v-if="voiceActor"
          :voiceActor="voiceActor"
          :profilePicture="profilePicture"
          @profile-picture-changed="profilePicture = $event"
        />

        <VoiceActorBio
          v-if="voiceActor"
          :bio="voiceActor.bio"
        />

        <VoiceActorWorksGrouped
          v-if="voiceActor"
          :works="enhancedWork"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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
import VoiceActorHeader from "@/components/VoiceActorHeader.vue";
import VoiceActorBio from "@/components/VoiceActorBio.vue";
import VoiceActorWorksGrouped from "@/components/VoiceActorWorksGrouped.vue";
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute();

// Local admin check using Supabase auth

const { isAdmin } = storeToRefs(authStore);


type VoiceActorResponse = {
  voiceActor: {
    id: number;
    firstname: string;
    lastname: string;
    bio: string | null;
    nationality: string | null;
    date_of_birth: string | null;
    awards: string | null;
    years_active: string | null;
    social_media_links: any | null;
    profile_picture: string | null;
    voice_actor_name: string | null;
    work: {
      id: number;
      actor_id: number;
      content_id: number;
      content_type: string | null;
      highlight: boolean | null;
      performance: string | null;
      source_id: number | null;
      status: string | null;
      suggestions: string | null;
      voice_actor_id: number | null;
    }[];
  };
  medias: (MovieModel | SerieModel)[];
};

const voiceActor = ref<VoiceActorResponse["voiceActor"] | undefined>();
const medias = ref<VoiceActorResponse["medias"]>([]);
const profilePicture = ref<string | null | undefined>();

// Define a type for our enhanced work item
type EnhancedWorkItem = {
  media: MovieModel | SerieModel;
  work: { id: number; actor_id: number; content_id: number };
  data: {
    character: string | undefined;
    actor: {
      id: number;
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
      if (!(media as any).credits?.cast) {
        console.warn(`No credits.cast found for media ${media.id}`);
        return null;
      }

      const actor = (media as any).credits.cast.find((cast: any) => cast.id === work.actor_id);

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
        sortDate: (media as any).release_date || (media as any).first_air_date || '9999-12-31' // Fallback for missing dates
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
      title: (m as any).title || (m as any).name,
      credits: (m as any).credits ? {
        cast: (m as any).credits.cast?.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name, character: c.character })),
        crew: (m as any).credits.crew?.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name, job: c.job }))
      } : 'No credits'
    })));
  }

  voiceActor.value = voiceActorResponse.voiceActor;
  medias.value = voiceActorResponse.medias;

  profilePicture.value = voiceActorResponse.voiceActor.profile_picture;

  // Add a small delay to ensure computed properties are updated
  setTimeout(() => {
    console.log('baseEnhancedWork after update:', baseEnhancedWork.value);
    console.log('enhancedWork after update:', enhancedWork.value);
  }, 100);
});

</script>

<style scoped lang="scss">
.actor {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;

  // Horizontal layout for larger screens
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;
    align-items: start;

    // Header and bio on the left side
    > :nth-child(1),
    > :nth-child(2) {
      grid-column: 1;
    }

    // Works on the right side
    > :nth-child(3) {
      grid-column: 2;
      grid-row: 1 / -1;
    }
  }

  @media (min-width: 1200px) {
    grid-template-columns: 350px 1fr;
    gap: 32px;
  }
}
</style>
