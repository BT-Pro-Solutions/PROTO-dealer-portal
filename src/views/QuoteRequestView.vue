<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { fetchUpfitterContact } from '../data/dealer.js'
import { submitQuoteRequest, formatPrice } from '../data/vehicles.js'
import { useVehicleSelection } from '../composables/useVehicleSelection.js'
import { useQuoteDraft } from '../composables/useQuoteDraft.js'

const catalog = inject('catalog')
const router = useRouter()
const upfitter = ref(null)
const submitting = ref(false)
const submitted = ref(false)

const { selectedIdsList, removeSelection, clearSelection } = useVehicleSelection()
const { getInstructions, setInstructions, removeInstructions, clearAllInstructions, buildPayload } =
  useQuoteDraft()

const selectedVehicles = computed(() =>
  selectedIdsList.value
    .map((id) => catalog.value.find((v) => v.id === id))
    .filter(Boolean),
)

const subtotal = computed(() =>
  selectedVehicles.value.reduce((sum, vehicle) => sum + (vehicle.preUpfitPrice ?? 0), 0),
)

onMounted(async () => {
  upfitter.value = await fetchUpfitterContact()
})

watch(selectedIdsList, (ids) => {
  if (ids.length === 0 && !submitted.value) {
    router.replace({ name: 'inventory' })
  }
}, { flush: 'post' })

function removeVehicle(id) {
  removeSelection(id)
  removeInstructions(id)
}

async function handleSubmit() {
  if (selectedVehicles.value.length === 0 || submitting.value) return

  submitting.value = true
  try {
    await submitQuoteRequest(buildPayload(selectedIdsList.value))
    submitted.value = true
    clearSelection()
    clearAllInstructions()
  } catch {
    alert('Unable to submit quote request. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="quote page-content page-content--narrow">
    <template v-if="submitted">
      <div class="quote__thank-you">
        <h1 class="quote__title">Thank you!</h1>
        <p class="quote__message">
          Your quote request has been submitted to {{ upfitter?.name ?? 'Zoresco' }}.
          You should expect a quote soon — typically within one business day.
        </p>
        <RouterLink to="/" class="quote__btn">Back to inventory</RouterLink>
      </div>
    </template>

    <template v-else>
      <h1 class="quote__title">Request a Quote</h1>
      <p class="quote__subtitle">
        Review your selected vehicles, add instructions for each, and submit to
        {{ upfitter?.name ?? 'your upfitter' }}.
      </p>

      <div class="quote__layout">
        <div class="quote__vehicles">
          <article v-for="vehicle in selectedVehicles" :key="vehicle.id" class="quote-item">
            <div class="quote-item__header">
              <div class="quote-item__summary">
                <img :src="vehicle.imageUrl" :alt="vehicle.title" class="quote-item__thumb" />
                <div>
                  <h2 class="quote-item__title">{{ vehicle.title }}</h2>
                  <p class="quote-item__vin">{{ vehicle.vin }}</p>
                  <p class="quote-item__meta">
                    {{ vehicle.year }} · {{ vehicle.rearWheel }} · {{ vehicle.drive }}
                  </p>
                  <p class="quote-item__price">
                    {{ formatPrice(vehicle.preUpfitPrice) }}
                    <span class="quote-item__price-note">pre-upfit pricing</span>
                  </p>
                </div>
              </div>
              <button type="button" class="quote-item__remove" @click="removeVehicle(vehicle.id)">
                Remove
              </button>
            </div>

            <label class="quote-item__instructions-label" :for="`instructions-${vehicle.id}`">
              Instructions for this vehicle
            </label>
            <textarea
              :id="`instructions-${vehicle.id}`"
              class="quote-item__instructions"
              rows="3"
              placeholder="Describe upfit options, customer requirements, timeline, etc."
              :value="getInstructions(vehicle.id)"
              @input="setInstructions(vehicle.id, $event.target.value)"
            ></textarea>
          </article>
        </div>

        <aside v-if="upfitter" class="quote__contact">
          <h2 class="quote__contact-heading">Upfitter Contact</h2>
          <p class="quote__contact-name">{{ upfitter.name }}</p>
          <dl class="quote__contact-fields">
            <div>
              <dt>Phone</dt>
              <dd><a :href="`tel:${upfitter.phone}`">{{ upfitter.phone }}</a></dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd><a :href="`mailto:${upfitter.email}`">{{ upfitter.email }}</a></dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{{ upfitter.address }}</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{{ upfitter.hours }}</dd>
            </div>
          </dl>

          <div class="quote__subtotal">
            <span class="quote__subtotal-label">Subtotal (pre-upfit pricing)</span>
            <span class="quote__subtotal-amount">{{ formatPrice(subtotal) }}</span>
          </div>
          <p class="quote__subtotal-note">
            Final quote may vary after upfit options and fees.
          </p>

          <button
            type="button"
            class="quote__submit"
            :disabled="submitting || selectedVehicles.length === 0"
            @click="handleSubmit"
          >
            {{ submitting ? 'Submitting…' : `Submit ${selectedVehicles.length} Truck${selectedVehicles.length === 1 ? '' : 's'} for Quote` }}
          </button>
        </aside>
      </div>

      <RouterLink to="/" class="quote__back">
        <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
        Back to inventory
      </RouterLink>
    </template>
  </div>
</template>

<style scoped>
.quote__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.quote__subtitle {
  margin: 0 0 var(--space-2xl);
  color: var(--color-text-muted);
}

.quote__layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-2xl);
  align-items: start;
}

.quote-item {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.quote-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  color: #fff;
}

.quote-item__summary {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.quote-item__thumb {
  width: 100px;
  height: 68px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.quote-item__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
}

.quote-item__vin {
  margin: 0.2rem 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-item__meta {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
}

.quote-item__price {
  margin: 0.35rem 0 0;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 800;
}

.quote-item__price-note {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.quote-item__remove {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-decoration: underline;
  flex-shrink: 0;
}

.quote-item__remove:hover {
  color: var(--color-text);
}

.quote-item__instructions-label {
  color: #fff;
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.quote-item__instructions {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  resize: vertical;
  min-height: 80px;
}

.quote-item__instructions:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.quote__contact {
  position: sticky;
  top: var(--space-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  color: #fff;
}

.quote__contact-heading {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-xl);
  font-weight: 700;
}

.quote__contact-name {
  margin: 0 0 var(--space-lg);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
}

.quote__contact-fields {
  display: grid;
  gap: var(--space-md);
  margin: 0 0 var(--space-xl);
}

.quote__contact-fields dt {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.1rem;
}

.quote__contact-fields dd {
  margin: 0;
  font-size: var(--text-base);
}

.quote__contact-fields a {
  color: #fff;
}

.quote__subtotal {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-sm);
}

.quote__subtotal-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.quote__subtotal-amount {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 900;
}

.quote__subtotal-note {
  margin: 0 0 var(--space-xl);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.4;
}

.quote__submit {
  width: 100%;
  background: var(--brand-color);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  padding: 0.9rem 1.5rem;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.quote__submit:hover:not(:disabled) {
  opacity: 0.85;
}

.quote__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.quote__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-lg);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.quote__back:hover {
  text-decoration: underline;
}

.quote__thank-you {
  max-width: 560px;
  margin: var(--space-2xl) auto;
  text-align: center;
  padding: var(--space-2xl);
  background: var(--color-available);
  border-radius: var(--radius-md);
}

.quote__message {
  margin: var(--space-md) 0 var(--space-xl);
  font-size: var(--text-lg);
  line-height: 1.5;
}

.quote__btn {
  display: inline-block;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  padding: 0.85rem 2rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
}

@media (max-width: 960px) {
  .quote__layout {
    grid-template-columns: 1fr;
  }

  .quote__contact {
    position: static;
  }
}
</style>
