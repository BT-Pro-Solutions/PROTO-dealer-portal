<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useDealerQuotes } from '../../composables/useDealerQuotes.js'
import { fetchQuoteById, sendQuoteToCustomer, formatQuoteDate } from '../../data/quotes.js'
import { formatPrice } from '../../data/vehicles.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { loadQuotes, getQuote } = useDealerQuotes()

const quote = ref(null)
const loading = ref(true)
const sending = ref(false)
const sendMessage = ref('')
const sendSuccess = ref(false)
const sendError = ref(false)

const isQuoted = computed(() => quote.value?.status === 'quoted')
const subtotalPreUpfit = computed(() =>
  quote.value?.items.reduce((sum, item) => sum + (item.preUpfitPrice ?? 0), 0) ?? 0,
)

onMounted(async () => {
  await loadQuotes()
  quote.value = getQuote(props.id) ?? (await fetchQuoteById(props.id))
  loading.value = false

  if (!quote.value) {
    router.replace({ name: 'dealer-my-quotes' })
  }
})

async function handleSendQuote() {
  if (!quote.value || !isQuoted.value || sending.value) return

  sending.value = true
  sendSuccess.value = false
  sendError.value = false

  try {
    await sendQuoteToCustomer(quote.value.id, {
      email: quote.value.customer.email,
      message: sendMessage.value.trim(),
    })
    sendSuccess.value = true
  } catch {
    sendError.value = true
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="quote-detail page-content page-content--narrow">
    <p class="quote-detail__loading">Loading quote…</p>
  </div>

  <div v-else-if="quote" class="quote-detail page-content page-content--narrow">
    <RouterLink :to="{ name: 'dealer-my-quotes' }" class="quote-detail__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to My Quotes
    </RouterLink>

    <div class="quote-detail__header reveal reveal--delay-1">
      <div>
        <h1 class="quote-detail__title">{{ quote.id }}</h1>
        <p class="quote-detail__customer">{{ quote.customer.name }}</p>
      </div>
      <span
        class="quote-detail__status"
        :class="isQuoted ? 'quote-detail__status--quoted' : 'quote-detail__status--submitted'"
      >
        {{ isQuoted ? 'Quoted' : 'Submitted' }}
      </span>
    </div>

    <section class="quote-detail__section reveal reveal--delay-2">
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

    <section class="quote-detail__section reveal reveal--delay-3">
      <h2 class="quote-detail__heading">Timeline</h2>
      <dl class="quote-detail__fields">
        <div class="quote-detail__field">
          <dt>Submitted</dt>
          <dd>{{ formatQuoteDate(quote.submittedAt) }}</dd>
        </div>
        <div class="quote-detail__field">
          <dt>Quoted</dt>
          <dd>{{ isQuoted ? formatQuoteDate(quote.quotedAt) : 'Awaiting upfitter response' }}</dd>
        </div>
      </dl>
    </section>

    <section class="quote-detail__section reveal reveal--delay-4">
      <h2 class="quote-detail__heading">Vehicles</h2>
      <ul class="quote-detail__vehicles">
        <li v-for="item in quote.items" :key="item.vehicleId" class="quote-detail__vehicle">
          <div class="quote-detail__vehicle-info">
            <span class="quote-detail__vehicle-title">{{ item.title }}</span>
            <span class="quote-detail__vehicle-vin">{{ item.vin }}</span>
            <p v-if="item.instructions" class="quote-detail__vehicle-notes">{{ item.instructions }}</p>
          </div>
          <div class="quote-detail__vehicle-prices">
            <span class="quote-detail__vehicle-pre">{{ formatPrice(item.preUpfitPrice) }} pre-upfit</span>
            <span v-if="item.quotedPrice" class="quote-detail__vehicle-quoted">{{ formatPrice(item.quotedPrice) }} quoted</span>
          </div>
        </li>
      </ul>

      <div class="quote-detail__totals">
        <div class="quote-detail__total-row">
          <span>Pre-upfit subtotal</span>
          <span>{{ formatPrice(subtotalPreUpfit) }}</span>
        </div>
        <div v-if="isQuoted" class="quote-detail__total-row quote-detail__total-row--quoted">
          <span>Quoted total</span>
          <span>{{ formatPrice(quote.quotedTotal) }}</span>
        </div>
      </div>
    </section>

    <section v-if="isQuoted" class="quote-detail__section reveal reveal--delay-5">
      <h2 class="quote-detail__heading">Send to customer</h2>
      <p class="quote-detail__note">
        Email this quote to {{ quote.customer.name }} at {{ quote.customer.email }}.
      </p>

      <div
        v-if="sendSuccess"
        class="quote-detail__message quote-detail__message--success"
        role="status"
      >
        Quote sent successfully.
      </div>
      <div
        v-if="sendError"
        class="quote-detail__message quote-detail__message--error"
        role="status"
      >
        Unable to send quote. Please try again.
      </div>

      <label class="quote-detail__label">
        Optional message
        <textarea
          v-model="sendMessage"
          class="quote-detail__textarea"
          rows="3"
          placeholder="Add a personal note to include in the email…"
        ></textarea>
      </label>

      <button
        type="button"
        class="quote-detail__send-btn"
        :disabled="sending"
        @click="handleSendQuote"
      >
        <Icon icon="mdi:email-outline" width="20" height="20" aria-hidden="true" />
        {{ sending ? 'Sending…' : 'Send quote via email' }}
      </button>
    </section>

    <section v-else class="quote-detail__section quote-detail__section--muted reveal reveal--delay-5">
      <p class="quote-detail__note">
        This request has been submitted to your upfitter. You'll be able to send the quote to your customer once pricing is ready.
      </p>
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
  margin-bottom: var(--space-lg);
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
  margin-bottom: var(--space-xl);
}

.quote-detail__title {
  margin: 0;
  font-family: ui-monospace, monospace;
  font-size: 1.5rem;
  font-weight: 800;
}

.quote-detail__customer {
  margin: 0.35rem 0 0;
  font-size: var(--text-lg);
  font-weight: 600;
}

.quote-detail__status {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-chip);
}

.quote-detail__status--submitted {
  background: #fff3cd;
  color: #856404;
}

.quote-detail__status--quoted {
  background: var(--color-available);
  color: #1a5c36;
}

.quote-detail__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.quote-detail__section--muted {
  background: #f5f5f5;
}

.quote-detail__heading {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-xl);
  font-weight: 700;
}

.quote-detail__fields {
  display: grid;
  gap: var(--space-md);
  margin: 0;
}

.quote-detail__field dt {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.15rem;
}

.quote-detail__field dd {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 500;
}

.quote-detail__vehicles {
  list-style: none;
  margin: 0 0 var(--space-lg);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quote-detail__vehicle {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.quote-detail__vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.quote-detail__vehicle-title {
  font-weight: 700;
}

.quote-detail__vehicle-vin {
  font-family: ui-monospace, monospace;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-detail__vehicle-notes {
  margin: 0.35rem 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-detail__vehicle-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  flex-shrink: 0;
  text-align: right;
}

.quote-detail__vehicle-pre {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-detail__vehicle-quoted {
  font-family: var(--font-display);
  font-weight: 800;
}

.quote-detail__totals {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: var(--space-md);
}

.quote-detail__total-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  font-size: var(--text-base);
  margin-bottom: 0.35rem;
}

.quote-detail__total-row--quoted {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
  margin-top: var(--space-sm);
  margin-bottom: 0;
}

.quote-detail__note {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.quote-detail__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
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

.quote-detail__label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.quote-detail__textarea {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: #fff;
  resize: vertical;
  min-height: 80px;
}

.quote-detail__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.quote-detail__send-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  padding: 0.85rem 1.5rem;
  border-radius: var(--radius-sm);
}

.quote-detail__send-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.quote-detail__send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
