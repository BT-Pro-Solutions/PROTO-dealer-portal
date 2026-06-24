import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { useVehicleSelection } from '../composables/useVehicleSelection.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'inventory',
          component: () => import('../views/InventoryView.vue'),
        },
        {
          path: 'vehicles/:id',
          name: 'vehicle-detail',
          component: () => import('../views/VehicleDetailView.vue'),
          props: true,
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('../views/MyAccountView.vue'),
        },
        {
          path: 'quote-request',
          name: 'quote-request',
          component: () => import('../views/QuoteRequestView.vue'),
          beforeEnter() {
            const { selectedCount } = useVehicleSelection()
            if (selectedCount.value === 0) {
              return { name: 'inventory' }
            }
          },
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
