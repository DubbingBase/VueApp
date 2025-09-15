<template>
  <ion-card>
    <ion-card-content>
      <div class="profile-header">
        <ProfilePictureEditor />
        <ProfileBasicInfo />
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent } from '@ionic/vue'
import ProfilePictureEditor from './ProfilePictureEditor.vue'
import ProfileBasicInfo from './ProfileBasicInfo.vue'
</script>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
