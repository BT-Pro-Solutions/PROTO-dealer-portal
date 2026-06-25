<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { fetchDealerships } from '../../data/upfitter.js'
import { formatPrice } from '../../data/vehicles.js'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'

const dealerships = ref([])
const searchQuery = ref('')
const { loadQuotes, quotes, getQuotedTotalForDealership } = useUpfitterQuotes()

onMounted(async () => {
  await loadQuotes()
  dealerships.value = await fetchDealerships()
})

const filteredDealerships = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return dealerships.value

  return dealerships.value.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.contactName.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q),
  )
})

function pendingQuoteCount(dealershipId) {
  return quotes.value.filter(
    (q) => q.dealershipId === dealershipId && q.status === 'submitted',
  ).length
}
</script>

<template>
  <div class="dealerships page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-dashboard' }" class="dealerships__back">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to dashboard
    </RouterLink>

    <div class="dealerships__header reveal">
      <div>
        <h1 class="dealerships__title">Dealership Partners</h1>
        <p class="dealerships__subtitle reveal reveal--delay-1">
          Manage contact info, brand access, and quote activity for each dealership.
        </p>
      </div>
      <RouterLink :to="{ name: 'upfitter-dealership-new' }" class="dealerships__add-btn reveal reveal--delay-1">
        <Icon icon="mdi:store-plus-outline" width="18" height="18" aria-hidden="true" />
        Add dealer
      </RouterLink>
    </div>

    <div class="dealerships__search reveal reveal--delay-2">
      <Icon icon="mdi:magnify" width="20" height="20" aria-hidden="true" class="dealerships__search-icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="dealerships__search-input"
        placeholder="Search dealerships"
      />
    </div>

    <ul v-if="filteredDealerships.length" class="dealerships__list reveal reveal--delay-3">
      <li v-for="dealer in filteredDealerships" :key="dealer.id">
        <RouterLink
          :to="{ name: 'upfitter-dealership-detail', params: { id: dealer.id } }"
          class="dealerships__item"
        >
          <div class="dealerships__item-main">
            <span class="dealerships__item-name">{{ dealer.name }}</span>
            <span class="dealerships__item-contact">{{ dealer.contactName }} · {{ dealer.email }}</span>
            <span class="dealerships__item-brands">
              {{ dealer.allowedBrands.join(', ') }}
            </span>
          </div>
          <div class="dealerships__item-right">
            <span class="dealerships__item-quoted">
              {{ formatPrice(getQuotedTotalForDealership(dealer.id)) }} quoted
            </span>
            <span v-if="pendingQuoteCount(dealer.id) > 0" class="dealerships__item-badge">
              {{ pendingQuoteCount(dealer.id) }} pending
            </span>
            <Icon icon="mdi:chevron-right" width="22" height="22" aria-hidden="true" />
          </div>
        </RouterLink>
      </li>
    </ul>

    <p v-else class="dealerships__empty reveal reveal--delay-3">
      {{ searchQuery.trim() ? 'No dealerships match your search.' : 'No dealership partners found.' }}
    </p>
  </div>
</template>

<style scoped>
.dealerships__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.dealerships__header .dealerships__title {
  margin: 0 0 var(--space-xs);
}

.dealerships__header .dealerships__subtitle {
  margin: 0;
}

.dealerships__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: 50px;
  font-weight: 700;
  font-size: var(--text-sm);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.dealerships__add-btn:hover {
  opacity: 0.85;
}

.dealerships__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.dealerships__subtitle {
  color: var(--color-text-muted);
}

.dealerships__search {
  position: relative;
  margin-bottom: var(--space-xl);
}

.dealerships__search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.dealerships__search-input {
  width: 100%;
  height: 48px;
  padding: 0 1rem 0 2.75rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-pill);
  background: var(--color-bg-search);
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.dealerships__search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.dealerships__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dealerships__item {
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

.dealerships__item:hover {
  background: #e4e4e4;
}

.dealerships__item-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dealerships__item-name {
  font-weight: 700;
  font-size: var(--text-lg);
}

.dealerships__item-contact {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dealerships__item-brands {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.dealerships__item-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.dealerships__item-quoted {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}

.dealerships__item-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-chip);
  background: var(--color-pending);
  color: var(--color-pending-text);
}

.dealerships__empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
}

.dealerships__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-xl);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.dealerships__back:hover {
  text-decoration: underline;
}
</style>
