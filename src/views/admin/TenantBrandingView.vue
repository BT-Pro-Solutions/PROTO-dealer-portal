<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { fetchTenantById, updateTenantBranding } from '../../data/admin.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const tenant = ref(null)
const saving = ref(false)
const saveMessage = ref(null)

const form = ref({
  initials: '',
  tagline: '',
  primaryColor: '#0011ab',
})

onMounted(async () => {
  tenant.value = await fetchTenantById(props.id)
  if (!tenant.value) {
    router.replace({ name: 'admin-dashboard' })
    return
  }
  form.value = { ...tenant.value.branding }
})

async function handleSubmit() {
  if (!tenant.value || saving.value) return
  saving.value = true
  saveMessage.value = null
  try {
    tenant.value = await updateTenantBranding(tenant.value.id, form.value)
    saveMessage.value = 'Branding saved.'
  } catch {
    saveMessage.value = 'Unable to save branding.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="tenant" class="tenant-form page-content page-content--narrow">
    <RouterLink
      :to="{ name: 'admin-tenant-settings', params: { id: tenant.id } }"
      class="tenant-form__back reveal"
    >
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to settings
    </RouterLink>

    <p class="tenant-form__eyebrow reveal reveal--delay-1">Tenant settings</p>
    <h1 class="tenant-form__title reveal reveal--delay-1">Branding</h1>
    <p class="tenant-form__subtitle reveal reveal--delay-1">
      Update the active portal brand for {{ tenant.name }}. Saving also enables the custom branding feature flag.
    </p>

    <form class="tenant-form__panel reveal reveal--delay-2" @submit.prevent="handleSubmit">
      <p v-if="saveMessage" class="tenant-form__message" role="status">{{ saveMessage }}</p>

      <div class="tenant-form__fields">
        <label class="tenant-form__label">
          Logo initials
          <input v-model="form.initials" type="text" class="tenant-form__input" maxlength="3" />
        </label>
        <label class="tenant-form__label">
          Tagline
          <input v-model="form.tagline" type="text" class="tenant-form__input" />
        </label>
        <label class="tenant-form__label">
          Primary color
          <input v-model="form.primaryColor" type="color" class="tenant-form__input tenant-form__input--color" />
        </label>
      </div>

      <div class="tenant-form__preview">
        <span class="tenant-form__preview-mark" :style="{ background: form.primaryColor }">
          {{ form.initials }}
        </span>
        <p class="tenant-form__preview-tagline">{{ form.tagline }}</p>
      </div>

      <button type="submit" class="tenant-form__submit" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save branding' }}
      </button>
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
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
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

.tenant-form__input--color {
  height: 48px;
  padding: 0.25rem;
}

.tenant-form__preview {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: #fff;
  border-radius: var(--radius-sm);
}

.tenant-form__preview-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.25rem;
}

.tenant-form__preview-tagline {
  margin: 0;
  font-weight: 600;
  color: var(--color-text-muted);
}

.tenant-form__submit {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  border-radius: var(--radius-sm);
}

.tenant-form__message {
  margin: 0 0 var(--space-md);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-available-text);
}

@media (max-width: 768px) {
  .tenant-form__fields {
    grid-template-columns: 1fr;
  }
}
</style>
