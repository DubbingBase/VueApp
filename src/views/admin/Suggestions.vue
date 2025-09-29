<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Suggestions</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="loading" class="loading-spinner">Loading...</div>
      <div v-if="error" class="error-message">{{ error.message }}</div>
      <div v-if="suggestions && suggestions.length">
        <ion-list>
          <ion-item v-for="suggestion in suggestions" :key="suggestion.id">
            <ion-label>
              <h3>{{ suggestion.content_title }}</h3>
              <p>
                <strong>Original Actor:</strong> {{ suggestion.actor_name }}
              </p>
              <p>
                <strong>Suggested VA:</strong> {{ suggestion.voice_actors?.firstname }} {{ suggestion.voice_actors?.lastname }}
              </p>
            </ion-label>
            <ion-buttons slot="end">
              <ion-button @click="validateSuggestion(suggestion.id)">Validate</ion-button>
              <ion-button @click="rejectSuggestion(suggestion.id)" color="danger">Reject</ion-button>
            </ion-buttons>
          </ion-item>
        </ion-list>
      </div>
      <div v-else-if="!loading" class="no-suggestions">
        No suggestions found.
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton } from '@ionic/vue';
import { supabase } from '@/api/supabase';

interface Suggestion {
  id: number;
  content_title: string;
  actor_name: string;
  voice_actors: {
    firstname: string;
    lastname: string;
  } | null;
}

const loading = ref(false);
const error = ref<Error | null>(null);
const suggestions = ref<Suggestion[] | null>(null);

async function fetchSuggestions() {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: supabaseError } = await supabase
      .from('work')
      .select(`
        id,
        content_title,
        actor_name,
        voice_actors (
          firstname,
          lastname
        )
      `)
      .eq('status', 'suggestion')
      .order('content_title', { ascending: true });

    if (supabaseError) throw supabaseError;
    suggestions.value = data;
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}

async function validateSuggestion(id: number) {
  try {
    const { error: supabaseError } = await supabase
      .from('work')
      .update({ status: 'validated' })
      .eq('id', id);
    if (supabaseError) throw supabaseError;
    await fetchSuggestions(); // Refresh the list
  } catch (err: any) {
    console.error('Error validating suggestion:', err);
  }
}

async function rejectSuggestion(id: number) {
  try {
    const { error: supabaseError } = await supabase
      .from('work')
      .delete()
      .eq('id', id);
    if (supabaseError) throw supabaseError;
    await fetchSuggestions(); // Refresh the list
  } catch (err: any) {
    console.error('Error rejecting suggestion:', err);
  }
}

onMounted(fetchSuggestions);
</script>

<style scoped>
.loading-spinner, .error-message, .no-suggestions {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  text-align: center;
  color: var(--ion-color-medium);
}
ion-label h3 {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1.1rem;
}
ion-label p {
  margin: 4px 0;
}
</style>