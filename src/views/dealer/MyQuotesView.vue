<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useDealerQuotes } from '../../composables/useDealerQuotes.js'
import { formatQuoteDate } from '../../data/quotes.js'
import { formatPrice } from '../../data/vehicles.js'

const { quotes, loadQuotes } = useDealerQuotes()
const searchQuery = ref('')

onMounted(() => {
  loadQuotes()
})

const filteredQuotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return quotes.value

  return quotes.value.filter(
    (quote) =>
      quote.id.toLowerCase().includes(q) ||
      quote.customer.name.toLowerCase().includes(q),
  )
})

function statusLabel(status) {
  return status === 'quoted' ? 'Quoted' : 'Submitted'
}
</script>

<template>
  <div class="quotes page-content page-content--narrow">
    <RouterLink :to="{ name: 'dealer-inventory' }" class="quotes__back">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to inventory
    </RouterLink>
    
    <h1 class="quotes__title reveal">My Quotes</h1>
    <p class="quotes__subtitle reveal reveal--delay-1">
      Previously submitted quote requests and upfitter responses.
    </p>

    <div class="quotes__search reveal reveal--delay-2">
      <Icon icon="mdi:magnify" width="20" height="20" aria-hidden="true" class="quotes__search-icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="quotes__search-input"
        placeholder="Search by quote ID or customer name"
      />
    </div>

    <ul v-if="filteredQuotes.length" class="quotes__list reveal reveal--delay-3">
      <li v-for="quote in filteredQuotes" :key="quote.id">
        <RouterLink :to="{ name: 'dealer-quote-detail', params: { id: quote.id } }" class="quotes__item">
          <div class="quotes__item-main">
            <div class="quotes__item-top">
              <span class="quotes__item-id">{{ quote.id }}</span>
              <span
                class="quotes__status"
                :class="quote.status === 'quoted' ? 'quotes__status--quoted' : 'quotes__status--submitted'"
              >
                {{ statusLabel(quote.status) }}
              </span>
            </div>
            <p class="quotes__item-customer">{{ quote.customer.name }}</p>
            <p class="quotes__item-meta">
              {{ quote.items.length }} vehicle{{ quote.items.length === 1 ? '' : 's' }}
              · Submitted {{ formatQuoteDate(quote.submittedAt) }}
            </p>
          </div>
          <div class="quotes__item-right">
            <span v-if="quote.quotedTotal" class="quotes__item-total">{{ formatPrice(quote.quotedTotal) }}</span>
            <span v-else class="quotes__item-pending">Awaiting quote</span>
            <Icon icon="mdi:chevron-right" width="22" height="22" aria-hidden="true" />
          </div>
        </RouterLink>
      </li>
    </ul>

    <p v-else class="quotes__empty reveal reveal--delay-3">
      {{ searchQuery.trim() ? 'No quotes match your search.' : 'No quotes yet. Submit a request from inventory to get started.' }}
    </p>

  </div>
</template>

<style scoped>
.quotes__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.quotes__subtitle {
  margin: 0 0 var(--space-xl);
  color: var(--color-text-muted);
}

.quotes__search {
  position: relative;
  margin-bottom: var(--space-xl);
}

.quotes__search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.quotes__search-input {
  width: 100%;
  height: 48px;
  padding: 0 1rem 0 2.75rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-pill);
  background: var(--color-bg-search);
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.quotes__search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.quotes__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quotes__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: background var(--transition-fast);
}

.quotes__item:hover {
  background: #e4e4e4;
}

.quotes__item-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: 0.25rem;
}

.quotes__item-id {
  font-family: ui-monospace, monospace;
  font-size: var(--text-sm);
  font-weight: 700;
}

.quotes__status {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-chip);
}

.quotes__status--submitted {
  background: #fff3cd;
  color: #856404;
}

.quotes__status--quoted {
  background: var(--color-available);
  color: #1a5c36;
}

.quotes__item-customer {
  margin: 0;
  font-weight: 700;
  font-size: var(--text-lg);
}

.quotes__item-meta {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quotes__item-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
  text-align: right;
}

.quotes__item-total {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
}

.quotes__item-pending {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.quotes__empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}

.quotes__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.quotes__back:hover {
  text-decoration: underline;
}
</style>
