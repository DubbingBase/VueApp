<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Informations détaillées</ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <form @submit.prevent="handleSubmit">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Prénom *</ion-label>
            <ion-input
              v-model="formData.firstname"
              placeholder="Votre prénom"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nom *</ion-label>
            <ion-input
              v-model="formData.lastname"
              placeholder="Votre nom"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nom de scène</ion-label>
            <ion-input
              v-model="formData.voice_actor_name"
              placeholder="Votre nom de scène (optionnel)"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Biographie</ion-label>
            <ion-textarea
              v-model="formData.bio"
              placeholder="Parlez-nous de vous..."
              :auto-grow="true"
              :rows="3"
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nationalité</ion-label>
            <ion-input
              v-model="formData.nationality"
              placeholder="Votre nationalité"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Date de naissance</ion-label>
            <ion-input
              v-model="formData.date_of_birth"
              type="date"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Années d'activité</ion-label>
            <ion-input
              v-model="formData.years_active"
              placeholder="Ex: 1995-présent"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Récompenses</ion-label>
            <ion-textarea
              v-model="formData.awards"
              placeholder="Vos récompenses et distinctions..."
              :auto-grow="true"
              :rows="2"
            ></ion-textarea>
          </ion-item>
        </ion-list>

        <div class="form-actions">
          <ion-button
            type="submit"
            :disabled="isUpdating || !isFormValid"
            expand="block"
          >
            <ion-spinner v-if="isUpdating" slot="start" name="crescent"></ion-spinner>
            <span v-else>Sauvegarder</span>
          </ion-button>
        </div>
      </form>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonSpinner
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const route = useRoute()

const formData = ref({
  firstname: '',
  lastname: '',
  voice_actor_name: '',
  bio: '',
  nationality: '',
  date_of_birth: '',
  years_active: '',
  awards: ''
})

const isUpdating = computed(() => profileStore.isUpdating)
const voiceActor = computed(() => profileStore.voiceActor)
const targetUserId = computed(() => route.params.userId as string | undefined)

const isFormValid = computed(() => {
  return formData.value.firstname.trim() && formData.value.lastname.trim()
})

// Initialize form with current data
const initializeForm = () => {
  if (voiceActor.value) {
    formData.value = {
      firstname: voiceActor.value.firstname || '',
      lastname: voiceActor.value.lastname || '',
      voice_actor_name: voiceActor.value.voice_actor_name || '',
      bio: voiceActor.value.bio || '',
      nationality: voiceActor.value.nationality || '',
      date_of_birth: voiceActor.value.date_of_birth || '',
      years_active: voiceActor.value.years_active || '',
      awards: voiceActor.value.awards || ''
    }
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    await profileStore.updateProfile(formData.value, targetUserId.value)
    // Success toast would be handled by the store
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}

onMounted(() => {
  initializeForm()
})

watch(voiceActor, () => {
  initializeForm()
})
</script>

<style scoped>
.form-actions {
  margin-top: 1rem;
  padding: 1rem 0 0 0;
}

ion-textarea {
  --padding-start: 0;
  --inner-padding-end: 0;
}
</style>
