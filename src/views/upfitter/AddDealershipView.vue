<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { availableBrands, createDealership } from '../../data/upfitter.js'

const router = useRouter()

const saving = ref(false)
const errorMessage = ref(null)

const form = ref({
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  allowedBrands: [],
})

function toggleBrand(brand) {
  const brands = form.value.allowedBrands
  const idx = brands.indexOf(brand)
  if (idx === -1) {
    brands.push(brand)
  } else {
    brands.splice(idx, 1)
  }
}

async function handleSubmit() {
  if (saving.value) return

  const { name, contactName, phone, email, address } = form.value
  if (!name.trim() || !contactName.trim() || !email.trim()) {
    errorMessage.value = 'Dealership name, contact name, and email are required.'
    return
  }

  saving.value = true
  errorMessage.value = null

  try {
    const dealer = await createDealership(form.value)
    router.push({ name: 'upfitter-dealership-detail', params: { id: dealer.id } })
  } catch {
    errorMessage.value = 'Unable to add dealership. Please try again.'
    saving.value = false
  }
}
</script>

<template>
  <div class="add-dealer page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-dealerships' }" class="add-dealer__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to dealerships
    </RouterLink>

    <h1 class="add-dealer__title reveal reveal--delay-1">Add dealership</h1>
    <p class="add-dealer__subtitle reveal reveal--delay-1">
      Set up a new dealer partner with contact info and brand access.
    </p>

    <form class="add-dealer__section reveal reveal--delay-2" @submit.prevent="handleSubmit">
      <div
        v-if="errorMessage"
        class="add-dealer__message add-dealer__message--error"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <div class="add-dealer__fields">
        <label class="add-dealer__label">
          Dealership name
          <input v-model="form.name" type="text" class="add-dealer__input" required />
        </label>
        <label class="add-dealer__label">
          Contact name
          <input v-model="form.contactName" type="text" class="add-dealer__input" required />
        </label>
        <label class="add-dealer__label">
          Phone
          <input v-model="form.phone" type="tel" class="add-dealer__input" />
        </label>
        <label class="add-dealer__label">
          Email
          <input v-model="form.email" type="email" class="add-dealer__input" required />
          <span class="add-dealer__hint">
            The dealer can request additional authorized users after signup; each request will need your approval.
          </span>
        </label>
        <label class="add-dealer__label">
          Address
          <input v-model="form.address" type="text" class="add-dealer__input" />
        </label>
      </div>

      <h2 class="add-dealer__subheading">Brands made available to this dealership</h2>
      <div class="add-dealer__brands">
        <label
          v-for="brand in availableBrands"
          :key="brand"
          class="add-dealer__brand"
          :class="{ 'add-dealer__brand--active': form.allowedBrands.includes(brand) }"
        >
          <input
            type="checkbox"
            :checked="form.allowedBrands.includes(brand)"
            class="add-dealer__brand-check"
            @change="toggleBrand(brand)"
          />
          {{ brand }}
        </label>
      </div>

      <button type="submit" class="add-dealer__submit-btn" :disabled="saving">
        {{ saving ? 'Adding…' : 'Add dealership' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.add-dealer__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: var(--space-lg);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.add-dealer__back:hover {
  text-decoration: underline;
}

.add-dealer__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.add-dealer__subtitle {
  margin: 0.35rem 0 var(--space-xl);
  color: var(--color-text-muted);
}

.add-dealer__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
}

.add-dealer__fields {
  display: grid;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.add-dealer__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.add-dealer__input {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: #fff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.add-dealer__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.add-dealer__hint {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.add-dealer__subheading {
  margin: 0 0 var(--space-md);
  font-size: var(--text-base);
  font-weight: 700;
}

.add-dealer__brands {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.add-dealer__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-chip);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}

.add-dealer__brand--active {
  background: var(--brand-color);
  color: #fff;
  border-color: var(--brand-color);
}

.add-dealer__brand-check {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.add-dealer__submit-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
}

.add-dealer__submit-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.add-dealer__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-dealer__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
}

.add-dealer__message--error {
  background: var(--color-on-hold);
  color: #8b0000;
}
</style>
