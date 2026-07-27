export const adminRoutes = [
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/LoginView.vue'),
    meta: { guestOnly: true, portal: 'admin' },
  },
  {
    path: '/admin',
    component: () => import('../layouts/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, portal: 'admin' },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/TenantsView.vue'),
      },
      {
        path: 'tenants/new',
        name: 'admin-tenant-new',
        component: () => import('../views/admin/CreateTenantView.vue'),
      },
      {
        path: 'tenants/:id',
        name: 'admin-tenant-settings',
        component: () => import('../views/admin/TenantSettingsView.vue'),
        props: true,
      },
      {
        path: 'tenants/:id/branding',
        name: 'admin-tenant-branding',
        component: () => import('../views/admin/TenantBrandingView.vue'),
        props: true,
      },
      {
        path: 'tenants/:id/features',
        name: 'admin-tenant-features',
        component: () => import('../views/admin/TenantFeaturesView.vue'),
        props: true,
      },
      {
        path: 'tenants/:id/provisioning',
        name: 'admin-tenant-provisioning',
        component: () => import('../views/admin/TenantProvisioningView.vue'),
        props: true,
      },
      {
        path: 'tenants/:id/users',
        name: 'admin-tenant-users',
        component: () => import('../views/admin/TenantUsersView.vue'),
        props: true,
      },
      {
        path: 'tenants/:id/users/:userId',
        name: 'admin-tenant-user-detail',
        component: () => import('../views/admin/TenantUserDetailView.vue'),
        props: true,
      },
    ],
  },
]
