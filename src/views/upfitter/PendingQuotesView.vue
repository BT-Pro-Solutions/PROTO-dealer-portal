<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'
import { useQuoteVehicleImages } from '../../composables/useQuoteVehicleImages.js'
import QuoteRequestRow from '../../components/upfitter/QuoteRequestRow.vue'

const { quotes, loadQuotes } = useUpfitterQuotes()
const { ensureCatalog } = useQuoteVehicleImages()
const searchQuery = ref('')
const sortBy = ref('unreviewed')

onMounted(async () => {
  await Promise.all([loadQuotes(), ensureCatalog()])
})

const filteredQuotes = computed(() => {
  let list = [...quotes.value]
  const q = searchQuery.value.trim().toLowerCase()

  if (q) {
    list = list.filter(
      (quote) =>
        quote.id.toLowerCase().includes(q) ||
        quote.dealershipName?.toLowerCase().includes(q) ||
        quote.customer.name.toLowerCase().includes(q),
    )
  }

  switch (sortBy.value) {
    case 'newest':
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      break
    case 'oldest':
      list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
      break
    case 'dealership':
      list.sort((a, b) => (a.dealershipName ?? '').localeCompare(b.dealershipName ?? ''))
      break
    default:
      list.sort((a, b) => {
        const aPending = a.status === 'submitted' ? 0 : 1
        const bPending = b.status === 'submitted' ? 0 : 1
        if (aPending !== bPending) return aPending - bPending
        return new Date(b.submittedAt) - new Date(a.submittedAt)
      })
  }

  return list
})
</script>

<template>
  <div class="quotes page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-dashboard' }" class="quotes__back">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to dashboard
    </RouterLink>

    <div class="quotes__header reveal">
      <h1 class="quotes__title">Quote Requests</h1>
      <label class="quotes__sort">
        <span class="quotes__sort-label">Sort By:</span>
        <select v-model="sortBy" class="quotes__sort-select">
          <option value="unreviewed">Unreviewed</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="dealership">Dealership</option>
        </select>
      </label>
    </div>

    <div class="quotes__search reveal reveal--delay-1">
      <Icon icon="mdi:magnify" width="20" height="20" aria-hidden="true" class="quotes__search-icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="quotes__search-input"
        placeholder="Search by quote ID, dealership, or customer"
      />
    </div>

    <ul v-if="filteredQuotes.length" class="quotes__list reveal reveal--delay-2">
      <li v-for="quote in filteredQuotes" :key="quote.id">
        <QuoteRequestRow :quote="quote" />
      </li>
    </ul>

    <p v-else class="quotes__empty reveal reveal--delay-2">
      {{ searchQuery.trim() ? 'No quotes match your search.' : 'No quote requests yet.' }}
    </p>
  </div>
</template>

<style scoped>
.quotes__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  margin-bottom: var(--space-lg);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.quotes__back:hover {
  text-decoration: underline;
}

.quotes__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.quotes__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.quotes__sort {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-sm);
}

.quotes__sort-label {
  color: var(--color-text-muted);
  white-space: nowrap;
}

.quotes__sort-select {
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  padding: 0;
}

.quotes__sort-select:focus {
  outline: none;
  text-decoration: underline;
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
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.quotes__empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 540px) {
  .quotes__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
