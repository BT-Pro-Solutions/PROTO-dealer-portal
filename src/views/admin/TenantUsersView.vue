<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { fetchTenantById, fetchTenantUsers } from '../../data/admin.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const tenant = ref(null)
const users = ref([])

onMounted(async () => {
  tenant.value = await fetchTenantById(props.id)
  if (!tenant.value) {
    router.replace({ name: 'admin-dashboard' })
    return
  }
  users.value = await fetchTenantUsers(props.id)
})

function statusClass(status) {
  switch (status) {
    case 'Active':
      return 'tenant-users__status--active'
    case 'Invited':
      return 'tenant-users__status--invited'
    default:
      return 'tenant-users__status--inactive'
  }
}
</script>

<template>
  <div v-if="tenant" class="tenant-users page-content page-content--narrow">
    <RouterLink
      :to="{ name: 'admin-tenant-settings', params: { id: tenant.id } }"
      class="tenant-users__back reveal"
    >
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to settings
    </RouterLink>

    <p class="tenant-users__eyebrow reveal reveal--delay-1">Tenant Manager</p>
    <h1 class="tenant-users__title reveal reveal--delay-1">Tenant users</h1>
    <p class="tenant-users__subtitle reveal reveal--delay-1">
      Manage upfitter admins, support users, and linked dealer users for {{ tenant.name }}.
    </p>

    <div v-if="users.length" class="tenant-users__table-wrap reveal reveal--delay-2">
      <table class="tenant-users__table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Invite</th>
            <th scope="col">Last login</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <strong>{{ user.name }}</strong>
              <span class="tenant-users__email">{{ user.email }}</span>
            </td>
            <td>{{ user.role }}</td>
            <td>
              <span class="tenant-users__status" :class="statusClass(user.status)">
                {{ user.status }}
              </span>
            </td>
            <td>{{ user.inviteStatus }}</td>
            <td>{{ user.lastLogin }}</td>
            <td>
              <RouterLink
                :to="{ name: 'admin-tenant-user-detail', params: { id: tenant.id, userId: user.id } }"
                class="tenant-users__action"
              >
                Open
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="tenant-users__empty reveal reveal--delay-2">
      No tenant users found for this upfitter.
    </p>
  </div>
</template>

<style scoped>
.tenant-users__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.tenant-users__back:hover {
  text-decoration: underline;
}

.tenant-users__eyebrow {
  margin: var(--space-md) 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.tenant-users__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.tenant-users__subtitle {
  margin: 0 0 var(--space-xl);
  color: var(--color-text-muted);
}

.tenant-users__table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  background: var(--color-bg-search);
  margin-bottom: var(--space-2xl);
}

.tenant-users__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.tenant-users__table th {
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

.tenant-users__table td {
  padding: var(--space-md) var(--space-lg);
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tenant-users__email {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.tenant-users__status {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-chip);
  font-size: var(--text-xs);
  font-weight: 700;
}

.tenant-users__status--active {
  background: var(--color-available);
  color: var(--color-available-text);
}

.tenant-users__status--invited {
  background: var(--color-pending);
  color: var(--color-pending-text);
}

.tenant-users__status--inactive {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text-muted);
}

.tenant-users__action {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 700;
  text-decoration: none;
}

.tenant-users__action:hover {
  opacity: 0.85;
}

.tenant-users__empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}
</style>
