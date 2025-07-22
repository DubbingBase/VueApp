<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Paramètres</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list v-if="user?.is_anonymous === false">
        <ion-item lines="full">
          <ion-label>Email</ion-label>
          <ion-text>{{ user?.email }}</ion-text>
        </ion-item>
        <ion-item button @click="logout">
          <ion-label color="danger">Se déconnecter</ion-label>
        </ion-item>
      </ion-list>
      <ion-text color="medium" v-else>
        <ion-button @click="login">Se connecter</ion-button>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIonRouter } from '@ionic/vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonText, IonButton, IonBackButton, IonButtons } from '@ionic/vue';
import { supabase } from '@/api/supabase';

const user = ref<any>(null);
const ionRouter = useIonRouter();

const fetchUser = async () => {
  user.value = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : supabase.auth.user();
};

onMounted(fetchUser);

const logout = async () => {
  await supabase.auth.signOut();
  ionRouter.push('/login');
};

const login = () => {
  ionRouter.push('/login');
};
</script>

<style scoped>
.ion-padding {
  padding: 2rem;
}
</style>
