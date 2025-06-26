import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useIonRouter } from '@ionic/vue';
import { alertController, modalController } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/api/supabase';

export interface VoiceActor {
  id: number;
  firstname: string;
  lastname: string;
  profile_picture?: string;
}

export interface WorkAndVoiceActor {
  id: number;
  voice_actor_id: number;
  work_id: number;
  work_type: string;
  performance: string;
  voiceActorDetails: VoiceActor;
}

export function useVoiceActorManagement(workType: 'movie' | 'tv' | 'season' | 'episode') {
  const router = useRouter();
  const route = useRoute();
  const ionRouter = useIonRouter();
  const authStore = useAuthStore();
  const { isAdmin } = storeToRefs(authStore);

  // Search modal state
  const showVoiceActorSearch = ref(false);
  const searchTerm = ref('');
  const searchResults = ref<VoiceActor[]>([]);
  const isSearching = ref(false);
  const searchError = ref('');
  const selectedActor = ref<any>(null);

  // Voice actors data
  const voiceActors = ref<WorkAndVoiceActor[]>([]);
  const isLoading = ref(false);
  const error = ref('');

  const getImage = (path: string) => {
    return `https://image.tmdb.org/t/p/w500/${path}`;
  };

  const getVoiceActorByTmdbId = (tmdbId: number): WorkAndVoiceActor[] => {
    console.log('tmdbId', tmdbId);
    console.log('voiceActors.value', voiceActors.value);
    return voiceActors.value.filter(va => va.actor_id === tmdbId);
  };

  const openVoiceActorSearch = (actor: any) => {
    selectedActor.value = actor;
    searchTerm.value = '';
    searchResults.value = [];
    showVoiceActorSearch.value = true;
  };

  const searchVoiceActors = async () => {
    if (!searchTerm.value.trim()) {
      searchResults.value = [];
      return;
    }

    isSearching.value = true;
    searchError.value = '';

    try {
      const response = await supabase.functions.invoke('search-voice-actors', {
        body: {
          query: searchTerm.value
        }
      });
      console.log(response.data);
      searchResults.value = response.data;
    } catch (err) {
      console.error('Error searching voice actors:', err);
      searchError.value = 'Failed to search voice actors. Please try again.';
    } finally {
      isSearching.value = false;
    }
  };

  const linkVoiceActor = async (voiceActor: VoiceActor, contentId: string) => {
    console.log('selectedActor.value', selectedActor.value);
    try {
      const response = await supabase.functions.invoke('link-voice-actor', {
        body: {
          actor_id: selectedActor.value.id,
          work_type: workType,
          voice_actor_id: voiceActor.id,
          performance: 'dialogues',
          content_id: contentId,
        }
      });

      // Add the new voice actor to the list
      voiceActors.value.push({
        ...response.data,
        voiceActorDetails: voiceActor
      });

      // Close the modal
      showVoiceActorSearch.value = false;
    } catch (error) {
      console.error('Error linking voice actor:', error);
      const alert = await alertController.create({
        header: 'Error',
        message: 'Failed to link voice actor. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  };

  const editVoiceActorLink = async (workItem: WorkAndVoiceActor) => {
    const alert = await alertController.create({
      header: 'Edit Performance',
      inputs: [
        {
          name: 'performance',
          type: 'text',
          placeholder: 'Performance type (e.g., Voice, ADR, etc.)',
          value: workItem.performance || 'Voice'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            await updateVoiceActorLink(workItem.id, data.performance);
          }
        }
      ]
    });

    await alert.present();
  };

  const updateVoiceActorLink = async (workId: number, performance: string) => {
    try {
      const response = await supabase.functions.invoke('update_voice_actor_link', {
        body: {
          work_id: workId,
          performance
        }
      });

      // Update the local state
      const index = voiceActors.value.findIndex(va => va.id === workId);
      if (index !== -1) {
        voiceActors.value[index].performance = response.data.performance;
      }
    } catch (error) {
      console.error('Error updating voice actor link:', error);
      const alert = await alertController.create({
        header: 'Error',
        message: 'Failed to update voice actor link. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  };

  const confirmDeleteVoiceActorLink = async (workItem: WorkAndVoiceActor) => {
    const alert = await alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to remove ${workItem.voiceActorDetails.firstname} ${workItem.voiceActorDetails.lastname}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => deleteVoiceActorLink(workItem.id)
        }
      ]
    });
    await alert.present();
  };

  const deleteVoiceActorLink = async (workId: number) => {
    try {
      await supabase.functions.invoke('delete-voice-actor-link', {
        body: {
          work_id: workId
        }
      });

      // Remove from local state
      voiceActors.value = voiceActors.value.filter(va => va.id !== workId);
    } catch (error) {
      console.error('Error deleting voice actor link:', error);
      const alert = await alertController.create({
        header: 'Error',
        message: 'Failed to delete voice actor link. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  };

  const goToVoiceActor = (id: number) => {
    ionRouter.push({
      name: 'VoiceActorDetails',
      params: { id }
    });
  };

  watch(voiceActors, (newVal) => {
    console.log('voiceActors changed:', newVal);
  });

  return {
    // State
    showVoiceActorSearch,
    searchTerm,
    searchResults,
    isSearching,
    searchError,
    voiceActors,
    isLoading,
    error,
    isAdmin,
    
    // Methods
    getImage,
    getVoiceActorByTmdbId,
    openVoiceActorSearch,
    searchVoiceActors,
    linkVoiceActor,
    editVoiceActorLink,
    confirmDeleteVoiceActorLink,
    deleteVoiceActorLink,
    goToVoiceActor,
  };
}
