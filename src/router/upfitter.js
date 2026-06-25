export const upfitterRoutes = [
  {
    path: '/upfitter/login',
    name: 'upfitter-login',
    component: () => import('../views/upfitter/LoginView.vue'),
    meta: { guestOnly: true, portal: 'upfitter' },
  },
  {
    path: '/upfitter',
    component: () => import('../layouts/upfitter/UpfitterLayout.vue'),
    meta: { requiresAuth: true, portal: 'upfitter' },
    children: [
      {
        path: '',
        name: 'upfitter-dashboard',
        component: () => import('../views/upfitter/DashboardView.vue'),
      },
      {
        path: 'quotes',
        name: 'upfitter-quotes',
        component: () => import('../views/upfitter/PendingQuotesView.vue'),
      },
      {
        path: 'quotes/:id',
        name: 'upfitter-quote-detail',
        component: () => import('../views/upfitter/QuoteDetailView.vue'),
        props: true,
      },
      {
        path: 'dealerships',
        name: 'upfitter-dealerships',
        component: () => import('../views/upfitter/DealershipsView.vue'),
      },
      {
        path: 'dealerships/new',
        name: 'upfitter-dealership-new',
        component: () => import('../views/upfitter/AddDealershipView.vue'),
      },
      {
        path: 'dealerships/:id',
        name: 'upfitter-dealership-detail',
        component: () => import('../views/upfitter/DealershipDetailView.vue'),
        props: true,
      },
      {
        path: 'account',
        name: 'upfitter-account',
        component: () => import('../views/upfitter/MyAccountView.vue'),
      },
    ],
  },
]
