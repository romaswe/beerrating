import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BeerView from '@/views/BeerView.vue'
import LoginView from '@/views/LoginView.vue' // Import LoginView
import ProfileView from '@/views/ProfileView.vue'
import TastingView from '@/views/TastingView.vue'
import TastingBeerView from '@/views/TastingBeerView.vue'
import { Myconsts } from '@/const'
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
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/tasting',
      name: 'tasting',
      component: TastingView
    },
    {
      path: '/beers-tasting',
      name: 'beers-tasting',
      component: TastingBeerView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView // Add Login route
    }
  ]
})

router.beforeEach(async (to, from) => {
  const validLogin = (localStorage.getItem(Myconsts.tokenName) && localStorage.getItem(Myconsts.roleName) && localStorage.getItem(Myconsts.userName))
  if (!validLogin && blockRoute(to.name?.toString() || '')) {
    // redirect the user to the login page
    return { name: 'login' }
  }
})

function blockRoute(routeName: string): boolean {
  switch (routeName) {
    case 'login':
    case 'home':
    case 'beers':
    case 'beer-list':
      return false

    default:
      return true
  }
}

export default router
