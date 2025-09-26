<template>
  <div v-if="authStore.isAdmin" class="voice-actor-selector">
    <ion-item>
      <ion-label position="stacked">Sélectionner un comédien</ion-label>
      <ion-input :value="selectedVoiceActorName" readonly placeholder="Choisir un comédien" @click="isModalOpen = true"></ion-input>
    </ion-item>

    <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Sélectionner un comédien</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="isModalOpen = false">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar
            v-model="searchTerm"
            placeholder="Rechercher..."
            @ionInput="onSearch"
          ></ion-searchbar>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item
            v-for="va in filteredVoiceActors"
            :key="va.id"
            button
            @click="selectVoiceActor(va)"
          >
            <ion-label>{{ va.firstname }} {{ va.lastname }}</ion-label>
          </ion-item>
        </ion-list>
        <LoadingSpinner v-if="isLoading" />
        <ErrorMessage v-if="errorMessage" :message="errorMessage" />
      </ion-content>
    </ion-modal>

    <ion-button
      v-if="selectedVoiceActorId"
      fill="outline"
      size="small"
      @click="viewOwnProfile"
    >
      <ion-icon slot="start" :icon="person"></ion-icon>
      Mon profil
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSearchbar,
  IonList,
  IonInput,
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import { person } from 'ionicons/icons'

interface VoiceActor {
  id: number;
  firstname: string;
  lastname: string;
}

const router = useRouter()
const authStore = useAuthStore()

const allVoiceActors = ref<VoiceActor[]>([])
const selectedVoiceActorId = ref<number | null>(null)
const selectedVoiceActorName = ref<string>('')
const isLoading = ref(false)
const errorMessage = ref('')
const isModalOpen = ref(false)
const searchTerm = ref('')

const filteredVoiceActors = computed(() => {
  if (!searchTerm.value) {
    return allVoiceActors.value;
  }
  return allVoiceActors.value.filter(va =>
    (va.firstname + ' ' + va.lastname).toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const selectVoiceActor = (va: VoiceActor) => {
  selectedVoiceActorId.value = va.id;
  selectedVoiceActorName.value = `${va.firstname} ${va.lastname}`;
  isModalOpen.value = false;
  onVoiceActorChange();
}

const onVoiceActorChange = () => {
  if (selectedVoiceActorId.value) {
    router.push({ name: 'Profile', params: { voiceActorId: selectedVoiceActorId.value } })
  } else {
    router.push({ name: 'Profile' })
  }
}

const viewOwnProfile = () => {
  selectedVoiceActorId.value = null
  selectedVoiceActorName.value = ''
  router.push({ name: 'Profile' })
}

const loadVoiceActors = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase.functions.invoke('list-voice-actors')
    if (error) {
      throw error
    }
    allVoiceActors.value = data.voice_actors
  } catch (error) {
    console.error('Error loading voice actors:', error)
    errorMessage.value = 'Impossible de charger les comédiens'
  } finally {
    isLoading.value = false
  }
}

const onSearch = (event: any) => {
  searchTerm.value = event.target.value;
}

onMounted(() => {
  if (authStore.isAdmin) {
    loadVoiceActors()
  }
})
</script>

<style scoped>
.voice-actor-selector {
  padding: 1rem;
  border-bottom: 1px solid var(--ion-color-light-shade);
  background-color: var(--ion-color-light);
}

ion-item {
  --background: transparent;
  --border-radius: 8px;
  margin-bottom: 0.5rem;
}

ion-button {
  margin-top: 0.5rem;
}
</style>
