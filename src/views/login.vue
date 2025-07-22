<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ isRegister ? 'Créer un compte' : 'Connexion' }}</ion-title>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" />
        </ion-buttons>
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
import { ref, onMounted } from 'vue';
import { useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonText, IonButtons, IonBackButton } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const isRegister = ref(false);

const authStore = useAuthStore();
const ionRouter = useIonRouter();
const route = useRoute();

// Handle redirect after successful login
const handleSuccessfulAuth = () => {
  const redirectPath = Array.isArray(route.query.redirect) 
    ? route.query.redirect[0] 
    : route.query.redirect || '/tabs/home';
  
  // Ensure we don't redirect back to login
  if (redirectPath === '/login') {
    ionRouter.push('/tabs/home');
  } else {
    ionRouter.push(redirectPath);
  }
};

const login = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    await authStore.signIn(email.value, password.value);
    handleSuccessfulAuth();
  } catch (err: any) {
    error.value = err.message || 'Échec de la connexion';
    console.error('Login error:', err);
  } finally {
    loading.value = false;
  }
};

const register = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    const { error: registerError } = await authStore.signUp(email.value, password.value);
    
    if (registerError) throw registerError;
    
    // Show success message and switch to login
    error.value = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
    isRegister.value = false;
  } catch (err: any) {
    error.value = err.message || "Échec de la création du compte";
    console.error('Registration error:', err);
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
.ion-padding {
  padding: 2rem;
}
</style>
