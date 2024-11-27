import { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from '@ionic/vue-router';
import Home from '../views/home.vue'
import TabsPage from '../layouts/base.vue'
import MovieDetails from '../views/movie-details.vue'
import ActorDetails from '../views/actor-details.vue'
import SerieDetails from '../views/serie-details.vue'
import VoiceActorDetails from '../views/voice-actor-details.vue'
import Search from '../views/search.vue'

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes: readonly RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/tabs',
    component: TabsPage,
    children: [
      { path: '/tabs/home', name: 'Home', component: Home },
      { name: 'Search', path: '/tabs/search', component: Search },
      { name: 'Settings', path: '/tabs/settings', component: Search },
    ],
  },
  { name: 'MovieDetails', path: '/movie/:id', component: MovieDetails },
  { name: 'ActorDetails', path: '/actor/:id', component: ActorDetails },
  { name: 'SerieDetails', path: '/serie/:id', component: SerieDetails },
  { name: 'VoiceActorDetails', path: '/voice-actor/:id', component: VoiceActorDetails },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
export const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
})