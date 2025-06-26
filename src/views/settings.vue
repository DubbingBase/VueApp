<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Paramètres</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item lines="full">
          <ion-label>Email</ion-label>
          <ion-text>{{ user?.email }}</ion-text>
        </ion-item>
        <ion-item button @click="logout">
          <ion-label color="danger">Se déconnecter</ion-label>
        </ion-item>
      </ion-list>
      <ion-text color="medium" v-if="!user">Non connecté.</ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonText } from '@ionic/vue';
import { supabase } from '@/api/supabase';

const user = ref<any>(null);
const router = useRouter();

const fetchUser = async () => {
  user.value = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : supabase.auth.user();
};

onMounted(fetchUser);

const logout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};
</script>

<style scoped>
.ion-padding {
  padding: 2rem;
}
</style>
