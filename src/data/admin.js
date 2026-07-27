/**
 * Platform admin session, upfitter tenants, and tenant users.
 * Replace fetch functions with real API calls when backend is ready.
 */

const ACTIVE_TENANT_KEY = 'admin-active-tenant-id'

const defaultFeatures = {
  inventorySearch: true,
  vehicleDetail: true,
  documents: true,
  holdVisibility: true,
  oemPermissions: true,
  approvals: true,
  branding: true,
  domain: false,
}

const provisioningStepTemplate = [
  { id: 'tenant-created', label: 'Tenant record created', complete: true },
  { id: 'admin-user', label: 'Initial Upfitter Admin created', complete: true },
  { id: 'branding', label: 'Branding reviewed', complete: false },
  { id: 'dealer-data', label: 'Dealer data loaded', complete: true },
  { id: 'inventory', label: 'Pool inventory connected', complete: true },
  { id: 'approval-flow', label: 'Approval workflow tested', complete: false },
]

export const adminSession = {
  userName: 'Alex Morgan',
  email: 'admin@treqso.example',
  companyName: 'TREQSO',
  role: 'Platform Admin',
}

export const tenants = [
  {
    id: 'tenant-zoresco',
    name: 'Zoresco',
    slug: 'zoresco',
    subdomain: 'zoresco',
    lifecycleStatus: 'Active',
    customDomainEnabled: false,
    customDomain: '',
    domainStatus: 'Not configured',
    supportEmail: 'support@zoresco.example',
    ownerName: 'Pat Richardson',
    ownerEmail: 'pat@zoresco.example',
    features: { ...defaultFeatures },
    branding: { initials: 'ZO', tagline: 'Dealer equipment portal', primaryColor: '#c41230' },
    provisioningSteps: provisioningStepTemplate.map((step) => ({ ...step, complete: true })),
    createdAt: '2024-01-15',
  },
  {
    id: 'tenant-dejana',
    name: 'Dejana Truck Bodies',
    slug: 'dejana-truck-bodies',
    subdomain: 'dejana',
    lifecycleStatus: 'Active',
    customDomainEnabled: false,
    customDomain: '',
    domainStatus: 'Not configured',
    supportEmail: 'portal@dejana.example',
    ownerName: 'Chris Dejana',
    ownerEmail: 'chris@dejana.example',
    features: { ...defaultFeatures },
    branding: { initials: 'DJ', tagline: 'Commercial truck bodies & equipment', primaryColor: '#003087' },
    provisioningSteps: provisioningStepTemplate.map((step) => ({ ...step, complete: true })),
    createdAt: '2024-06-02',
  },
  {
    id: 'tenant-scelzi',
    name: 'Scelzi Enterprises',
    slug: 'scelzi-enterprises',
    subdomain: 'scelzi',
    lifecycleStatus: 'Active',
    customDomainEnabled: true,
    customDomain: 'dealers.scelzi.example',
    domainStatus: 'Verified',
    supportEmail: 'support@scelzi.example',
    ownerName: 'Mike Scelzi',
    ownerEmail: 'mike@scelzi.example',
    features: { ...defaultFeatures, domain: true },
    branding: { initials: 'SE', tagline: 'Built for the road ahead', primaryColor: '#b91c1c' },
    provisioningSteps: provisioningStepTemplate.map((step) => ({ ...step, complete: true })),
    createdAt: '2024-09-18',
  },
  {
    id: 'tenant-cascade',
    name: 'Cascade Commercial Bodies',
    slug: 'cascade-commercial-bodies',
    subdomain: 'cascade',
    lifecycleStatus: 'Provisioning',
    customDomainEnabled: true,
    customDomain: 'dealers.cascadebodies.example',
    domainStatus: 'Pending verification',
    supportEmail: 'portal@cascadebodies.example',
    ownerName: 'Priya Shah',
    ownerEmail: 'priya@cascadebodies.example',
    features: { ...defaultFeatures, documents: false, holdVisibility: false, domain: true },
    branding: { initials: 'CC', tagline: 'Bodies, boxes, and dealer support', primaryColor: '#3300ab' },
    provisioningSteps: provisioningStepTemplate.map((step) => ({
      ...step,
      complete: step.id === 'tenant-created' || step.id === 'admin-user',
    })),
    createdAt: '2026-04-18',
  },
  {
    id: 'tenant-inland',
    name: 'Inland Truck Equipment',
    slug: 'inland-truck-equipment',
    subdomain: 'inland',
    lifecycleStatus: 'Draft',
    customDomainEnabled: false,
    customDomain: '',
    domainStatus: 'Not configured',
    supportEmail: 'help@inlandtruck.example',
    ownerName: 'Alex Rivera',
    ownerEmail: 'alex@inlandtruck.example',
    features: { ...defaultFeatures, vehicleDetail: false, documents: false },
    branding: { initials: 'IT', tagline: 'Setup in progress', primaryColor: '#0011ab' },
    provisioningSteps: provisioningStepTemplate.map((step) => ({
      ...step,
      complete: step.id === 'tenant-created',
    })),
    createdAt: '2026-04-29',
  },
]

export const tenantUsers = [
  {
    id: 'tu-zoresco-admin',
    tenantId: 'tenant-zoresco',
    name: 'Pat Richardson',
    email: 'pat@zoresco.example',
    role: 'Upfitter Admin',
    status: 'Active',
    inviteStatus: 'Accepted',
    lastLogin: '2026-05-05',
    linkedContactId: '',
  },
  {
    id: 'tu-dejana-admin',
    tenantId: 'tenant-dejana',
    name: 'Chris Dejana',
    email: 'chris@dejana.example',
    role: 'Upfitter Admin',
    status: 'Active',
    inviteStatus: 'Accepted',
    lastLogin: '2026-05-04',
    linkedContactId: '',
  },
  {
    id: 'tu-scelzi-admin',
    tenantId: 'tenant-scelzi',
    name: 'Mike Scelzi',
    email: 'mike@scelzi.example',
    role: 'Upfitter Admin',
    status: 'Active',
    inviteStatus: 'Accepted',
    lastLogin: '2026-05-03',
    linkedContactId: '',
  },
  {
    id: 'tu-cascade-admin',
    tenantId: 'tenant-cascade',
    name: 'Priya Shah',
    email: 'priya@cascadebodies.example',
    role: 'Upfitter Admin',
    status: 'Invited',
    inviteStatus: 'Sent',
    lastLogin: 'Never',
    linkedContactId: '',
  },
]

export const featureLabels = {
  inventorySearch: 'Inventory search',
  vehicleDetail: 'Vehicle detail',
  documents: 'Vehicle documents',
  holdVisibility: 'Hold visibility',
  oemPermissions: 'OEM permissions',
  approvals: 'Approval workflow',
  branding: 'Custom branding',
  domain: 'Custom domain',
}

export function getActiveTenantId() {
  const stored = sessionStorage.getItem(ACTIVE_TENANT_KEY)
  if (stored) return stored
  const defaultId = tenants[0]?.id ?? null
  if (defaultId) setActiveTenantId(defaultId)
  return defaultId
}

export function setActiveTenantId(id) {
  sessionStorage.setItem(ACTIVE_TENANT_KEY, id)
}

export async function fetchAdminSession() {
  return { ...adminSession }
}

export async function fetchTenants() {
  return tenants.map((t) => ({ ...t }))
}

export async function fetchTenantById(id) {
  const tenant = tenants.find((t) => t.id === id)
  return tenant ? { ...tenant, features: { ...tenant.features }, branding: { ...tenant.branding }, provisioningSteps: tenant.provisioningSteps.map((s) => ({ ...s })) } : null
}

export async function fetchTenantUsers(tenantId) {
  return tenantUsers.filter((u) => u.tenantId === tenantId).map((u) => ({ ...u }))
}

export async function fetchTenantUserById(userId) {
  const user = tenantUsers.find((u) => u.id === userId)
  return user ? { ...user } : null
}

export async function activateTenant(id) {
  const tenant = tenants.find((t) => t.id === id)
  if (!tenant) throw new Error('Tenant not found')
  setActiveTenantId(id)
  return { ...tenant }
}

export async function createTenant(payload) {
  const slug = payload.slug || payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const tenant = {
    id: `tenant-${slug}`,
    name: payload.name.trim(),
    slug,
    subdomain: payload.subdomain.trim() || slug.split('-')[0],
    lifecycleStatus: payload.lifecycleStatus || 'Draft',
    customDomainEnabled: false,
    customDomain: '',
    domainStatus: 'Not configured',
    supportEmail: payload.supportEmail.trim(),
    ownerName: payload.ownerName.trim(),
    ownerEmail: payload.ownerEmail.trim(),
    features: { ...defaultFeatures },
    branding: { initials: payload.name.trim().slice(0, 2).toUpperCase(), tagline: 'Dealer equipment portal', primaryColor: '#0011ab' },
    provisioningSteps: provisioningStepTemplate.map((step) => ({ ...step, complete: step.id === 'tenant-created' })),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  tenants.push(tenant)
  tenantUsers.push({
    id: `tu-${slug}-admin`,
    tenantId: tenant.id,
    name: tenant.ownerName,
    email: tenant.ownerEmail,
    role: 'Upfitter Admin',
    status: 'Invited',
    inviteStatus: 'Sent',
    lastLogin: 'Never',
    linkedContactId: '',
  })
  return { ...tenant }
}

export async function updateTenant(id, updates) {
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Tenant not found')
  tenants[idx] = { ...tenants[idx], ...updates }
  return { ...tenants[idx] }
}

export async function updateTenantBranding(id, branding) {
  const tenant = tenants.find((t) => t.id === id)
  if (!tenant) throw new Error('Tenant not found')
  tenant.branding = { ...tenant.branding, ...branding }
  tenant.features.branding = true
  return { ...tenant }
}

export async function updateTenantFeatures(id, features) {
  const tenant = tenants.find((t) => t.id === id)
  if (!tenant) throw new Error('Tenant not found')
  tenant.features = { ...tenant.features, ...features }
  return { ...tenant }
}

export async function updateTenantProvisioning(id, steps) {
  const tenant = tenants.find((t) => t.id === id)
  if (!tenant) throw new Error('Tenant not found')
  tenant.provisioningSteps = steps
  return { ...tenant }
}

export async function updateTenantUser(userId, updates) {
  const idx = tenantUsers.findIndex((u) => u.id === userId)
  if (idx === -1) throw new Error('User not found')
  tenantUsers[idx] = { ...tenantUsers[idx], ...updates }
  return { ...tenantUsers[idx] }
}
