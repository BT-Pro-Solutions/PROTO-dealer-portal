<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'
import { useQuoteVehicleImages } from '../../composables/useQuoteVehicleImages.js'
import { fetchQuoteById, formatQuoteDate } from '../../data/quotes.js'
import { formatPrice } from '../../data/vehicles.js'
import VehicleImagePlaceholder from '../../components/VehicleImagePlaceholder.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { loadQuotes, getQuote, respondToQuote } = useUpfitterQuotes()
const { ensureCatalog, vehicleImage } = useQuoteVehicleImages()

const quote = ref(null)
const loading = ref(true)
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref(false)
const itemPrices = reactive({})
const itemComments = reactive({})
const generalComment = ref('')
const estimatedReadyDate = ref('')

const isPending = computed(() => quote.value?.status === 'submitted')
const subtotalPreUpfit = computed(
  () => quote.value?.items.reduce((sum, item) => sum + (item.preUpfitPrice ?? 0), 0) ?? 0,
)
const quotedTotal = computed(() =>
  Object.values(itemPrices).reduce((sum, price) => sum + (Number(price) || 0), 0),
)
const canSubmit = computed(() => {
  if (!quote.value || !estimatedReadyDate.value) return false
  return quote.value.items.every((item) => {
    const price = itemPrices[item.vehicleId]
    return price != null && price !== '' && Number(price) > 0
  })
})

onMounted(async () => {
  await Promise.all([loadQuotes(), ensureCatalog()])
  quote.value = getQuote(props.id) ?? (await fetchQuoteById(props.id))
  loading.value = false

  if (!quote.value) {
    router.replace({ name: 'upfitter-quotes' })
    return
  }

  for (const item of quote.value.items) {
    itemPrices[item.vehicleId] = item.quotedPrice ?? ''
    itemComments[item.vehicleId] = item.upfitterComment ?? ''
  }
  generalComment.value = quote.value.generalComment ?? ''
  estimatedReadyDate.value = quote.value.estimatedReadyDate ?? ''
})

async function handleSubmitQuote() {
  if (!quote.value || !canSubmit.value || submitting.value) return

  submitting.value = true
  submitSuccess.value = false
  submitError.value = false

  try {
    const prices = {}
    const comments = {}
    for (const item of quote.value.items) {
      prices[item.vehicleId] = Number(itemPrices[item.vehicleId])
      comments[item.vehicleId] = itemComments[item.vehicleId]
    }
    quote.value = await respondToQuote(quote.value.id, {
      itemPrices: prices,
      itemComments: comments,
      generalComment: generalComment.value,
      estimatedReadyDate: estimatedReadyDate.value,
    })
    submitSuccess.value = true
  } catch {
    submitError.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="quote-detail page-content page-content--narrow">
    <p class="quote-detail__loading">Loading quote request…</p>
  </div>

  <div v-else-if="quote" class="quote-detail page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-quotes' }" class="quote-detail__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to quote requests
    </RouterLink>

    <div class="quote-detail__header reveal reveal--delay-1">
      <div>
        <h1 class="quote-detail__title">{{ quote.id }}</h1>
        <p class="quote-detail__dealer">{{ quote.dealershipName }}</p>
      </div>
      <span
        class="quote-detail__status"
        :class="isPending ? 'quote-detail__status--pending' : 'quote-detail__status--quoted'"
      >
        {{ isPending ? 'Pending' : 'Quoted' }}
      </span>
    </div>

    <div class="quote-detail__meta-grid reveal reveal--delay-2">
      <section class="quote-detail__panel">
        <h2 class="quote-detail__heading">Customer</h2>
        <dl class="quote-detail__fields">
          <div class="quote-detail__field">
            <dt>Name</dt>
            <dd>{{ quote.customer.name }}</dd>
          </div>
          <div class="quote-detail__field">
            <dt>Email</dt>
            <dd>{{ quote.customer.email }}</dd>
          </div>
          <div v-if="quote.customer.phone" class="quote-detail__field">
            <dt>Phone</dt>
            <dd>{{ quote.customer.phone }}</dd>
          </div>
          <div v-if="quote.customer.company" class="quote-detail__field">
            <dt>Company</dt>
            <dd>{{ quote.customer.company }}</dd>
          </div>
        </dl>
      </section>

      <section class="quote-detail__panel">
        <h2 class="quote-detail__heading">Timeline</h2>
        <dl class="quote-detail__fields">
          <div class="quote-detail__field">
            <dt>Submitted</dt>
            <dd>{{ formatQuoteDate(quote.submittedAt) }}</dd>
          </div>
          <div class="quote-detail__field">
            <dt>Quoted</dt>
            <dd>{{ isPending ? 'Awaiting your response' : formatQuoteDate(quote.quotedAt) }}</dd>
          </div>
          <div v-if="!isPending && quote.estimatedReadyDate" class="quote-detail__field">
            <dt>Est. ready</dt>
            <dd>{{ formatQuoteDate(quote.estimatedReadyDate) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="quote-detail__section reveal reveal--delay-3">
      <h2 class="quote-detail__heading">Vehicles &amp; pricing</h2>
      <ul class="quote-detail__vehicles">
        <li v-for="item in quote.items" :key="item.vehicleId" class="quote-detail__vehicle">
          <div class="quote-detail__vehicle-image">
            <img
              v-if="vehicleImage(item.vehicleId)"
              :src="vehicleImage(item.vehicleId)"
              :alt="item.title"
              class="quote-detail__vehicle-img"
            />
            <VehicleImagePlaceholder v-else compact :alt="`${item.title} — no photo`" />
          </div>

          <div class="quote-detail__vehicle-main">
            <div class="quote-detail__vehicle-top">
              <span class="quote-detail__vehicle-title">{{ item.title }}</span>
              <span class="quote-detail__vehicle-vin">{{ item.vin }}</span>
            </div>
            <p v-if="item.instructions" class="quote-detail__vehicle-notes">
              <strong>Dealer notes:</strong> {{ item.instructions }}
            </p>

            <label v-if="isPending" class="quote-detail__comment-label">
              Your comment
              <textarea
                v-model="itemComments[item.vehicleId]"
                class="quote-detail__textarea"
                rows="2"
                placeholder="Notes on upfit, lead time, options…"
              ></textarea>
            </label>
            <p v-else-if="item.upfitterComment" class="quote-detail__vehicle-comment">
              <strong>Your comment:</strong> {{ item.upfitterComment }}
            </p>
          </div>

          <div class="quote-detail__vehicle-pricing">
            <span class="quote-detail__vehicle-pre">{{ formatPrice(item.preUpfitPrice) }} pre-upfit</span>
            <label v-if="isPending" class="quote-detail__price-input">
              <span class="quote-detail__price-label">Quoted price</span>
              <input
                v-model="itemPrices[item.vehicleId]"
                type="number"
                min="0"
                step="100"
                class="quote-detail__input"
                placeholder="0"
              />
            </label>
            <span v-else-if="item.quotedPrice" class="quote-detail__vehicle-quoted">
              {{ formatPrice(item.quotedPrice) }}
            </span>
          </div>
        </li>
      </ul>

      <div class="quote-detail__totals">
        <div class="quote-detail__total-row">
          <span>Pre-upfit subtotal</span>
          <span>{{ formatPrice(subtotalPreUpfit) }}</span>
        </div>
        <div class="quote-detail__total-row quote-detail__total-row--quoted">
          <span>{{ isPending ? 'Proposed total' : 'Quoted total' }}</span>
          <span>{{ formatPrice(isPending ? quotedTotal : quote.quotedTotal) }}</span>
        </div>
      </div>
    </section>

    <section v-if="isPending" class="quote-detail__section quote-detail__section--submit reveal reveal--delay-4">
      <h2 class="quote-detail__heading">Submit quote</h2>

      <div
        v-if="submitSuccess"
        class="quote-detail__message quote-detail__message--success"
        role="status"
      >
        Quote submitted successfully. The dealership can now review your pricing.
      </div>
      <div
        v-if="submitError"
        class="quote-detail__message quote-detail__message--error"
        role="status"
      >
        Unable to submit quote. Please try again.
      </div>

      <div class="quote-detail__submit-grid">
        <label class="quote-detail__label">
          Estimated ready date
          <input
            v-model="estimatedReadyDate"
            type="date"
            class="quote-detail__input quote-detail__input--date"
            required
          />
        </label>

        <label class="quote-detail__label quote-detail__label--full">
          General comment
          <textarea
            v-model="generalComment"
            class="quote-detail__textarea"
            rows="3"
            placeholder="Overall notes for the dealership — lead times, terms, follow-up…"
          ></textarea>
        </label>
      </div>

      <button
        type="button"
        class="quote-detail__submit-btn"
        :disabled="!canSubmit || submitting || submitSuccess"
        @click="handleSubmitQuote"
      >
        <Icon icon="mdi:send" width="20" height="20" aria-hidden="true" />
        {{ submitting ? 'Submitting…' : submitSuccess ? 'Quote submitted' : 'Submit quote to dealership' }}
      </button>
    </section>

    <section v-else-if="quote.generalComment" class="quote-detail__section reveal reveal--delay-4">
      <h2 class="quote-detail__heading">General comment</h2>
      <p class="quote-detail__general-comment">{{ quote.generalComment }}</p>
    </section>
  </div>
</template>

<style scoped>
.quote-detail__loading {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.quote-detail__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: var(--space-md);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.quote-detail__back:hover {
  text-decoration: underline;
}

.quote-detail__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.quote-detail__title {
  margin: 0;
  font-family: ui-monospace, monospace;
  font-size: 1.35rem;
  font-weight: 800;
}

.quote-detail__dealer {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-muted);
}

.quote-detail__status {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-chip);
}

.quote-detail__status--pending {
  background: var(--color-pending);
  color: var(--color-pending-text);
}

.quote-detail__status--quoted {
  background: var(--color-available);
  color: #1a5c36;
}

.quote-detail__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.quote-detail__panel,
.quote-detail__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
}

.quote-detail__heading {
  margin: 0 0 var(--space-md);
  font-size: var(--text-base);
  font-weight: 700;
}

.quote-detail__fields {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
}

.quote-detail__field dt {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.1rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.quote-detail__field dd {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 500;
}

.quote-detail__vehicles {
  list-style: none;
  margin: 0 0 var(--space-md);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quote-detail__vehicle {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.quote-detail__vehicle-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-muted);
}

.quote-detail__vehicle-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quote-detail__vehicle-top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-sm);
}

.quote-detail__vehicle-title {
  font-weight: 700;
  font-size: var(--text-sm);
}

.quote-detail__vehicle-vin {
  font-family: ui-monospace, monospace;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.quote-detail__vehicle-notes,
.quote-detail__vehicle-comment {
  margin: 0.35rem 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.45;
}

.quote-detail__vehicle-notes strong,
.quote-detail__vehicle-comment strong {
  color: var(--color-text);
}

.quote-detail__comment-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: var(--space-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.quote-detail__vehicle-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-xs);
  flex-shrink: 0;
  min-width: 130px;
}

.quote-detail__vehicle-pre {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.quote-detail__vehicle-quoted {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
}

.quote-detail__price-input {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: flex-end;
  width: 100%;
}

.quote-detail__price-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.quote-detail__input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  text-align: right;
}

.quote-detail__input--date {
  text-align: left;
  max-width: 220px;
}

.quote-detail__input:focus,
.quote-detail__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.quote-detail__textarea {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: #fff;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  resize: vertical;
  min-height: 52px;
}

.quote-detail__totals {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: var(--space-sm);
}

.quote-detail__total-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  font-size: var(--text-sm);
  margin-bottom: 0.25rem;
}

.quote-detail__total-row--quoted {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-base);
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.quote-detail__section--submit {
  padding-bottom: var(--space-lg);
}

.quote-detail__submit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.quote-detail__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.quote-detail__label--full {
  grid-column: 1 / -1;
}

.quote-detail__message {
  margin-bottom: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.quote-detail__message--success {
  background: var(--color-available);
}

.quote-detail__message--error {
  background: var(--color-on-hold);
}

.quote-detail__submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--brand-color);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-sm);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
}

.quote-detail__submit-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.quote-detail__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quote-detail__general-comment {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .quote-detail__meta-grid,
  .quote-detail__submit-grid {
    grid-template-columns: 1fr;
  }

  .quote-detail__vehicle {
    grid-template-columns: 1fr;
  }

  .quote-detail__vehicle-image {
    width: 100%;
    height: 160px;
  }

  .quote-detail__vehicle-pricing {
    align-items: stretch;
  }
}
</style>
