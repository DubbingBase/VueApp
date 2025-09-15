<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Ajouter un projet</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="closeModal">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <form @submit.prevent="handleSubmit">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Type de média *</ion-label>
          <ion-select
            v-model="formData.media_type"
            placeholder="Sélectionner le type"
            interface="popover"
          >
            <ion-select-option value="movie">Film</ion-select-option>
            <ion-select-option value="serie">Série</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Titre du média *</ion-label>
          <ion-input
            v-model="formData.media_title"
            placeholder="Rechercher un film ou une série..."
            @ionInput="searchMedia"
          ></ion-input>
        </ion-item>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results">
          <ion-list>
            <ion-item
              v-for="result in searchResults"
              :key="result.id"
              button
              @click="selectMedia(result)"
            >
              <ion-thumbnail slot="start">
                <img
                  v-if="result.poster_path"
                  :src="`https://image.tmdb.org/t/p/w92${result.poster_path}`"
                  :alt="getMediaTitle(result)"
                />
                <div v-else class="placeholder">
                  <ion-icon name="film"></ion-icon>
                </div>
              </ion-thumbnail>
              <ion-label>
                <h3>{{ getMediaTitle(result) }}</h3>
                <p>{{ result.release_date ? new Date(result.release_date).getFullYear() : '' }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>

        <ion-item v-if="selectedMedia">
          <ion-label position="stacked">Média sélectionné</ion-label>
          <ion-input
            :value="getMediaTitle(selectedMedia)"
            readonly
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Nom du personnage</ion-label>
          <ion-input
            v-model="formData.character_name"
            placeholder="Nom du personnage doublé"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Rôle</ion-label>
          <ion-input
            v-model="formData.role"
            placeholder="Ex: Voix principale, Voix secondaire..."
          ></ion-input>
        </ion-item>
      </ion-list>

      <div class="form-actions">
        <ion-button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          expand="block"
        >
          <ion-spinner v-if="isSubmitting" slot="start" name="crescent"></ion-spinner>
          <span v-else>Ajouter le projet</span>
        </ion-button>
      </div>
    </form>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonThumbnail,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useRoute } from 'vue-router'
import type { Movie } from '../../../supabase/functions/_shared/movie'
import type { Serie } from '../../../supabase/functions/_shared/serie'

const profileStore = useProfileStore()
const route = useRoute()
const emit = defineEmits<{
  close: []
}>()

const formData = ref({
  media_type: '' as 'movie' | 'serie' | '',
  media_title: '',
  character_name: '',
  role: ''
})

const searchResults = ref<(Movie | Serie)[]>([])
const selectedMedia = ref<Movie | Serie | null>(null)
const isSubmitting = ref(false)
const searchTimeout = ref<NodeJS.Timeout | null>(null)

const isFormValid = computed(() => {
  return formData.value.media_type &&
         selectedMedia.value &&
         formData.value.media_title.trim()
})

const getMediaTitle = (media: any) => {
  return media?.title || media?.name || 'Titre inconnu'
}

const closeModal = () => {
  emit('close')
}

const searchMedia = async () => {
  if (!formData.value.media_title.trim() || !formData.value.media_type) {
    searchResults.value = []
    return
  }

  // Debounce search
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      const query = formData.value.media_title.trim()
      const type = formData.value.media_type

      const response = await fetch(
        `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}&language=fr-FR&page=1`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
            'Accept': 'application/json',
          },
        }
      )

      const data = await response.json()
      searchResults.value = data.results?.slice(0, 5) || []
    } catch (error) {
      console.error('Error searching media:', error)
      searchResults.value = []
    }
  }, 500)
}

const selectMedia = (media: Movie | Serie) => {
  selectedMedia.value = media
  formData.value.media_title = getMediaTitle(media)
  searchResults.value = []
}

const handleSubmit = async () => {
  if (!isFormValid.value || !selectedMedia.value || !profileStore.voiceActor) return

  try {
    isSubmitting.value = true

    const targetUserId = route.params.userId as string | undefined

    await profileStore.addWorkEntry({
      voice_actor_id: profileStore.voiceActor.id,
      media_type: formData.value.media_type as 'movie' | 'serie',
      media_id: selectedMedia.value.id,
      character_name: formData.value.character_name || undefined,
      role: formData.value.role || undefined
    }, targetUserId)

    closeModal()
  } catch (error) {
    console.error('Error adding work entry:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.search-results {
  margin: 1rem 0;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 4px;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-light);
  border-radius: 4px;
}

.placeholder ion-icon {
  font-size: 2rem;
  color: var(--ion-color-medium);
}

.form-actions {
  padding: 1rem;
}
</style>
