<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, onIonViewDidEnter } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import { useDeepLinkHandler } from '@/utils/deepLinks';
import { onMounted } from 'vue';
import { App } from '@capacitor/app';

const authStore = useAuthStore();
const { handleDeepLink } = useDeepLinkHandler();

authStore.initialize();

// Handle deep links when app is in the background
onMounted(async () => {
  console.log(window.Capacitor);
  // Check for initial URL if the app was opened with a deep link
  if (window.Capacitor) {
    const { url } = await App.getLaunchUrl();
    if (url) {
      handleDeepLink(url);
    }

    // Listen for app URL events (when app is in background)
    App.addListener('appUrlOpen', (event: { url: string }) => {
      handleDeepLink(event.url);
    });
  } else {
    // For web fallback
    const url = new URL(window.location.href);
    if (url.protocol === 'dubbingbase:') {
      handleDeepLink(url.href);
    }
  }
});
</script>

<style scoped></style>
