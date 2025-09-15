<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="profileStore.isLoadingProfile" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement du profil...</p>
      </div>

      <div v-else-if="profileStore.profileError" class="error-container">
        <ion-icon name="alert-circle" color="danger" size="large"></ion-icon>
        <h3>Erreur de chargement</h3>
        <p>{{ profileStore.profileError }}</p>
        <ion-button @click="retryLoadProfile" fill="outline">
          <ion-icon slot="start" name="refresh"></ion-icon>
          Réessayer
        </ion-button>
      </div>

      <div v-else class="profile-content">
        <!-- User Selector for Admins -->
        <UserSelector v-if="authStore.isAdmin" />

        <!-- Profile Header -->
        <ProfileHeader v-if="profileStore.hasProfile" />

        <!-- Profile Details Editor -->
        <ProfileDetailsEditor v-if="profileStore.hasProfile" />

        <!-- Work Management -->
        <WorkManagement v-if="profileStore.hasProfile" />

        <!-- No profile message for non-admins -->
        <div v-if="!profileStore.hasProfile && !authStore.isAdmin" class="no-profile-container">
          <ion-icon name="person-circle" size="large" color="medium"></ion-icon>
          <h3>Aucun profil trouvé</h3>
          <p>Vous n'êtes pas encore lié à un profil de comédien de doublage.</p>
          <p>Contactez un administrateur pour lier votre compte.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonIcon,
  IonButton
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileDetailsEditor from '@/components/profile/ProfileDetailsEditor.vue'
import WorkManagement from '@/components/profile/WorkManagement.vue'
import UserSelector from '@/components/profile/UserSelector.vue'

const route = useRoute()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const targetUserId = computed(() => {
  const id = route.params.userId as string | undefined
  console.log('Profile view: targetUserId from route:', id)
  console.log('Profile view: isAdmin:', authStore.isAdmin)
  console.log('Profile view: hasProfile:', profileStore.hasProfile)
  console.log('Profile view: isLoadingProfile:', profileStore.isLoadingProfile)
  console.log('Profile view: profileError:', profileStore.profileError)
  return id
})

const retryLoadProfile = async () => {
  await profileStore.fetchProfile(targetUserId.value)
}

onMounted(async () => {
  await profileStore.fetchProfile(targetUserId.value)
})

// Watch for route changes to reload profile when userId changes
watch(() => route.params.userId, async (newUserId) => {
  if (newUserId !== targetUserId.value) {
    await profileStore.fetchProfile(newUserId as string)
  }
})
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
</style>
