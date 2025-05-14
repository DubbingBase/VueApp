<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ isRegister ? 'Créer un compte' : 'Connexion' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="isRegister ? register() : login()">
        <ion-list>
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Mot de passe</ion-label>
            <ion-input v-model="password" type="password" required></ion-input>
          </ion-item>
        </ion-list>
        <ion-button expand="block" type="submit" :disabled="loading">
          {{ loading ? (isRegister ? 'Création...' : 'Connexion...') : (isRegister ? 'Créer un compte' : 'Se connecter') }}
        </ion-button>
        <ion-button expand="block" fill="clear" type="button" @click="isRegister = !isRegister">
          {{ isRegister ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire" }}
        </ion-button>
        <ion-text color="danger" v-if="error">{{ error }}</ion-text>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonText } from '@ionic/vue';
import { supabase } from '@/api/supabase';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const isRegister = ref(false);
const router = useRouter();

const login = async () => {
  error.value = '';
  loading.value = true;
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;
  if (loginError) {
    error.value = loginError.message;
  } else {
    router.push('/tabs/home');
  }
};

const register = async () => {
  error.value = '';
  loading.value = true;
  const { error: registerError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  loading.value = false;
  if (registerError) {
    error.value = registerError.message;
  } else {
    // Optionally, you can display a message or auto-login
    await login();
  }
};
</script>


<style scoped>
.ion-padding {
  padding: 2rem;
}
</style>
