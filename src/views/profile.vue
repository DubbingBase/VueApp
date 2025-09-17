<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ profileStore.currentProfileType === 'voice_actor' ? 'Mon Profil de Comédien' : 'Mon Profil' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="profileStore.hasProfile && profileStore.currentProfileType === 'voice_actor'" @click="openPublicProfile">
            <ion-icon :icon="eye" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="profileStore.isLoadingProfile && !profileStore.isUpdating" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement du profil...</p>
      </div>

      <div v-else-if="profileStore.profileError" class="error-container">
        <ion-icon :icon="alertCircle" color="danger" size="large"></ion-icon>
        <h3>Erreur de chargement</h3>
        <p>{{ profileStore.profileError }}</p>
        <ion-button @click="retryLoadProfile" fill="outline">
          <ion-icon slot="start" :icon="refresh"></ion-icon>
          Réessayer
        </ion-button>
      </div>

      <div v-else class="profile-content">
        <ProfileSelector v-if="profileStore.allVoiceActors.length > 0 || !profileStore.userProfileData" :hasUnsavedChanges="hasUnsavedChanges" />
        <VoiceActorSelector v-if="authStore.isAdmin" />

        <div v-if="profileStore.hasProfile && editableProfile">
          <ion-list>
            <template v-if="profileStore.currentProfileType === 'voice_actor'">
              <ion-item>
                <ion-input label="Prénom" label-placement="stacked" v-model="(editableProfile as any).firstname"></ion-input>
              </ion-item>
              <ion-item>
                <ion-input label="Nom" label-placement="stacked" v-model="(editableProfile as any).lastname"></ion-input>
              </ion-item>
            </template>
            <ion-item>
              <ion-textarea label="Biographie" label-placement="stacked" v-model="editableProfile.bio" :auto-grow="true"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-input label="Nationalité" label-placement="stacked" v-model="editableProfile.nationality"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input type="date" label="Date de naissance" label-placement="stacked" v-model="editableProfile.date_of_birth"></ion-input>
            </ion-item>
            <template v-if="profileStore.currentProfileType === 'voice_actor'">
              <ion-item>
                <ion-input label="Prix et récompenses" label-placement="stacked" v-model="(editableProfile as any).awards"></ion-input>
              </ion-item>
              <ion-item>
                <ion-input label="Années d'activité" label-placement="stacked" v-model="(editableProfile as any).years_active"></ion-input>
              </ion-item>
            </template>
          </ion-list>

          <ion-button expand="block" @click="handleSave" :disabled="profileStore.isUpdating">
            <ion-spinner v-if="profileStore.isUpdating" name="crescent"></ion-spinner>
            Enregistrer les modifications
          </ion-button>

          <div v-if="profileStore.currentProfileType === 'voice_actor'" class="work-section">
            <div class="work-header">
              <h3>Filmographie</h3>
              <ion-button v-if="canEdit" @click="isAddWorkModalOpen = true">
                <ion-icon slot="icon-only" :icon="add"></ion-icon>
              </ion-button>
            </div>
            <WorkList @delete="handleDeleteWork" />
          </div>
        </div>

        <div v-if="!profileStore.hasProfile || (profileStore.currentProfileType === 'user_profile' && !profileStore.userProfileData)" class="no-profile-container">
          <ion-icon :icon="personCircle" size="large" color="medium"></ion-icon>
          <h3 v-if="authStore.isAdmin">Aucun profil trouvé</h3>
          <h3 v-else-if="profileStore.currentProfileType === 'user_profile' && !profileStore.userProfileData">Créer votre profil utilisateur</h3>
          <h3 v-else>Créer votre profil</h3>
          <p v-if="authStore.isAdmin">Vous n'êtes pas encore lié à un profil de comédien de doublage.</p>
          <p v-if="authStore.isAdmin">Contactez un administrateur pour lier votre compte.</p>
          <p v-else-if="profileStore.currentProfileType === 'user_profile' && !profileStore.userProfileData">Remplissez les informations ci-dessous pour créer votre profil utilisateur.</p>
          <p v-else>Remplissez les informations ci-dessous pour créer votre profil utilisateur.</p>

          <div v-if="!authStore.isAdmin" class="profile-creation-form">
            <ion-list>
              <ion-item>
                <ion-textarea label="Biographie" label-placement="stacked" v-model="editableProfile.bio" :auto-grow="true" placeholder="Parlez-nous de vous..."></ion-textarea>
              </ion-item>
              <ion-item>
                <ion-input label="Nationalité" label-placement="stacked" v-model="editableProfile.nationality" placeholder="Ex: Française"></ion-input>
              </ion-item>
              <ion-item>
                <ion-input type="date" label="Date de naissance" label-placement="stacked" v-model="editableProfile.date_of_birth"></ion-input>
              </ion-item>
            </ion-list>

            <ion-button expand="block" @click="handleCreateProfile" :disabled="profileStore.isUpdating">
              <ion-spinner v-if="profileStore.isUpdating" name="crescent"></ion-spinner>
              Créer mon profil
            </ion-button>
          </div>
        </div>
      </div>

      <ion-modal :is-open="isAddWorkModalOpen" @didDismiss="isAddWorkModalOpen = false">
        <AddWorkModal @close="isAddWorkModalOpen = false" />
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, watch, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonModal,
  IonButtons
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import VoiceActorSelector from '@/components/profile/VoiceActorSelector.vue';
import ProfileSelector from '@/components/profile/ProfileSelector.vue';
import WorkList from '@/components/profile/WorkList.vue';
import AddWorkModal from '@/components/profile/AddWorkModal.vue';
import { alertCircle, personCircle, refresh, add, eye } from 'ionicons/icons';
import type { Tables } from '../../supabase/functions/_shared/database.types';

type VoiceActor = Tables<'voice_actors'>;
type UserProfile = Tables<'user_profiles'>;

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const editableProfile = ref<Partial<VoiceActor | UserProfile>>({});
const isAddWorkModalOpen = ref(false);

const voiceActorId = computed(() => {
  const id = route.params.voiceActorId as string | undefined
  return id ? parseInt(id, 10) : undefined;
})

const canEdit = computed(() => {
  return authStore.isAdmin || !voiceActorId.value
})

const hasUnsavedChanges = computed(() => {
  if (!editableProfile.value || !profileStore.hasProfile) return false

  if (profileStore.currentProfileType === 'voice_actor' && profileStore.voiceActor) {
    const current = profileStore.voiceActor
    const editable = editableProfile.value as Partial<VoiceActor>
    return Object.keys(editable).some(key => {
      const k = key as keyof VoiceActor
      return editable[k] !== current[k]
    })
  } else if (profileStore.currentProfileType === 'user_profile' && profileStore.userProfile) {
    const current = profileStore.userProfile
    const editable = editableProfile.value as Partial<UserProfile>
    return Object.keys(editable).some(key => {
      const k = key as keyof UserProfile
      return editable[k] !== current[k]
    })
  }
  return false
})

const retryLoadProfile = async () => {
  await profileStore.fetchProfile({ voiceActorId: voiceActorId.value })
}

const handleDeleteWork = async (workEntryId: number) => {
  await profileStore.removeWorkEntry(workEntryId, { voiceActorId: voiceActorId.value });
};

onMounted(async () => {
  await profileStore.fetchProfile({ voiceActorId: voiceActorId.value })
})

watch(() => route.params.voiceActorId, async (newId) => {
    await profileStore.fetchProfile({ voiceActorId: newId ? parseInt(newId as string, 10) : undefined })
})

watch(() => profileStore.voiceActor, (newProfile) => {
  if (newProfile && profileStore.currentProfileType === 'voice_actor') {
    editableProfile.value = newProfile;
  } else if (!profileStore.hasProfile) {
    editableProfile.value = {};
  }
}, { immediate: true });

watch(() => profileStore.userProfile, (newProfile) => {
  if (newProfile && profileStore.currentProfileType === 'user_profile') {
    editableProfile.value = newProfile;
  } else if (!profileStore.hasProfile) {
    editableProfile.value = {};
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
  if (profileStore.currentProfileType === 'voice_actor' && profileStore.voiceActor) {
    const updates: Partial<VoiceActor> = {};
    const editable = editableProfile.value as Partial<VoiceActor>;
    for (const key in editable) {
      if (editable[key as keyof VoiceActor] !== profileStore.voiceActor[key as keyof VoiceActor]) {
        (updates as any)[key] = editable[key as keyof VoiceActor];
      }
    }

    if (Object.keys(updates).length > 0) {
      await profileStore.updateProfile(updates, { voiceActorId: voiceActorId.value });
    }
  } else if (profileStore.currentProfileType === 'user_profile' && profileStore.userProfile) {
    const updates: Partial<UserProfile> = {};
    const editable = editableProfile.value as Partial<UserProfile>;
    for (const key in editable) {
      if (editable[key as keyof UserProfile] !== profileStore.userProfile[key as keyof UserProfile]) {
        (updates as any)[key] = editable[key as keyof UserProfile];
      }
    }

    if (Object.keys(updates).length > 0) {
      await profileStore.updateProfile(updates, {});
    }
  }
};

const openPublicProfile = () => {
  if (profileStore.voiceActor) {
    router.push(`/voice-actor/${profileStore.voiceActor.id}`)
  }
}

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

.loading-container ion-spinner {
  margin-bottom: 1rem;
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
