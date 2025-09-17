import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/api/supabase';
import type { Tables } from '../../supabase/functions/_shared/database.types';
import type { Movie } from '../../supabase/functions/_shared/movie';
import type { Serie } from '../../supabase/functions/_shared/serie';

type VoiceActor = Tables<'voice_actors'>;
type UserProfile = Tables<'user_profiles'>;
type ProfileType = 'voice_actor' | 'user_profile';

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
  const profileType = ref<ProfileType | null>(null);
  const voiceActors = ref<VoiceActor[]>([]);
  const currentVoiceActorId = ref<number | null>(null);
  const primaryVoiceActorId = ref<number | null>(null);
  const voiceActor = computed(() => currentVoiceActor.value); // Keep for backward compatibility - current selected
  const userProfile = ref<UserProfile | null>(null);
  const workEntries = ref<WorkEntry[]>([]);
  const isLoading = ref(false);
  const isUpdating = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasProfile = computed(() => voiceActors.value.length > 0 || !!userProfile.value);
  const currentProfileType = computed(() => profileType.value);
  const allVoiceActors = computed(() => voiceActors.value);
  const currentVoiceActor = computed<VoiceActor | null>(() => {
    if (!currentVoiceActorId.value) return null;
    return (voiceActors.value as any).find((va: any) => va.id === currentVoiceActorId.value) || null;
  });
  const hasMultipleVoiceActors = computed(() => voiceActors.value.length > 1);
  const userProfileData = computed(() => userProfile.value);
  const isLoadingProfile = computed(() => isLoading.value);
  const profileError = computed(() => error.value);


  // Actions
  const fetchProfile = async (params: { voiceActorId?: number; targetUserId?: string }) => {
    console.log('Profile store: fetchProfile called with params:', params)
    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase.functions.invoke('get-user-profile');

      console.log('Profile store: fetchProfile response:', { data, error: fetchError })

      if (fetchError) throw fetchError;

      // Set voice actors
      voiceActors.value = data?.voice_actors || [];
      primaryVoiceActorId.value = data?.primary_voice_actor_id || null;

      // Set current voice actor ID
      if (voiceActors.value.length > 0) {
        currentVoiceActorId.value = params.voiceActorId || primaryVoiceActorId.value || voiceActors.value[0].id;
      } else {
        currentVoiceActorId.value = null;
      }

      // Set profile type and backward compatibility
      if (voiceActors.value.length > 0) {
        profileType.value = 'voice_actor';
        userProfile.value = null;
        // Set work entries from current voice actor data
        workEntries.value = (currentVoiceActor.value as any)?.medias || [];
      } else if (data?.user_profile) {
        profileType.value = 'user_profile';
        userProfile.value = data.user_profile;
        workEntries.value = [];
      } else {
        profileType.value = null;
        userProfile.value = null;
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

  const selectVoiceActor = async (voiceActorId: number, identifiers: { targetUserId?: string }) => {
    if (!voiceActors.value.find(va => va.id === voiceActorId)) {
      throw new Error('Voice actor not found');
    }
    try {
      currentVoiceActorId.value = voiceActorId;
      profileType.value = 'voice_actor';
      // Set work entries from the selected voice actor data
      workEntries.value = (voiceActors.value.find(va => va.id === voiceActorId) as any)?.medias || [];
    } catch (err: any) {
      error.value = err.message || 'Failed to select voice actor';
      console.error('Error selecting voice actor:', err);
      throw err;
    }
  };

  const selectUserProfile = () => {
    profileType.value = 'user_profile';
    currentVoiceActorId.value = null;
    workEntries.value = [];
  };

  const fetchAllVoiceActors = async (params: { page?: number; limit?: number; targetUserId?: string }) => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase.functions.invoke('get-user-voice-actors', {
        body: params
      });

      if (fetchError) throw fetchError;

      // Update the voiceActors array with paginated results
      // Note: This might replace or append depending on pagination logic
      voiceActors.value = data?.voice_actors || [];
      // Update pagination metadata if needed, but for now, just set the array

      return {
        voice_actors: voiceActors.value,
        pagination: data?.pagination,
        metadata: data?.metadata
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch all voice actors';
      console.error('Error fetching all voice actors:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (updates: Partial<VoiceActor | UserProfile>, identifiers: { targetUserId?: string; voiceActorId?: number }) => {
    if (!hasProfile.value) return;

    try {
      isUpdating.value = true;
      error.value = null;

      if (profileType.value === 'voice_actor' && currentVoiceActor.value) {
        const voiceActorUpdates = updates as Partial<VoiceActor>;
        const { data, error: updateError } = await supabase.functions.invoke('update-voice-actor', {
          body: {
            voice_actor_id: identifiers.voiceActorId || currentVoiceActor.value.id,
            updates: voiceActorUpdates,
            targetUserId: identifiers.targetUserId
          }
        });

        if (updateError) throw updateError;

        // Update local state
        const updatedVA = { ...currentVoiceActor.value, ...voiceActorUpdates } as VoiceActor;
        // Update in the array
        const index = voiceActors.value.findIndex(va => va.id === currentVoiceActor.value!.id);
        if (index !== -1) {
          voiceActors.value[index] = updatedVA;
        }
      } else if (profileType.value === 'user_profile' && userProfile.value) {
        const userProfileUpdates = updates as Partial<UserProfile>;
        const { data, error: updateError } = await supabase.functions.invoke('update-user-profile', {
          body: userProfileUpdates
        });

        if (updateError) throw updateError;

        // Update local state
        userProfile.value = { ...userProfile.value, ...userProfileUpdates };
      } else {
        throw new Error('Invalid profile type for update');
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile';
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const addWorkEntry = async (workEntry: Omit<WorkEntry, 'id' | 'character_name' | 'role' | 'media'>, identifiers: { targetUserId?: string; voiceActorId?: number }) => {
    if (profileType.value !== 'voice_actor' || !currentVoiceActor.value) {
      throw new Error('Work entries can only be added for voice actor profiles');
    }

    try {
      isUpdating.value = true;
      error.value = null;

      const { data, error: addError } = await supabase.functions.invoke('link-voice-actor', {
        body: {
          ...workEntry,
          voice_actor_id: currentVoiceActor.value.id,
          targetUserId: identifiers.targetUserId
        }
      });

      if (addError) throw addError;

      // Update work entries from the response data
      workEntries.value = (data as any)?.medias || workEntries.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to add work entry';
      console.error('Error adding work entry:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const removeWorkEntry = async (workEntryId: number, identifiers: { targetUserId?: string; voiceActorId?: number }) => {
    if (profileType.value !== 'voice_actor') {
      throw new Error('Work entries can only be managed for voice actor profiles');
    }

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

  const addVoiceActorLink = async (voiceActorId: number, identifiers: { targetUserId?: string }) => {
    try {
      isUpdating.value = true;
      error.value = null;

      const { data, error: addError } = await supabase.functions.invoke('link-user-voice-actor', {
        body: {
          voice_actor_id: voiceActorId,
          targetUserId: identifiers.targetUserId
        }
      });

      if (addError) throw addError;

      // Refresh profile to get updated voice actors
      await fetchProfile(identifiers);
    } catch (err: any) {
      error.value = err.message || 'Failed to add voice actor link';
      console.error('Error adding voice actor link:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const removeVoiceActorLink = async (voiceActorId: number, identifiers: { targetUserId?: string }) => {
    try {
      isUpdating.value = true;
      error.value = null;

      const { error: removeError } = await supabase.functions.invoke('delete-user-voice-actor-link', {
        body: {
          voice_actor_id: voiceActorId,
          targetUserId: identifiers.targetUserId
        }
      });

      if (removeError) throw removeError;

      // Remove from local state
      voiceActors.value = voiceActors.value.filter(va => va.id !== voiceActorId);
      if (currentVoiceActorId.value === voiceActorId) {
        // Select another voice actor or set to null
        currentVoiceActorId.value = voiceActors.value.length > 0 ? voiceActors.value[0].id : null;
        workEntries.value = [];
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to remove voice actor link';
      console.error('Error removing voice actor link:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const createUserProfile = async (profileData: { bio?: string; date_of_birth?: string; nationality?: string }) => {
    try {
      isUpdating.value = true;
      error.value = null;

      const { data, error: createError } = await supabase.functions.invoke('create-user-profile', {
        body: profileData
      });

      if (createError) throw createError;

      profileType.value = 'user_profile';
      userProfile.value = data.profile;
      workEntries.value = [];
    } catch (err: any) {
      error.value = err.message || 'Failed to create user profile';
      console.error('Error creating user profile:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const clearProfile = () => {
    profileType.value = null;
    voiceActors.value = [];
    currentVoiceActorId.value = null;
    primaryVoiceActorId.value = null;
    userProfile.value = null;
    workEntries.value = [];
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    profileType,
    voiceActors,
    currentVoiceActorId,
    primaryVoiceActorId,
    voiceActor, // Keep for backward compatibility
    userProfile,
    workEntries,
    isLoading,
    isUpdating,
    error,

    // Getters
    hasProfile,
    currentProfileType,
    allVoiceActors,
    currentVoiceActor,
    hasMultipleVoiceActors,
    userProfileData,
    isLoadingProfile,
    profileError,

    // Actions
    fetchProfile,
    selectVoiceActor,
    selectUserProfile,
    fetchAllVoiceActors,
    updateProfile,
    createUserProfile,
    addWorkEntry,
    removeWorkEntry,
    addVoiceActorLink,
    removeVoiceActorLink,
    clearProfile,
    clearError,
  };
});
