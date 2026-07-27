<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import {
  fetchTenantById,
  getActiveTenantId,
  activateTenant,
} from '../../data/admin.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const tenant = ref(null)
const activeTenantId = ref(null)
const activating = ref(false)

onMounted(async () => {
  tenant.value = await fetchTenantById(props.id)
  activeTenantId.value = getActiveTenantId()

  if (!tenant.value) {
    router.replace({ name: 'admin-dashboard' })
  }
})

const isActiveContext = computed(() => tenant.value?.id === activeTenantId.value)

const settingsCards = computed(() => {
  if (!tenant.value) return []
  const id = tenant.value.id
  return [
    {
      title: 'Branding',
      description: 'Logo initials, tagline, and color treatment.',
      route: { name: 'admin-tenant-branding', params: { id } },
      icon: 'mdi:palette-outline',
    },
    {
      title: 'Features',
      description: 'Inventory, documents, holds, approvals, and OEM controls.',
      route: { name: 'admin-tenant-features', params: { id } },
      icon: 'mdi:tune-variant',
    },
    {
      title: 'Provisioning',
      description: 'Checklist for launch readiness.',
      route: { name: 'admin-tenant-provisioning', params: { id } },
      icon: 'mdi:clipboard-check-outline',
    },
    {
      title: 'Users',
      description: 'Tenant users and impersonation.',
      route: { name: 'admin-tenant-users', params: { id } },
      icon: 'mdi:account-group-outline',
    },
  ]
})

async function handleActivate() {
  if (!tenant.value || activating.value) return
  activating.value = true
  try {
    await activateTenant(tenant.value.id)
    activeTenantId.value = tenant.value.id
  } finally {
    activating.value = false
  }
}
</script>

<template>
  <div v-if="tenant" class="tenant-settings page-content page-content--narrow">
    <RouterLink :to="{ name: 'admin-dashboard' }" class="tenant-settings__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to tenants
    </RouterLink>

    <div class="tenant-settings__header reveal reveal--delay-1">
      <div>
        <p class="tenant-settings__eyebrow">Tenant Manager</p>
        <h1 class="tenant-settings__title">{{ tenant.name }}</h1>
        <p class="tenant-settings__subtitle">
          Configure domain, branding, features, provisioning, and tenant users.
        </p>
      </div>
      <button
        v-if="!isActiveContext"
        type="button"
        class="tenant-settings__activate-btn"
        :disabled="activating"
        @click="handleActivate"
      >
        {{ activating ? 'Activating…' : 'Make active' }}
      </button>
      <span v-else class="tenant-settings__active-badge">Active context</span>
    </div>

    <section class="tenant-settings__details reveal reveal--delay-2">
      <dl class="tenant-settings__detail-list">
        <div class="tenant-settings__detail">
          <dt>Slug</dt>
          <dd>{{ tenant.slug }}</dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Subdomain</dt>
          <dd>{{ tenant.subdomain }}</dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Custom domain</dt>
          <dd>
            {{
              tenant.customDomainEnabled
                ? tenant.customDomain || 'Enabled'
                : 'Disabled'
            }}
          </dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Domain status</dt>
          <dd>{{ tenant.domainStatus }}</dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Support email</dt>
          <dd>{{ tenant.supportEmail }}</dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Owner</dt>
          <dd>{{ tenant.ownerName }} · {{ tenant.ownerEmail }}</dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Lifecycle status</dt>
          <dd>{{ tenant.lifecycleStatus }}</dd>
        </div>
        <div class="tenant-settings__detail">
          <dt>Created</dt>
          <dd>{{ tenant.createdAt }}</dd>
        </div>
      </dl>
    </section>

    <div class="tenant-settings__cards reveal reveal--delay-3">
      <RouterLink
        v-for="card in settingsCards"
        :key="card.title"
        :to="card.route"
        class="tenant-settings__card"
      >
        <span class="tenant-settings__card-icon" aria-hidden="true">
          <Icon :icon="card.icon" width="22" height="22" />
        </span>
        <span class="tenant-settings__card-body">
          <span class="tenant-settings__card-title">{{ card.title }}</span>
          <span class="tenant-settings__card-desc">{{ card.description }}</span>
        </span>
        <Icon icon="mdi:chevron-right" width="22" height="22" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.tenant-settings__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.tenant-settings__back:hover {
  text-decoration: underline;
}

.tenant-settings__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin: var(--space-md) 0 var(--space-xl);
}

.tenant-settings__eyebrow {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.tenant-settings__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.tenant-settings__subtitle {
  margin: 0;
  color: var(--color-text-muted);
}

.tenant-settings__activate-btn {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: var(--text-sm);
  transition: background var(--transition-fast);
}

.tenant-settings__activate-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
}

.tenant-settings__active-badge {
  flex-shrink: 0;
  padding: 0.35rem 0.75rem;
  background: var(--color-bg-pill-active);
  color: var(--color-text-inverse);
  border-radius: var(--radius-chip);
  font-size: var(--text-xs);
  font-weight: 700;
}

.tenant-settings__details {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}

.tenant-settings__detail-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin: 0;
}

.tenant-settings__detail {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tenant-settings__detail dt {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.tenant-settings__detail dd {
  margin: 0;
  font-weight: 600;
}

.tenant-settings__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
}

.tenant-settings__card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.tenant-settings__card:hover {
  border-color: rgba(0, 0, 0, 0.16);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tenant-settings__card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-bg-search);
  color: var(--color-text-muted);
}

.tenant-settings__card-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.tenant-settings__card-title {
  font-weight: 700;
  font-size: var(--text-base);
}

.tenant-settings__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .tenant-settings__detail-list,
  .tenant-settings__cards {
    grid-template-columns: 1fr;
  }

  .tenant-settings__header {
    flex-direction: column;
  }
}
</style>
