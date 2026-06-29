<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'
import { useQuoteVehicleImages } from '../../composables/useQuoteVehicleImages.js'
import { useDealershipLookup } from '../../composables/useDealershipLookup.js'
import {
  fetchQuoteById,
  formatQuoteDate,
  formatReplyByDate,
  isReplyOverdue,
} from '../../data/quotes.js'
import { upfitterSession } from '../../data/upfitter.js'
import VehicleImagePlaceholder from '../../components/VehicleImagePlaceholder.vue'
import QuoteRepliedToggle from '../../components/upfitter/QuoteRepliedToggle.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { refreshQuotes } = useUpfitterQuotes()
const { ensureCatalog, vehicleImage } = useQuoteVehicleImages()
const { ensureLoaded, getDealership } = useDealershipLookup()

const quote = ref(null)
const loading = ref(true)

const responseDays = upfitterSession.responseDays ?? 3

const dealership = computed(() =>
  quote.value?.dealershipId ? getDealership(quote.value.dealershipId) : null,
)

const replyByLabel = computed(() =>
  quote.value ? formatReplyByDate(quote.value.submittedAt, responseDays) : '—',
)

const replyOverdue = computed(() =>
  quote.value && !quote.value.repliedAt
    ? isReplyOverdue(quote.value.submittedAt, responseDays)
    : false,
)

const customer = computed(() => quote.value?.customer ?? null)

const hasCustomerDetails = computed(() => {
  if (!customer.value) return false
  return Boolean(
    customer.value.name ||
    customer.value.email ||
    customer.value.phone ||
    customer.value.company,
  )
})

function handleRepliedUpdate(updated) {
  quote.value = updated
}

onMounted(async () => {
  await Promise.all([refreshQuotes(), ensureCatalog(), ensureLoaded()])
  quote.value = await fetchQuoteById(props.id)
  loading.value = false

  if (!quote.value) {
    router.replace({ name: 'upfitter-quotes' })
  }
})
</script>

<template>
  <div v-if="loading" class="quote-detail page-content page-content--narrow">
    <p class="quote-detail__loading">Loading information request…</p>
  </div>

  <div v-else-if="quote" class="quote-detail page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-quotes' }" class="quote-detail__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to information requests
    </RouterLink>

    <div class="quote-detail__header reveal reveal--delay-1">
      <div>
        <h1 class="quote-detail__dealer-title">
          {{ dealership?.name ?? quote.dealershipName }}
        </h1>
        <p class="quote-detail__request-id">{{ quote.id }}</p>
      </div>
      <div
        class="quote-detail__reply-by"
        :class="{
          'quote-detail__reply-by--overdue': replyOverdue,
          'quote-detail__reply-by--replied': quote.repliedAt,
        }"
      >
        <template v-if="quote.repliedAt">
          <span class="quote-detail__reply-by-label">Replied</span>
          <span class="quote-detail__reply-by-date">{{ formatQuoteDate(quote.repliedAt) }}</span>
        </template>
        <template v-else>
          <span class="quote-detail__reply-by-label">Reply by</span>
          <span class="quote-detail__reply-by-date">{{ replyByLabel }}</span>
          <span v-if="replyOverdue" class="quote-detail__reply-by-note">Overdue</span>
        </template>

      <QuoteRepliedToggle
        :quote-id="quote.id"
        :replied-at="quote.repliedAt"
        @update="handleRepliedUpdate"
      />
      </div>
    </div>

    <section class="quote-detail__dealer-panel reveal reveal--delay-2">
      <h2 class="quote-detail__heading">Dealership contact</h2>
      <dl class="quote-detail__dealer-fields">
        <div class="quote-detail__dealer-field">
          <dt>Contact</dt>
          <dd>{{ dealership?.contactName ?? '—' }}</dd>
        </div>
        <div class="quote-detail__dealer-field">
          <dt>Phone</dt>
          <dd>
            <a v-if="dealership?.phone" :href="`tel:${dealership.phone}`">{{ dealership.phone }}</a>
            <span v-else>—</span>
          </dd>
        </div>
        <div class="quote-detail__dealer-field">
          <dt>Email</dt>
          <dd>
            <a v-if="dealership?.email" :href="`mailto:${dealership.email}`">{{ dealership.email }}</a>
            <span v-else>—</span>
          </dd>
        </div>
        <div v-if="dealership?.address" class="quote-detail__dealer-field quote-detail__dealer-field--wide">
          <dt>Address</dt>
          <dd>{{ dealership.address }}</dd>
        </div>
        <div class="quote-detail__dealer-field">
          <dt>Submitted</dt>
          <dd>{{ formatQuoteDate(quote.submittedAt) }}</dd>
        </div>
      </dl>
    </section>

    <section class="quote-detail__section reveal reveal--delay-3">
      <h2 class="quote-detail__heading">Vehicles</h2>
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
          </div>
        </li>
      </ul>
    </section>

    <details class="quote-detail__customer" open>
      <summary class="quote-detail__customer-summary">End customer reference</summary>
      <p v-if="!hasCustomerDetails" class="quote-detail__customer-empty">
        No end customer details were included with this request.
      </p>
      <dl v-else class="quote-detail__customer-fields">
        <div v-if="customer.name" class="quote-detail__customer-field">
          <dt>Name</dt>
          <dd>{{ customer.name }}</dd>
        </div>
        <div v-if="customer.email" class="quote-detail__customer-field">
          <dt>Email</dt>
          <dd>{{ customer.email }}</dd>
        </div>
        <div v-if="customer.phone" class="quote-detail__customer-field">
          <dt>Phone</dt>
          <dd>{{ customer.phone }}</dd>
        </div>
        <div v-if="customer.company" class="quote-detail__customer-field">
          <dt>Company</dt>
          <dd>{{ customer.company }}</dd>
        </div>
      </dl>
    </details>

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

.quote-detail__dealer-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1.15;
}

.quote-detail__request-id {
  margin: 0.35rem 0 0;
  font-family: ui-monospace, monospace;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.quote-detail__reply-by {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-pending);
  border-radius: var(--radius-md);
  text-align: right;
}

.quote-detail__reply-by--overdue {
  background: var(--color-on-hold);
}

.quote-detail__reply-by--replied {
  background: var(--color-available);
}

.quote-detail__reply-by--replied .quote-detail__reply-by-label {
  color: #1a5c36;
}

.quote-detail__replied-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.quote-detail__replied-note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-detail__reply-by-label {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-pending-text);
}

.quote-detail__reply-by--overdue .quote-detail__reply-by-label {
  color: #8b0000;
}

.quote-detail__reply-by-date {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 900;
}

.quote-detail__reply-by-note {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b0000;
}

.quote-detail__dealer-panel,
.quote-detail__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
}

.quote-detail__dealer-panel {
  background: var(--color-bg-card);
  color: #fff;
}

.quote-detail__section--note {
  background: #f5f5f5;
  color: inherit;
}

.quote-detail__heading {
  margin: 0 0 var(--space-md);
  font-size: var(--text-base);
  font-weight: 700;
}

.quote-detail__dealer-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  margin: 0;
}

.quote-detail__dealer-field--wide {
  grid-column: 1 / -1;
}

.quote-detail__dealer-field dt {
  font-size: var(--text-xs);
  font-weight: 600;
  color: #ccc;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.quote-detail__dealer-field dd {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
}

.quote-detail__dealer-field a {
  color: #fff;
}

.quote-detail__vehicles {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quote-detail__vehicle {
  display: grid;
  grid-template-columns: 120px 1fr;
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

.quote-detail__vehicle-notes {
  margin: 0.35rem 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.45;
}

.quote-detail__vehicle-notes strong {
  color: var(--color-text);
}

.quote-detail__customer {
  background: #f8f8f8;
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-md);
}

.quote-detail__customer-summary {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  list-style: none;
}

.quote-detail__customer-summary::-webkit-details-marker {
  display: none;
}

.quote-detail__customer-empty {
  margin: var(--space-md) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-detail__customer-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm) var(--space-md);
  margin: var(--space-md) 0 0;
}

.quote-detail__customer-field dt {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.1rem;
}

.quote-detail__customer-field dd {
  margin: 0;
  font-size: var(--text-sm);
}

.quote-detail__note {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .quote-detail__dealer-fields,
  .quote-detail__customer-fields {
    grid-template-columns: 1fr;
  }

  .quote-detail__vehicle {
    grid-template-columns: 1fr;
  }

  .quote-detail__vehicle-image {
    width: 100%;
    height: 160px;
  }

  .quote-detail__reply-by {
    align-items: flex-start;
    text-align: left;
    width: 100%;
  }
}
</style>
