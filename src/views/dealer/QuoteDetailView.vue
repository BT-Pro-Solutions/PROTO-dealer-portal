<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useDealerQuotes } from '../../composables/useDealerQuotes.js'
import { fetchQuoteById, formatQuoteDate } from '../../data/quotes.js'
import { fetchUpfitterContact } from '../../data/dealer.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { loadQuotes, getQuote } = useDealerQuotes()

const quote = ref(null)
const upfitter = ref(null)
const loading = ref(true)

const responseDaysLabel = computed(() => {
  const days = upfitter.value?.responseDays ?? 2
  return `2 business days`
})

onMounted(async () => {
  await loadQuotes()
  upfitter.value = await fetchUpfitterContact()
  quote.value = getQuote(props.id) ?? (await fetchQuoteById(props.id))
  loading.value = false

  if (!quote.value) {
    router.replace({ name: 'dealer-my-quotes' })
  }
})
</script>

<template>
  <div v-if="loading" class="quote-detail page-content page-content--narrow">
    <p class="quote-detail__loading">Loading request…</p>
  </div>

  <div v-else-if="quote" class="quote-detail page-content page-content--narrow">
    <RouterLink :to="{ name: 'dealer-my-quotes' }" class="quote-detail__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to My Requests
    </RouterLink>

    <div class="quote-detail__header reveal reveal--delay-1">
      <div>
        <h1 class="quote-detail__title">{{ quote.id }}</h1>
        <p class="quote-detail__customer">{{ quote.customer.name }}</p>
      </div>
      <span class="quote-detail__status">Submitted</span>
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
        </li>
      </ul>
    </section>

    <section class="quote-detail__section quote-detail__section--muted reveal reveal--delay-5">
      <p class="quote-detail__note">
        Your upfitter will be in contact with you regarding this request within
        {{ responseDaysLabel }}.
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
  background: #fff3cd;
  color: #856404;
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
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quote-detail__vehicle {
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

.quote-detail__note {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.5;
}
</style>
