<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { fetchTenantUserById, updateTenantUser } from '../../data/admin.js'

const props = defineProps({
  id: { type: String, required: true },
  userId: { type: String, required: true },
})

const router = useRouter()
const user = ref(null)
const saving = ref(false)
const saveMessage = ref(null)

const roleOptions = ['Upfitter Admin', 'Platform Support', 'Dealer User']
const statusOptions = ['Active', 'Inactive', 'Invited']
const inviteOptions = ['Accepted', 'Sent', 'None']

const form = ref({
  name: '',
  email: '',
  role: 'Upfitter Admin',
  status: 'Active',
  inviteStatus: 'Accepted',
  linkedContactId: '',
})

onMounted(async () => {
  user.value = await fetchTenantUserById(props.userId)
  if (!user.value || user.value.tenantId !== props.id) {
    router.replace({ name: 'admin-tenant-users', params: { id: props.id } })
    return
  }
  form.value = {
    name: user.value.name,
    email: user.value.email,
    role: user.value.role,
    status: user.value.status,
    inviteStatus: user.value.inviteStatus,
    linkedContactId: user.value.linkedContactId,
  }
})

async function handleSubmit() {
  if (!user.value || saving.value) return
  saving.value = true
  saveMessage.value = null
  try {
    user.value = await updateTenantUser(user.value.id, form.value)
    saveMessage.value = 'User saved.'
  } catch {
    saveMessage.value = 'Unable to save user.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="user" class="tenant-form page-content page-content--narrow">
    <RouterLink
      :to="{ name: 'admin-tenant-users', params: { id } }"
      class="tenant-form__back reveal"
    >
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to users
    </RouterLink>

    <p class="tenant-form__eyebrow reveal reveal--delay-1">Tenant users</p>
    <h1 class="tenant-form__title reveal reveal--delay-1">{{ user.name }}</h1>
    <p class="tenant-form__subtitle reveal reveal--delay-1">
      Edit tenant user access and impersonation entry points.
    </p>

    <form class="tenant-form__panel reveal reveal--delay-2" @submit.prevent="handleSubmit">
      <p v-if="saveMessage" class="tenant-form__message" role="status">{{ saveMessage }}</p>

      <div class="tenant-form__fields tenant-form__fields--two">
        <label class="tenant-form__label">
          Name
          <input v-model="form.name" type="text" class="tenant-form__input" />
        </label>
        <label class="tenant-form__label">
          Email
          <input v-model="form.email" type="email" class="tenant-form__input" />
        </label>
        <label class="tenant-form__label">
          Role
          <select v-model="form.role" class="tenant-form__input">
            <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
          </select>
        </label>
        <label class="tenant-form__label">
          Status
          <select v-model="form.status" class="tenant-form__input">
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </label>
        <label class="tenant-form__label">
          Invite status
          <select v-model="form.inviteStatus" class="tenant-form__input">
            <option v-for="status in inviteOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </label>
        <label class="tenant-form__label">
          Linked dealer contact ID
          <input v-model="form.linkedContactId" type="text" class="tenant-form__input" />
        </label>
      </div>

      <div class="tenant-form__actions">
        <button type="submit" class="tenant-form__submit" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save user' }}
        </button>
        <button type="button" class="tenant-form__secondary" disabled title="Impersonation coming soon">
          Impersonate
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.tenant-form__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.tenant-form__back:hover {
  text-decoration: underline;
}

.tenant-form__eyebrow {
  margin: var(--space-md) 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.tenant-form__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.tenant-form__subtitle {
  margin: 0 0 var(--space-xl);
  color: var(--color-text-muted);
}

.tenant-form__panel {
  padding: var(--space-xl);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}

.tenant-form__fields {
  display: grid;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.tenant-form__fields--two {
  grid-template-columns: repeat(2, 1fr);
}

.tenant-form__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.tenant-form__input {
  width: 100%;
  padding: 0.75rem var(--space-md);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  background: #fff;
}

.tenant-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tenant-form__submit {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  border-radius: var(--radius-sm);
}

.tenant-form__secondary {
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-weight: 700;
  border-radius: var(--radius-sm);
  opacity: 0.5;
  cursor: not-allowed;
}

.tenant-form__message {
  margin: 0 0 var(--space-md);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-available-text);
}

@media (max-width: 640px) {
  .tenant-form__fields--two {
    grid-template-columns: 1fr;
  }
}
</style>
