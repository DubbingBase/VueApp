import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteLocationNormalized, NavigationGuardNext, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Import your custom route meta types
import Home from '../views/home.vue';
import TabsPage from '../layouts/base.vue';
import MovieDetails from '../views/movie-details.vue';
import ActorDetails from '../views/actor-details.vue';
import SerieDetails from '../views/serie-details.vue';
import VoiceActorDetails from '../views/voice-actor-details.vue';
import Search from '../views/search.vue';
import SeasonDetails from '@/views/season-details.vue';
import SeasonByEpisode from '@/views/season-by-episodes.vue';
import Login from '../views/login.vue';
import AddVoiceCast from '@/views/admin/AddVoiceCast.vue';
import EditVoiceActor from '@/views/admin/EditVoiceActor.vue';
import Admin from '../views/Admin.vue'

const routes: readonly RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/tabs',
    component: TabsPage,
    children: [
      { path: '/tabs/home', name: 'Home', component: Home },
      { name: 'Search', path: '/tabs/search', component: Search },
      { name: 'Settings', path: '/tabs/settings', component: () => import('../views/settings.vue') },
      { name: 'Profile', path: '/tabs/profile', component: () => import('../views/profile.vue') },
      { name: 'About', path: '/tabs/about', component: () => import('../views/about.vue') },
      { name: 'VoiceActorProfile', path: '/tabs/voice-actor-profile/:id', component: () => import('../views/voice-actor-profile.vue') },
      {
        name: 'Admin',
        path: '/tabs/admin',
        component: Admin,
        meta: { requiresAdmin: true }
      },
      {
        name: 'AddVoiceCast',
        path: '/tabs/admin/add-voice-cast/:id',
        component: AddVoiceCast,
        meta: { requiresAdmin: true }
      },
      {
        name: 'EditVoiceActor',
        path: '/tabs/admin/edit-voice-actor/:id',
        component: EditVoiceActor,
        meta: { requiresAdmin: true }
      },
    ],
  },
  {
    name: 'MovieDetails',
    path: '/movie/:id',
    component: MovieDetails,
  },
  {
    name: 'ActorDetails',
    path: '/actor/:id',
    component: ActorDetails
  },
  {
    name: 'SerieDetails',
    path: '/serie/:id',
    component: SerieDetails,
  },
  {
    name: 'VoiceActorDetails',
    path: '/voice-actor/:id',
    component: VoiceActorDetails
  },
  {
    name: 'SeasonDetails',
    path: '/serie/:id/season/:season',
    component: SeasonDetails
  },
  {
    name: 'SeasonByEpisodes',
    path: '/serie/:id/season/:season/details/:episode',
    component: SeasonByEpisode
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Routes that allow anonymous access (both authenticated and anonymous users can access)
const anonymousAllowedRoutes = ['/login', '/tabs/profile', '/tabs/voice-actor-profile', '/tabs/about'];

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();

  await authStore.initialize();

  // Allow access to routes that permit anonymous users
  if (anonymousAllowedRoutes.includes(to.path) || anonymousAllowedRoutes.some(route => {
    // Handle parameterized routes like /tabs/voice-actor-profile/:id
    if (route.includes(':id')) {
      const baseRoute = route.split('/:id')[0];
      return to.path.startsWith(baseRoute);
    }
    return false;
  })) {
    return next();
  }

  console.log('will redirect  ', authStore.isAuthenticated)
  // Check if user is authenticated for protected routes
  if (!authStore.isAuthenticated) {
    // If not authenticated, redirect to login with the attempted URL as a query parameter
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }

  // Check for admin routes
  if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) {
      // User is not an admin, redirect to home
      return next('/tabs/home');
    }
  }

  // Allow access to the route
  next();
});

// Optional: Handle redirect after successful login
router.afterEach((to) => {
  // Track page views or perform other post-navigation tasks
  console.log('Navigated to:', to.path);
});
