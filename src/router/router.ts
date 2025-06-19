import { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from '@ionic/vue-router';
import Home from '../views/home.vue'
import TabsPage from '../layouts/base.vue'
import MovieDetails from '../views/movie-details.vue'
import ActorDetails from '../views/actor-details.vue'
import SerieDetails from '../views/serie-details.vue'
import VoiceActorDetails from '../views/voice-actor-details.vue'
import Search from '../views/search.vue'
import SeasonDetails from '@/views/season-details.vue';
import SeasonByEpisode from '@/views/season-by-episodes.vue';
import Login from '../views/login.vue';
import AddVoiceCast from '@/views/admin/AddVoiceCast.vue';
import EditVoiceActor from '@/views/admin/EditVoiceActor.vue';

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
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
    ],
  },
  { name: 'MovieDetails', path: '/movie/:id', component: MovieDetails },
  { name: 'ActorDetails', path: '/actor/:id', component: ActorDetails },
  { name: 'SerieDetails', path: '/serie/:id', component: SerieDetails },
  { name: 'VoiceActorDetails', path: '/voice-actor/:id', component: VoiceActorDetails },
  { name: 'SeasonDetails', path: '/serie/:id/season/:season', component: SeasonDetails },
  { name: 'SeasonByEpisodes', path: '/serie/:id/season/:season/details/:episode', component: SeasonByEpisode },
  { name: 'Admin', path: '/admin', component: Admin, meta: { requiresAdmin: true } },
  { name: 'AddVoiceCast', path: '/admin/add-voice-cast/:id', component: AddVoiceCast, meta: { requiresAdmin: true } },
  { name: 'EditVoiceActor', path: '/admin/edit-voice-actor/:id', component: EditVoiceActor, meta: { requiresAdmin: true } },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
import { supabase } from '@/api/supabase';
export const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
})

// Admin route guard
router.beforeEach(async (to, from, next) => {
  // Allow access to login page
  if (to.path === '/login') {
    return next();
  }
  // Check authentication
  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : supabase.auth.user();
  console.log(user);
  if (!user) {
    return next('/login');
  }
  // Admin route guard
  if (to.meta.requiresAdmin) {
    if (user.app_metadata?.role === 'admin' || user.role === 'admin') {
      next();
    } else {
      next('/tabs/home');
    }
  } else {
    next();
  }
});