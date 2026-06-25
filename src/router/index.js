import { createRouter, createWebHistory } from 'vue-router'
import {
  isAuthenticated,
  getActivePortal,
  portalHomeRoute,
  portalLoginRoute,
} from '../composables/useAuth.js'
import { dealerRoutes } from './dealer.js'
import { upfitterRoutes } from './upfitter.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const portal = getActivePortal()
        if (portal) return portalHomeRoute(portal)
        return { name: 'dealer-login' }
      },
    },
    ...dealerRoutes,
    ...upfitterRoutes,
    // Future portal routes: adminRoutes
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
  const portal = to.meta.portal ?? getActivePortal()
  const authed = portal ? isAuthenticated(portal) : isAuthenticated()

  if (to.meta.requiresAuth && portal && !isAuthenticated(portal)) {
    return portalLoginRoute(portal)
  }

  if (to.meta.guestOnly && portal && isAuthenticated(portal)) {
    return portalHomeRoute(portal)
  }

  if (to.meta.requiresAuth && !portal && !authed) {
    return { name: 'dealer-login' }
  }
})

export default router
