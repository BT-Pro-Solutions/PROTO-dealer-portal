<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { createTenant } from '../../data/admin.js'

const router = useRouter()

const saving = ref(false)
const errorMessage = ref(null)

const lifecycleOptions = ['Draft', 'Provisioning', 'Active', 'Suspended']

const form = ref({
  name: '',
  subdomain: '',
  lifecycleStatus: 'Draft',
  supportEmail: '',
  ownerName: '',
  ownerEmail: '',
})

async function handleSubmit() {
  if (saving.value) return

  const { name, supportEmail, ownerName, ownerEmail } = form.value
  if (!name.trim() || !supportEmail.trim() || !ownerName.trim() || !ownerEmail.trim()) {
    errorMessage.value = 'Tenant name, support email, owner name, and owner email are required.'
    return
  }

  saving.value = true
  errorMessage.value = null

  try {
    const tenant = await createTenant(form.value)
    router.push({ name: 'admin-tenant-settings', params: { id: tenant.id } })
  } catch {
    errorMessage.value = 'Unable to create tenant. Please try again.'
    saving.value = false
  }
}
</script>

<template>
  <div class="create-tenant page-content page-content--narrow">
    <RouterLink :to="{ name: 'admin-dashboard' }" class="create-tenant__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to tenants
    </RouterLink>

    <p class="create-tenant__eyebrow reveal reveal--delay-1">Tenant Manager</p>
    <h1 class="create-tenant__title reveal reveal--delay-1">Create tenant</h1>
    <p class="create-tenant__subtitle reveal reveal--delay-1">
      Create an upfitter tenant and automatically seed its first Upfitter Admin.
    </p>

    <form class="create-tenant__form reveal reveal--delay-2" @submit.prevent="handleSubmit">
      <div
        v-if="errorMessage"
        class="create-tenant__message create-tenant__message--error"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <div class="create-tenant__fields">
        <label class="create-tenant__label">
          Tenant name
          <input v-model="form.name" type="text" class="create-tenant__input" required placeholder="Example Upfitters" />
        </label>
        <label class="create-tenant__label">
          Subdomain
          <input v-model="form.subdomain" type="text" class="create-tenant__input" placeholder="example" />
        </label>
        <label class="create-tenant__label">
          Lifecycle status
          <select v-model="form.lifecycleStatus" class="create-tenant__input">
            <option v-for="status in lifecycleOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </label>
        <label class="create-tenant__label">
          Support email
          <input v-model="form.supportEmail" type="email" class="create-tenant__input" required placeholder="support@example.com" />
        </label>
        <label class="create-tenant__label">
          Owner name
          <input v-model="form.ownerName" type="text" class="create-tenant__input" required placeholder="Owner Name" />
        </label>
        <label class="create-tenant__label">
          Owner email
          <input v-model="form.ownerEmail" type="email" class="create-tenant__input" required placeholder="owner@example.com" />
        </label>
      </div>

      <button type="submit" class="create-tenant__submit" :disabled="saving">
        {{ saving ? 'Creating…' : 'Create tenant' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.create-tenant__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.create-tenant__back:hover {
  text-decoration: underline;
}

.create-tenant__eyebrow {
  margin: var(--space-md) 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.create-tenant__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.create-tenant__subtitle {
  margin: 0 0 var(--space-xl);
  color: var(--color-text-muted);
}

.create-tenant__form {
  padding: var(--space-xl);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}

.create-tenant__fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.create-tenant__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.create-tenant__input {
  width: 100%;
  padding: 0.75rem var(--space-md);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  background: #fff;
}

.create-tenant__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.create-tenant__submit {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.create-tenant__submit:hover:not(:disabled) {
  opacity: 0.85;
}

.create-tenant__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-tenant__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
}

.create-tenant__message--error {
  background: var(--color-on-hold);
  color: #8b0000;
}

@media (max-width: 640px) {
  .create-tenant__fields {
    grid-template-columns: 1fr;
  }
}
</style>
