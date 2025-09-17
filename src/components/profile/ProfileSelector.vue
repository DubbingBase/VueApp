<template>
  <div class="profile-selector">
    <ion-item>
      <ion-label position="stacked">Profil sélectionné</ion-label>
      <ion-select
        :value="selectedProfileId"
        placeholder="Sélectionner un profil"
        @ionChange="onProfileChange($event)"
        :disabled="isSwitching"
      >
        <ion-select-option
          v-for="profile in availableProfiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.label }}
        </ion-select-option>
        <ion-select-option v-if="authStore.isAdmin" value="add-new">
          + Ajouter un nouveau profil comédien
        </ion-select-option>
      </ion-select>
    </ion-item>

    <div v-if="profileStore.hasMultipleVoiceActors" class="profile-count">
      <ion-badge color="primary">{{ profileStore.allVoiceActors.length }} profil(s) comédien(s)</ion-badge>
    </div>

    <ion-loading
      :is-open="isSwitching"
      message="Changement de profil..."
      spinner="crescent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonLoading,
  alertController
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'

interface Props {
  hasUnsavedChanges?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasUnsavedChanges: false
})

const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const isSwitching = ref(false)

const availableProfiles = computed(() => {
  const profiles = []

  // Add voice actor profiles
  profileStore.allVoiceActors.forEach(va => {
    profiles.push({
      id: `va-${va.id}`,
      label: `${va.firstname} ${va.lastname} - Comédien`,
      type: 'voice_actor',
      voiceActorId: va.id
    })
  })

  // Add user profile if exists, or option to create one
  if (profileStore.userProfileData) {
    profiles.push({
      id: 'user-profile',
      label: 'Mon Profil Utilisateur',
      type: 'user_profile'
    })
  } else {
    profiles.push({
      id: 'create-user-profile',
      label: '+ Créer un Profil Utilisateur',
      type: 'create_user_profile'
    })
  }

  return profiles
})

const selectedProfileId = computed(() => {
  if (profileStore.currentProfileType === 'voice_actor' && profileStore.currentVoiceActor) {
    return `va-${profileStore.currentVoiceActor.id}`
  } else if (profileStore.currentProfileType === 'user_profile') {
    return 'user-profile'
  }
  return null
})

const onProfileChange = async (event: any) => {
  const value = event.detail.value

  if (value === 'add-new') {
    // Handle adding new voice actor profile
    router.push('/tabs/admin/add-voice-actor')
    return
  }

  if (value === 'create-user-profile') {
    // Handle creating new user profile
    profileStore.selectUserProfile()
    router.push('/tabs/profile')
    return
  }

  if (value === selectedProfileId.value) return

  // Check if there are unsaved changes
  if (props.hasUnsavedChanges) {
    const shouldProceed = await confirmSwitch()
    if (!shouldProceed) return
  }

  try {
    isSwitching.value = true

    if (value.startsWith('va-')) {
      const voiceActorId = parseInt(value.replace('va-', ''))
      await profileStore.selectVoiceActor(voiceActorId, {})
      // Update route if needed
      if (voiceActorId !== profileStore.currentVoiceActorId) {
        router.push(`/tabs/profile/${voiceActorId}`)
      }
    } else if (value === 'user-profile') {
      profileStore.selectUserProfile()
      router.push('/tabs/profile')
    }
  } catch (error) {
    console.error('Error switching profile:', error)
    // Show error alert
    const alert = await alertController.create({
      header: 'Erreur',
      message: 'Impossible de changer de profil. Veuillez réessayer.',
      buttons: ['OK']
    })
    await alert.present()
  } finally {
    isSwitching.value = false
  }
}

const confirmSwitch = async (): Promise<boolean> => {
  const alert = await alertController.create({
    header: 'Modifications non sauvegardées',
    message: 'Vous avez des modifications non sauvegardées. Voulez-vous continuer sans sauvegarder ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        handler: () => {
          return false
        }
      },
      {
        text: 'Continuer',
        handler: () => {
          return true
        }
      }
    ]
  })

  await alert.present()
  const result = await alert.onDidDismiss()
  return result.role !== 'cancel'
}
</script>

<style scoped>
.profile-selector {
  padding: 1rem;
  border-bottom: 1px solid var(--ion-color-light-shade);
  background-color: var(--ion-color-light);
}

ion-item {
  --background: transparent;
  --border-radius: 8px;
  margin-bottom: 0.5rem;
}

.profile-count {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

ion-badge {
  font-size: 0.8rem;
}
</style>
