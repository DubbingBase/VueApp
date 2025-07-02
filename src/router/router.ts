import { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { supabase } from '@/api/supabase';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

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
  { 
    name: 'Admin', 
    path: '/admin', 
    component: Admin, 
    meta: { requiresAdmin: true } 
  },
  { 
    name: 'AddVoiceCast', 
    path: '/admin/add-voice-cast/:id', 
    component: AddVoiceCast, 
    meta: { requiresAdmin: true } 
  },
  { 
    name: 'EditVoiceActor', 
    path: '/admin/edit-voice-actor/:id', 
    component: EditVoiceActor, 
    meta: { requiresAdmin: true } 
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.path === '/login') {
    return next();
  }
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    
    if (!user) {
      return next('/login');
    }
    
    if (to.meta.requiresAdmin) {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      const isAdmin = userData?.user?.app_metadata?.role === 'admin' || 
                     userData?.user?.user_metadata?.role === 'admin';
      
      if (isAdmin) {
        next();
      } else {
        next('/tabs/home');
      }
    } else {
      next();
    }
  } catch (error) {
    console.error('Error in route guard:', error);
    next('/login');
  }
});