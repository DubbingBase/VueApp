<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Gestion des projets</ion-card-title>
      <ion-button
        slot="end"
        fill="outline"
        size="small"
        @click="showAddWorkModal = true"
      >
        <ion-icon slot="start" name="add"></ion-icon>
        Ajouter un projet
      </ion-button>
    </ion-card-header>

    <ion-card-content>
      <WorkList v-if="workEntries.length > 0" @delete="handleDeleteWork" />
      <div v-else class="no-work">
        <ion-icon name="film" size="large" color="medium"></ion-icon>
        <p>Aucun projet ajouté pour le moment.</p>
        <ion-button @click="showAddWorkModal = true">
          <ion-icon slot="start" name="add"></ion-icon>
          Ajouter votre premier projet
        </ion-button>
      </div>
    </ion-card-content>

    <!-- Add Work Modal -->
    <ion-modal :is-open="showAddWorkModal" @will-dismiss="showAddWorkModal = false">
      <AddWorkModal @close="showAddWorkModal = false" />
    </ion-modal>
  </ion-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonModal
} from '@ionic/vue'
import { useProfileStore } from '@/stores/profile'
import { useRoute } from 'vue-router'
import WorkList from './WorkList.vue'
import AddWorkModal from './AddWorkModal.vue'

const profileStore = useProfileStore()
const route = useRoute()
const showAddWorkModal = ref(false)

const workEntries = computed(() => profileStore.workEntries)

const handleDeleteWork = async (workEntryId: number) => {
  try {
    const targetUserId = route.params.userId as string | undefined
    await profileStore.removeWorkEntry(workEntryId, targetUserId)
  } catch (error) {
    console.error('Error deleting work entry:', error)
  }
}
</script>

<style scoped>
.no-work {
  text-align: center;
  padding: 2rem;
  color: var(--ion-color-medium);
}

.no-work ion-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
