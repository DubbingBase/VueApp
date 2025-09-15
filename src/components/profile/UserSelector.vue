<template>
  <div v-if="authStore.isAdmin" class="user-selector">
    <ion-item>
      <ion-label position="stacked">Sélectionner un utilisateur</ion-label>
      <ion-select
        v-model="selectedUserId"
        placeholder="Choisir un utilisateur"
        :disabled="isLoading"
        @ionChange="onUserChange"
      >
        <ion-select-option
          v-for="user in users"
          :key="user.id"
          :value="user.id"
        >
          {{ user.email }} (VA)
        </ion-select-option>
      </ion-select>
    </ion-item>

    <LoadingSpinner v-if="isLoading" />
    <ErrorMessage v-if="errorMessage" :message="errorMessage" />

    <ion-button
      v-if="selectedUserId"
      fill="outline"
      size="small"
      @click="viewOwnProfile"
    >
      <ion-icon slot="start" name="person"></ion-icon>
      Mon profil
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

interface User {
  id: string
  email: string
  user_metadata?: {
    voice_actor_id?: number
  }
}

const router = useRouter()
const authStore = useAuthStore()

const users = ref<User[]>([])
const selectedUserId = ref<string>('')
const isLoading = ref(false)
const errorMessage = ref('')


const onUserChange = (event: any) => {
  const userId = event.detail.value
  if (userId) {
    router.push(`/tabs/profile/${userId}`)
  } else {
    router.push('/tabs/profile')
  }
}

const viewOwnProfile = () => {
  selectedUserId.value = ''
  router.push('/tabs/profile')
}

const loadUsers = async () => {
  console.log('UserSelector: Loading users, isAdmin:', authStore.isAdmin)
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase.functions.invoke('list_users')
    if (error) {
      console.error('UserSelector: Error loading users:', error)
      errorMessage.value = 'Erreur lors du chargement des utilisateurs'
      throw error
    }

    console.log('UserSelector: Loaded users:', data?.users?.length || 0)
    users.value = data.users
      .filter((user: any) => user.user_metadata?.voice_actor_id)
      .map((user: any) => ({
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata
      }))
  } catch (error) {
    console.error('UserSelector: Error loading users:', error)
    errorMessage.value = 'Impossible de charger les utilisateurs'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  console.log('UserSelector: onMounted, isAdmin:', authStore.isAdmin)
  if (authStore.isAdmin) {
    loadUsers()
  }
})
</script>

<style scoped>
.user-selector {
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
