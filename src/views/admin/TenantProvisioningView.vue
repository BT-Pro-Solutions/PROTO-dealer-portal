<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { fetchTenantById, updateTenantProvisioning } from '../../data/admin.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const tenant = ref(null)
const steps = ref([])
const saving = ref(false)
const saveMessage = ref(null)

onMounted(async () => {
  tenant.value = await fetchTenantById(props.id)
  if (!tenant.value) {
    router.replace({ name: 'admin-dashboard' })
    return
  }
  steps.value = tenant.value.provisioningSteps.map((s) => ({ ...s }))
})

async function handleSubmit() {
  if (!tenant.value || saving.value) return
  saving.value = true
  saveMessage.value = null
  try {
    tenant.value = await updateTenantProvisioning(tenant.value.id, steps.value)
    saveMessage.value = 'Checklist saved.'
  } catch {
    saveMessage.value = 'Unable to save checklist.'
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
    <h1 class="tenant-form__title reveal reveal--delay-1">Provisioning checklist</h1>
    <p class="tenant-form__subtitle reveal reveal--delay-1">
      Track setup steps that must be completed before {{ tenant.name }} can launch.
    </p>

    <form class="tenant-form__panel reveal reveal--delay-2" @submit.prevent="handleSubmit">
      <p v-if="saveMessage" class="tenant-form__message" role="status">{{ saveMessage }}</p>

      <ul class="tenant-form__checklist">
        <li v-for="step in steps" :key="step.id">
          <label class="tenant-form__check">
            <input v-model="step.complete" type="checkbox" />
            <span>{{ step.label }}</span>
          </label>
        </li>
      </ul>

      <button type="submit" class="tenant-form__submit" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save checklist' }}
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

.tenant-form__checklist {
  list-style: none;
  margin: 0 0 var(--space-xl);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.tenant-form__check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}

.tenant-form__check input {
  width: 18px;
  height: 18px;
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
</style>
