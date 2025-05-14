<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Admin</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="top">
          <ion-tab-button tab="duplicates" @click="activeTab = 'duplicates'">
            <ion-label>Doublons VA</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="users" @click="activeTab = 'users'">
            <ion-label>Utilisateurs</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="work" @click="activeTab = 'work'">
            <ion-label>Doublons Work</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
        <div v-if="activeTab === 'duplicates'">
          <DuplicateVATool />
        </div>
        <div v-if="activeTab === 'users'">
          <UserManagement />
        </div>
        <div v-if="activeTab === 'work'">
          <DuplicateWork />
        </div>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonRouterOutlet, IonToolbar, IonTitle, IonContent, IonTabs, IonTabBar, IonTabButton, IonLabel } from '@ionic/vue';
import DuplicateVATool from '@/components/admin/DuplicateVATool.vue';
import UserManagement from '@/components/admin/UserManagement.vue';
import DuplicateWork from '@/components/admin/DuplicateWork.vue';

const activeTab = ref('duplicates');
</script>

<style scoped>
ion-segment {
  margin: 1rem 0;
}
</style>
