import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Base from '../layouts/base.vue'
import MovieDetails from '../views/movie-details.vue'
import ActorDetails from '../views/actor-details.vue'
import SerieDetails from '../views/serie-details.vue'
import Search from '../views/search.vue'

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes: readonly RouteRecordRaw[] = [
  {
    path: '/',
    component: Base,
    children: [
      { path: '', component: Home },
      { name: 'MovieDetails', path: '/movie/:id', component: MovieDetails },
      { name: 'ActorDetails', path: '/actor/:id', component: ActorDetails },
      { name: 'SerieDetails', path: '/serie/:id', component: SerieDetails },
      { name: 'Search', path: '/search', component: Search },
    ]
  },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
export const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
})