import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BeerView from '@/views/BeerView.vue'
import LoginView from '@/views/LoginView.vue' // Import LoginView

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/beer-list',
      name: 'beer-list',
      component: () => import('../views/BeerListView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue')
    },
    {
      path: '/beers',
      name: 'beers',
      component: BeerView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView // Add Login route
    }
  ]
})

export default router
