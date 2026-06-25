<script setup>
import { onMounted } from 'vue'
import { formatQuoteDateLong, formatQuoteTime, formatQuoteId } from '../../data/quotes.js'
import { formatPrice } from '../../data/vehicles.js'
import { useQuoteVehicleImages } from '../../composables/useQuoteVehicleImages.js'
import VehicleImagePlaceholder from '../VehicleImagePlaceholder.vue'

defineProps({
  quote: {
    type: Object,
    required: true,
  },
})

const { ensureCatalog, quoteImages, baseValue } = useQuoteVehicleImages()

onMounted(() => {
  ensureCatalog()
})
</script>

<template>
  <RouterLink :to="{ name: 'upfitter-quote-detail', params: { id: quote.id } }" class="quote-row">
    <div class="quote-row__images">
      <div
        class="quote-row__image-stack"
        :class="{ 'quote-row__image-stack--single': quoteImages(quote).length <= 1 }"
      >
        <template v-if="quoteImages(quote).length">
          <img
            v-for="(src, index) in quoteImages(quote)"
            :key="`${quote.id}-${index}`"
            :src="src"
            :alt="quote.items[index]?.title ?? 'Vehicle'"
            class="quote-row__image"
            loading="lazy"
          />
        </template>
        <div v-else class="quote-row__image quote-row__image--placeholder">
          <VehicleImagePlaceholder compact :alt="`${quote.items[0]?.title ?? 'Vehicle'} — no photo`" />
        </div>
      </div>
    </div>

    <div class="quote-row__col quote-row__col--dealer">
      <span class="quote-row__dealer-name">{{ quote.dealershipName }}</span>
      <span class="quote-row__quote-id">Quote Id {{ formatQuoteId(quote.id) }}</span>
    </div>

    <div class="quote-row__col quote-row__col--vehicles">
      <span class="quote-row__vehicles-count">
        {{ quote.items.length }} Vehicle{{ quote.items.length === 1 ? '' : 's' }}
      </span>
      <span class="quote-row__base-value">{{ formatPrice(baseValue(quote)) }} base value</span>
    </div>

    <div class="quote-row__col quote-row__col--date">
      <span class="quote-row__date">{{ formatQuoteDateLong(quote.submittedAt) }}</span>
      <span class="quote-row__time">{{ formatQuoteTime(quote.submittedAt) }}</span>
    </div>

    <span
      class="quote-row__action"
      :class="quote.status === 'submitted' ? 'quote-row__action--review' : 'quote-row__action--view'"
    >
      {{ quote.status === 'submitted' ? 'Review' : 'View' }}
    </span>
  </RouterLink>
</template>

<style scoped>
.quote-row {
  display: grid;
  grid-template-columns: 88px 1.4fr 1.2fr 1fr auto;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: background var(--transition-fast);
}

.quote-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.quote-row__images {
  flex-shrink: 0;
}

.quote-row__image-stack {
  position: relative;
  width: 76px;
  height: 54px;
}

.quote-row__image-stack--single {
  width: 64px;
  height: 44px;
}

.quote-row__image {
  position: absolute;
  width: 64px;
  height: 44px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.quote-row__image-stack--single .quote-row__image {
  position: static;
  width: 100%;
  height: 100%;
}

.quote-row__image:nth-child(1) {
  top: 0;
  left: 0;
  z-index: 3;
}

.quote-row__image:nth-child(2) {
  top: 5px;
  left: 8px;
  z-index: 2;
  opacity: 0.88;
}

.quote-row__image:nth-child(3) {
  top: 10px;
  left: 16px;
  z-index: 1;
  opacity: 0.76;
}

.quote-row__image--placeholder {
  position: static;
  width: 64px;
  height: 44px;
  overflow: hidden;
  border-radius: 4px;
}

.quote-row__col {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.quote-row__dealer-name,
.quote-row__vehicles-count,
.quote-row__date {
  font-weight: 700;
  font-size: var(--text-base);
}

.quote-row__quote-id,
.quote-row__base-value,
.quote-row__time {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-row__quote-id {
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-size: var(--text-xs);
}

.quote-row__action {
  flex-shrink: 0;
  padding: 0.55rem 1.75rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-sm);
  white-space: nowrap;
}

.quote-row__action--review {
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  background: #fff;
}

.quote-row__action--view {
  border: 2px solid #ccc;
  color: #999;
  background: #fff;
}

.quote-row:hover .quote-row__action--review {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

@media (max-width: 900px) {
  .quote-row {
    grid-template-columns: 72px 1fr auto;
    grid-template-rows: auto auto;
    gap: var(--space-sm) var(--space-md);
  }

  .quote-row__images {
    grid-row: 1 / 3;
  }

  .quote-row__col--dealer {
    grid-column: 2;
  }

  .quote-row__col--vehicles {
    grid-column: 2;
    grid-row: 2;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
  }

  .quote-row__col--date {
    display: none;
  }

  .quote-row__action {
    grid-column: 3;
    grid-row: 1 / 3;
    align-self: center;
  }
}

@media (max-width: 540px) {
  .quote-row {
    grid-template-columns: 64px 1fr;
    grid-template-rows: auto auto auto;
  }

  .quote-row__action {
    grid-column: 1 / -1;
    grid-row: 3;
    justify-self: start;
    margin-top: var(--space-xs);
  }
}
</style>
