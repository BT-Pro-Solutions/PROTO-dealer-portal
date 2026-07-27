<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  fetchTenants,
  getActiveTenantId,
  activateTenant,
} from '../../data/admin.js'

const tenants = ref([])
const activeTenantId = ref(null)
const searchQuery = ref('')
const activatingId = ref(null)

onMounted(async () => {
  tenants.value = await fetchTenants()
  activeTenantId.value = getActiveTenantId()
})

const activeTenant = computed(() =>
  tenants.value.find((t) => t.id === activeTenantId.value) ?? tenants.value[0] ?? null,
)

const activeCount = computed(() =>
  tenants.value.filter((t) => t.lifecycleStatus === 'Active').length,
)

const filteredTenants = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return tenants.value

  return tenants.value.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      t.subdomain.toLowerCase().includes(q) ||
      t.ownerName.toLowerCase().includes(q),
  )
})

function statusClass(status) {
  switch (status) {
    case 'Active':
      return 'tenants__status--active'
    case 'Provisioning':
      return 'tenants__status--provisioning'
    case 'Suspended':
      return 'tenants__status--suspended'
    default:
      return 'tenants__status--draft'
  }
}

async function handleActivate(tenantId) {
  if (activatingId.value) return
  activatingId.value = tenantId
  try {
    await activateTenant(tenantId)
    activeTenantId.value = tenantId
  } finally {
    activatingId.value = null
  }
}
</script>

<template>
  <div class="tenants page-content page-content--narrow">
    <div class="tenants__header reveal">
      <div>
        <p class="tenants__eyebrow">Tenant Manager</p>
        <h1 class="tenants__title">Upfitter tenants</h1>
        <p class="tenants__subtitle reveal reveal--delay-1">
          Create, search, activate, and configure upfitter tenant contexts.
        </p>
      </div>
      <RouterLink :to="{ name: 'admin-tenant-new' }" class="tenants__add-btn reveal reveal--delay-1">
        <Icon icon="mdi:domain-plus" width="18" height="18" aria-hidden="true" />
        Create tenant
      </RouterLink>
    </div>

    <div class="tenants__metrics reveal reveal--delay-2">
      <div class="tenants__metric">
        <span class="tenants__metric-value">{{ tenants.length }}</span>
        <span class="tenants__metric-label">Tenants</span>
        <span class="tenants__metric-hint">All tenants</span>
      </div>
      <div class="tenants__metric">
        <span class="tenants__metric-value tenants__metric-value--text">
          {{ activeTenant?.name ?? '—' }}
        </span>
        <span class="tenants__metric-label">Active context</span>
        <span class="tenants__metric-hint">{{ activeTenant?.subdomain ?? '—' }}</span>
      </div>
      <div class="tenants__metric">
        <span class="tenants__metric-value">{{ activeCount }}</span>
        <span class="tenants__metric-label">Active tenants</span>
        <span class="tenants__metric-hint">Lifecycle status</span>
      </div>
    </div>

    <div class="tenants__search reveal reveal--delay-3">
      <Icon icon="mdi:magnify" width="20" height="20" aria-hidden="true" class="tenants__search-icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="tenants__search-input"
        placeholder="Search tenants by name, subdomain, or owner"
      />
    </div>

    <div v-if="filteredTenants.length" class="tenants__table-wrap reveal reveal--delay-4">
      <table class="tenants__table">
        <thead>
          <tr>
            <th scope="col">Tenant</th>
            <th scope="col">Status</th>
            <th scope="col">Subdomain</th>
            <th scope="col">Owner</th>
            <th scope="col">Context</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in filteredTenants" :key="tenant.id">
            <td>
              <strong class="tenants__name">{{ tenant.name }}</strong>
              <span class="tenants__slug">{{ tenant.slug }}</span>
            </td>
            <td>
              <span class="tenants__status" :class="statusClass(tenant.lifecycleStatus)">
                {{ tenant.lifecycleStatus }}
              </span>
            </td>
            <td>{{ tenant.subdomain }}</td>
            <td>{{ tenant.ownerName }}</td>
            <td>
              <span
                v-if="tenant.id === activeTenantId"
                class="tenants__context tenants__context--active"
              >
                Active context
              </span>
              <button
                v-else
                type="button"
                class="tenants__activate-btn"
                :disabled="activatingId === tenant.id"
                @click="handleActivate(tenant.id)"
              >
                {{ activatingId === tenant.id ? 'Activating…' : 'Activate' }}
              </button>
            </td>
            <td>
              <RouterLink
                :to="{ name: 'admin-tenant-settings', params: { id: tenant.id } }"
                class="tenants__settings-btn"
              >
                Settings
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="tenants__empty reveal reveal--delay-4">
      {{ searchQuery.trim() ? 'No tenants match your search.' : 'No upfitter tenants found.' }}
    </p>
  </div>
</template>

<style scoped>
.tenants__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.tenants__eyebrow {
  margin: var(--space-md) 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.tenants__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.tenants__subtitle {
  margin: 0;
  color: var(--color-text-muted);
}

.tenants__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: 50px;
  font-weight: 700;
  font-size: var(--text-sm);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.tenants__add-btn:hover {
  opacity: 0.85;
}

.tenants__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.tenants__metric {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: var(--space-lg);
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-md);
}

.tenants__metric-value {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.5rem;
  line-height: 1.2;
}

.tenants__metric-value--text {
  font-size: 1.1rem;
}

.tenants__metric-label {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.tenants__metric-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.tenants__search {
  position: relative;
  margin-bottom: var(--space-xl);
}

.tenants__search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.tenants__search-input {
  width: 100%;
  height: 48px;
  padding: 0 1rem 0 2.75rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-pill);
  background: var(--color-bg-search);
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.tenants__search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.tenants__table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  background: var(--color-bg-search);
}

.tenants__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.tenants__table th {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.tenants__table td {
  padding: var(--space-md) var(--space-lg);
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tenants__table tbody tr:last-child td {
  border-bottom: none;
}

.tenants__name {
  display: block;
  font-size: var(--text-base);
}

.tenants__slug {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.tenants__status {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-chip);
  font-size: var(--text-xs);
  font-weight: 700;
}

.tenants__status--active {
  background: var(--color-available);
  color: var(--color-available-text);
}

.tenants__status--provisioning {
  background: var(--color-pending);
  color: var(--color-pending-text);
}

.tenants__status--draft {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text-muted);
}

.tenants__status--suspended {
  background: var(--color-on-hold);
  color: #8b0000;
}

.tenants__context {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-chip);
}

.tenants__context--active {
  background: var(--color-bg-pill-active);
  color: var(--color-text-inverse);
}

.tenants__activate-btn,
.tenants__settings-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 700;
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.tenants__activate-btn {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: var(--color-text);
}

.tenants__activate-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
}

.tenants__activate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tenants__settings-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.tenants__settings-btn:hover {
  opacity: 0.85;
}

.tenants__empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}

@media (max-width: 768px) {
  .tenants__metrics {
    grid-template-columns: 1fr;
  }

  .tenants__header {
    flex-direction: column;
  }
}
</style>
