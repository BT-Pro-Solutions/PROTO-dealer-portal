import { useVehicleSelection } from '../composables/useVehicleSelection.js'

export const dealerRoutes = [
  {
    path: '/dealer/login',
    name: 'dealer-login',
    component: () => import('../views/dealer/LoginView.vue'),
    meta: { guestOnly: true, portal: 'dealer' },
  },
  {
    path: '/dealer',
    component: () => import('../layouts/dealer/DealerLayout.vue'),
    meta: { requiresAuth: true, portal: 'dealer' },
    children: [
      {
        path: '',
        redirect: { name: 'dealer-inventory' },
      },
      {
        path: 'inventory/search/:slug',
        name: 'dealer-inventory-search',
        component: () => import('../views/dealer/InventoryView.vue'),
        props: true,
      },
      {
        path: 'inventory',
        name: 'dealer-inventory',
        component: () => import('../views/dealer/InventoryView.vue'),
      },
      {
        path: 'vehicles/:id',
        name: 'dealer-vehicle-detail',
        component: () => import('../views/dealer/VehicleDetailView.vue'),
        props: true,
      },
      {
        path: 'account',
        name: 'dealer-account',
        component: () => import('../views/dealer/MyAccountView.vue'),
      },
      {
        path: 'manage-team',
        name: 'dealer-manage-team',
        component: () => import('../views/dealer/ManageTeamView.vue'),
      },
      {
        path: 'quotes',
        name: 'dealer-my-quotes',
        component: () => import('../views/dealer/MyQuotesView.vue'),
      },
      {
        path: 'quotes/:id',
        name: 'dealer-quote-detail',
        component: () => import('../views/dealer/QuoteDetailView.vue'),
        props: true,
      },
      {
        path: 'quote-request',
        name: 'dealer-quote-request',
        component: () => import('../views/dealer/QuoteRequestView.vue'),
        beforeEnter() {
          const { selectedCount } = useVehicleSelection()
          if (selectedCount.value === 0) {
            return { name: 'dealer-inventory' }
          }
        },
      },
    ],
  },
]
