<script setup>
import { ref, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { updateUpfitterProfile } from '../../data/upfitter.js'
import { resolvePublicUrl } from '../../utils/publicUrl.js'

const session = inject('session')

const editForm = ref({
  companyName: session.value.companyName,
  userName: session.value.userName,
  email: session.value.email,
  phone: session.value.phone,
  address: session.value.address,
  hours: session.value.hours,
  brandColor: session.value.brandColor,
  logoUrl: session.value.logoUrl,
})

const saving = ref(false)
const saveMessage = ref(null)

async function handleSave() {
  if (saving.value) return

  saving.value = true
  saveMessage.value = null

  try {
    const updated = await updateUpfitterProfile({
      companyName: editForm.value.companyName.trim(),
      userName: editForm.value.userName.trim(),
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim(),
      address: editForm.value.address.trim(),
      hours: editForm.value.hours.trim(),
      brandColor: editForm.value.brandColor,
      logoUrl: editForm.value.logoUrl.trim(),
    })
    Object.assign(session.value, updated)
    saveMessage.value = { type: 'success', text: 'Account updated.' }
  } catch {
    saveMessage.value = { type: 'error', text: 'Unable to save changes.' }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="account page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-dashboard' }" class="account__link">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to dashboard
    </RouterLink>

    <h1 class="account__title reveal">My Account</h1>
    <p class="account__subtitle reveal reveal--delay-1">
      Manage your upfitter branding, contact info, and portal appearance.
    </p>

    <form class="account__section reveal reveal--delay-2" @submit.prevent="handleSave">
      <h2 class="account__heading">Branding</h2>

      <div
        v-if="saveMessage"
        class="account__message"
        :class="`account__message--${saveMessage.type}`"
        role="status"
      >
        {{ saveMessage.text }}
      </div>

      <div class="account__logo-preview">
        <img :src="resolvePublicUrl(editForm.logoUrl)" :alt="editForm.companyName" class="account__logo-img" />
      </div>

      <div class="account__fields">
        <label class="account__label">
          Company name
          <input v-model="editForm.companyName" type="text" class="account__input" />
        </label>
        <label class="account__label">
          Logo URL
          <input v-model="editForm.logoUrl" type="url" class="account__input" placeholder="/assets/Dealer-Logo.svg" />
        </label>
        <label class="account__label account__label--color">
          Brand color
          <div class="account__color-row">
            <input v-model="editForm.brandColor" type="color" class="account__color-picker" />
            <input v-model="editForm.brandColor" type="text" class="account__input account__input--color" />
            <span class="account__color-swatch" :style="{ background: editForm.brandColor }"></span>
          </div>
        </label>
      </div>

      <h2 class="account__heading">Contact</h2>
      <div class="account__fields">
        <label class="account__label">
          Your name
          <input v-model="editForm.userName" type="text" class="account__input" />
        </label>
        <label class="account__label">
          Email
          <input v-model="editForm.email" type="email" class="account__input" />
        </label>
        <label class="account__label">
          Phone
          <input v-model="editForm.phone" type="tel" class="account__input" />
        </label>
        <label class="account__label">
          Address
          <input v-model="editForm.address" type="text" class="account__input" />
        </label>
        <label class="account__label">
          Business hours
          <input v-model="editForm.hours" type="text" class="account__input" />
        </label>
      </div>

      <button type="submit" class="account__save-btn" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save changes' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.account__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.account__subtitle {
  margin: 0 0 var(--space-2xl);
  color: var(--color-text-muted);
}

.account__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.account__heading {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-xl);
  font-weight: 700;
}

.account__heading + .account__heading {
  margin-top: var(--space-xl);
}

.account__logo-preview {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
  background: #fff;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-lg);
}

.account__logo-img {
  max-width: 200px;
  max-height: 80px;
  object-fit: contain;
}

.account__fields {
  display: grid;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.account__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.account__input {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: #fff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.account__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.account__color-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.account__color-picker {
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.account__input--color {
  flex: 1;
  font-family: ui-monospace, monospace;
}

.account__color-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.account__save-btn {
  background: var(--brand-color);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
}

.account__save-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.account__save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.account__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.account__message--success {
  background: var(--color-available);
}

.account__message--error {
  background: var(--color-on-hold);
}

.account__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-md);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.account__link:hover {
  text-decoration: underline;
}
</style>
