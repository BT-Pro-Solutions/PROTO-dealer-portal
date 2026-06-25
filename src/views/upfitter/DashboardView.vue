<script setup>
import { inject, onMounted, ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'
import { useUpfitterNotifications } from '../../composables/useUpfitterNotifications.js'
import { fetchDealerships } from '../../data/upfitter.js'
import { formatPrice } from '../../data/vehicles.js'
import { useQuoteVehicleImages } from '../../composables/useQuoteVehicleImages.js'
import QuoteRequestRow from '../../components/upfitter/QuoteRequestRow.vue'

const session = inject('session')
const { pendingQuotes, pendingCount, totalQuotedAmount, loadQuotes } = useUpfitterQuotes()
const { pendingUserRequestCount, loadNotifications } = useUpfitterNotifications()
const { ensureCatalog } = useQuoteVehicleImages()

const dealershipCount = ref(0)

onMounted(async () => {
  await Promise.all([loadQuotes(), loadNotifications(), ensureCatalog()])
  const dealerships = await fetchDealerships()
  dealershipCount.value = dealerships.length
})

const metrics = computed(() => [
  {
    label: 'Pending quotes',
    value: pendingCount.value,
    icon: 'mdi:clipboard-text-outline',
    to: { name: 'upfitter-quotes' },
    alert: pendingCount.value > 0,
  },
  {
    label: 'Dealerships',
    value: dealershipCount.value,
    icon: 'mdi:store-outline',
    to: { name: 'upfitter-dealerships' },
    alert: false,
  },
  {
    label: 'User requests',
    value: pendingUserRequestCount.value,
    icon: 'mdi:account-plus-outline',
    to: { name: 'upfitter-dealerships' },
    alert: pendingUserRequestCount.value > 0,
  },
  {
    label: 'Total quoted',
    value: formatPrice(totalQuotedAmount.value),
    icon: 'mdi:currency-usd',
    to: { name: 'upfitter-quotes' },
    alert: false,
  },
])

const recentQuotes = computed(() => pendingQuotes.value.slice(0, 3))
</script>

<template>
  <div class="dashboard page-content page-content--narrow">
    <h1 class="dashboard__title reveal">Welcome, {{ session.userName }}</h1>
    <p class="dashboard__subtitle reveal reveal--delay-1">
      Manage quote requests, dealership partners, and portal access for {{ session.companyName }}.
    </p>

    <div class="dashboard__metrics reveal reveal--delay-2">
      <RouterLink
        v-for="metric in metrics"
        :key="metric.label"
        :to="metric.to"
        class="dashboard__metric"
      >
        <span v-if="metric.alert" class="dashboard__metric-dot" aria-hidden="true"></span>
        <span class="dashboard__metric-icon" aria-hidden="true">
          <Icon :icon="metric.icon" width="20" height="20" />
        </span>
        <span class="dashboard__metric-body">
          <span class="dashboard__metric-value">{{ metric.value }}</span>
          <span class="dashboard__metric-label">{{ metric.label }}</span>
        </span>
      </RouterLink>
    </div>

    <section v-if="recentQuotes.length" class="dashboard__quotes reveal reveal--delay-3">
      <div class="dashboard__section-header">
        <h2 class="dashboard__heading">Recent quote requests</h2>
        <RouterLink :to="{ name: 'upfitter-quotes' }" class="dashboard__link">View all</RouterLink>
      </div>
      <ul class="dashboard__quote-list">
        <li v-for="quote in recentQuotes" :key="quote.id">
          <QuoteRequestRow :quote="quote" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.dashboard__title {
  margin: var(--space-md) 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.dashboard__subtitle {
  margin: 0 0 var(--space-xl);
  color: var(--color-text-muted);
}

.dashboard__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
}

.dashboard__metric {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.dashboard__metric:hover {
  border-color: rgba(0, 0, 0, 0.16);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.dashboard__metric-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--brand-color);
}

.dashboard__metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-bg-search);
  color: var(--color-text-muted);
}

.dashboard__metric-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.dashboard__metric-value {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.5rem;
  line-height: 1.1;
}

.dashboard__metric-label {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.dashboard__quotes {
  margin-bottom: var(--space-2xl);
}

.dashboard__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.dashboard__heading {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
}

.dashboard__link {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.dashboard__quote-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 900px) {
  .dashboard__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
