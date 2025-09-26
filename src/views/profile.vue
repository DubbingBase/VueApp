<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t('profile.userProfile') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="profileStore.isLoadingProfile && !profileStore.isUpdating" class="loading-container">
        <LoadingSpinner name="crescent" text="Chargement du profil..." />
      </div>

      <div v-else-if="profileStore.profileError" class="error-container">
        <ion-icon :icon="refresh" color="danger" size="large"></ion-icon>
        <h3>Error loading</h3>
        <p>{{ profileStore.profileError }}</p>
        <ion-button @click="retryLoadProfile" fill="outline">
          <ion-icon slot="start" :icon="refresh"></ion-icon>
          Retry
        </ion-button>
      </div>

      <div v-else class="profile-content">
        <div v-if="profileStore.hasProfile && editableProfile">
          <ion-list>
            <ion-item>
              <ion-textarea label="Biography" label-placement="stacked" v-model="editableProfile.bio" :auto-grow="true"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-input label="Nationality" label-placement="stacked" v-model="editableProfile.nationality"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input type="date" label="Date of birth" label-placement="stacked" v-model="editableProfile.date_of_birth"></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" @click="handleSave" :disabled="profileStore.isUpdating">
            <LoadingSpinner v-if="profileStore.isUpdating" name="crescent" inline />
            Save changes
          </ion-button>
        </div>

        <div v-if="!profileStore.hasProfile || !profileStore.userProfileData" class="no-profile-container">
          <ion-icon :icon="personCircle" size="large" color="medium"></ion-icon>
          <h3 v-if="authStore.isAdmin">No profile found</h3>
          <h3 v-else>Create your user profile</h3>
          <p v-if="authStore.isAdmin">You are not yet linked to a voice actor profile.</p>
          <p v-if="authStore.isAdmin">Contact an administrator to link your account.</p>
          <p v-else>Fill in the information below to create your user profile.</p>

          <div v-if="!authStore.isAdmin" class="profile-creation-form">
            <ion-list>
              <ion-item>
                <ion-textarea label="Biography" label-placement="stacked" v-model="editableProfile.bio" :auto-grow="true" placeholder="Tell us about yourself..."></ion-textarea>
              </ion-item>
              <ion-item>
                <ion-input label="Nationality" label-placement="stacked" v-model="editableProfile.nationality" placeholder="Ex: French"></ion-input>
              </ion-item>
              <ion-item>
                <ion-input type="date" label="Date of birth" label-placement="stacked" v-model="editableProfile.date_of_birth"></ion-input>
              </ion-item>
            </ion-list>

            <ion-button expand="block" @click="handleCreateProfile" :disabled="profileStore.isUpdating">
              <LoadingSpinner v-if="profileStore.isUpdating" name="crescent" inline />
              Create my profile
            </ion-button>
          </div>
        </div>
      </div>


    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonInput,
  IonTextarea
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { personCircle, refresh } from 'ionicons/icons';
import type { Tables } from '../../supabase/functions/_shared/database.types';

type UserProfile = Tables<'user_profiles'>;

const profileStore = useProfileStore()
const authStore = useAuthStore()

const editableProfile = ref<any>({});

const retryLoadProfile = async () => {
  await profileStore.fetchProfile({})
}

onMounted(async () => {
  await profileStore.fetchProfile({})
})

watch(() => profileStore.userProfile, (newProfile) => {
  if (newProfile) {
    editableProfile.value = newProfile as Partial<UserProfile>;
  } else if (!profileStore.hasProfile) {
    editableProfile.value = {} as Partial<UserProfile>;
  }
}, { immediate: true });

const handleCreateProfile = async () => {
  const profileData: { bio?: string; date_of_birth?: string; nationality?: string } = {};

  if (editableProfile.value.bio) profileData.bio = editableProfile.value.bio;
  if (editableProfile.value.date_of_birth) profileData.date_of_birth = editableProfile.value.date_of_birth;
  if (editableProfile.value.nationality) profileData.nationality = editableProfile.value.nationality;

  await profileStore.createUserProfile(profileData);
};

const handleSave = async () => {
  if (profileStore.userProfile) {
    const updates: { [key: string]: any } = {};
    const editable = editableProfile.value as { [key: string]: any };
    const current = profileStore.userProfile as { [key: string]: any };

    for (const key in editable) {
      if (editable[key] !== current[key]) {
        updates[key] = editable[key];
      }
    }

    if (Object.keys(updates).length > 0) {
      await profileStore.updateProfile(updates, {});
    }
  }
};

</script>

<style scoped>
.loading-container,
.error-container,
.no-profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  padding: 2rem;
}


.error-container ion-icon,
.no-profile-container ion-icon {
  margin-bottom: 1rem;
  font-size: 3rem;
}

.error-container h3,
.no-profile-container h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--ion-color-primary);
}

.error-container p,
.no-profile-container p {
  margin: 0.5rem 0;
  color: var(--ion-text-color);
  opacity: 0.7;
}

.profile-content {
  padding: 1rem;
}

.work-section {
  margin-top: 2rem;
}

.work-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
