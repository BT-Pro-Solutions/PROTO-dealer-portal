import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../composables/useAuth.js'
import { dealerRoutes } from './dealer.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () =>
        isAuthenticated() ? { name: 'dealer-inventory' } : { name: 'dealer-login' },
    },
    ...dealerRoutes,
    // Future portal routes: upfitterRoutes, adminRoutes
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 160,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const authed = isAuthenticated()

  if (to.meta.requiresAuth && !authed) {
    return { name: 'dealer-login' }
  }

  if (to.meta.guestOnly && authed) {
    return { name: 'dealer-inventory' }
  }
})

export default router
