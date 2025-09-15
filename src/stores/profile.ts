import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/api/supabase';
import type { Tables } from '../../supabase/functions/_shared/database.types';
import type { Movie } from '../../supabase/functions/_shared/movie';
import type { Serie } from '../../supabase/functions/_shared/serie';

type VoiceActor = Tables<'voice_actors'>;

export interface WorkEntry {
  id: number;
  voice_actor_id: number;
  media_type: 'movie' | 'serie';
  media_id: number;
  character_name?: string;
  role?: string;
  media?: Movie | Serie;
  actor_id?: number | null;
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const voiceActor = ref<VoiceActor | null>(null);
  const workEntries = ref<WorkEntry[]>([]);
  const isLoading = ref(false);
  const isUpdating = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasProfile = computed(() => !!voiceActor.value);
  const isLoadingProfile = computed(() => isLoading.value);
  const profileError = computed(() => error.value);

  // Actions
  const fetchProfile = async (params: { voiceActorId?: number; targetUserId?: string }) => {
    console.log('Profile store: fetchProfile called with params:', params)
    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase.functions.invoke('get-user-voice-actor', {
        body: params
      });

      console.log('Profile store: fetchProfile response:', { data, error: fetchError })

      if (fetchError) throw fetchError;

      console.log('Profile store: data.voiceActor exists:', !!data?.voiceActor)
      if (data?.voiceActor) {
        voiceActor.value = data.voiceActor;
        workEntries.value = data.medias || [];
      } else {
        voiceActor.value = null;
        workEntries.value = [];
      }
      console.log('Profile store: hasProfile after fetch:', hasProfile.value)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch profile';
      console.error('Error fetching profile:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (updates: Partial<VoiceActor>, identifiers: { targetUserId?: string; voiceActorId?: number }) => {
    if (!voiceActor.value) return;

    try {
      isUpdating.value = true;
      error.value = null;

      const { data, error: updateError } = await supabase.functions.invoke('update-voice-actor', {
        body: {
          voice_actor_id: identifiers.voiceActorId || voiceActor.value.id,
          updates,
          targetUserId: identifiers.targetUserId
        }
      });

      if (updateError) throw updateError;

      // Update local state
      voiceActor.value = { ...voiceActor.value, ...updates };
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile';
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const addWorkEntry = async (workEntry: Omit<WorkEntry, 'id' | 'character_name' | 'role' | 'media'>, identifiers: { targetUserId?: string; voiceActorId?: number }) => {
    try {
      isUpdating.value = true;
      error.value = null;

      const { data, error: addError } = await supabase.functions.invoke('link-voice-actor', {
        body: {
          ...workEntry,
          targetUserId: identifiers.targetUserId
        }
      });

      if (addError) throw addError;

      // Refresh work entries
      await fetchProfile(identifiers);
    } catch (err: any) {
      error.value = err.message || 'Failed to add work entry';
      console.error('Error adding work entry:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const removeWorkEntry = async (workEntryId: number, identifiers: { targetUserId?: string; voiceActorId?: number }) => {
    try {
      isUpdating.value = true;
      error.value = null;

      const { error: removeError } = await supabase.functions.invoke('delete-voice-actor-link', {
        body: { id: workEntryId, targetUserId: identifiers.targetUserId }
      });

      if (removeError) throw removeError;

      // Remove from local state
      workEntries.value = workEntries.value.filter(entry => entry.id !== workEntryId);
    } catch (err: any) {
      error.value = err.message || 'Failed to remove work entry';
      console.error('Error removing work entry:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const clearProfile = () => {
    voiceActor.value = null;
    workEntries.value = [];
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    voiceActor,
    workEntries,
    isLoading,
    isUpdating,
    error,

    // Getters
    hasProfile,
    isLoadingProfile,
    profileError,

    // Actions
    fetchProfile,
    updateProfile,
    addWorkEntry,
    removeWorkEntry,
    clearProfile,
    clearError,
  };
});
