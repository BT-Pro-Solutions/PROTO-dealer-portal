<script setup>
import { computed, onMounted } from 'vue'
import { formatQuoteDate, formatQuoteId, formatReplyByDate, isQuoteReplied, isReplyOverdue } from '../../data/quotes.js'
import { upfitterSession } from '../../data/upfitter.js'
import { useQuoteVehicleImages } from '../../composables/useQuoteVehicleImages.js'
import { useDealershipLookup } from '../../composables/useDealershipLookup.js'
import QuoteRepliedToggle from './QuoteRepliedToggle.vue'
import VehicleImagePlaceholder from '../VehicleImagePlaceholder.vue'

const props = defineProps({
  quote: {
    type: Object,
    required: true,
  },
})

const { ensureCatalog, quoteImages } = useQuoteVehicleImages()
const { ensureLoaded, getDealership } = useDealershipLookup()

const responseDays = upfitterSession.responseDays ?? 3

const dealership = computed(() => getDealership(props.quote.dealershipId))

const replyByLabel = computed(() =>
  formatReplyByDate(props.quote.submittedAt, responseDays),
)

const replyOverdue = computed(() =>
  isReplyOverdue(props.quote.submittedAt, responseDays) && !isQuoteReplied(props.quote),
)

onMounted(async () => {
  await Promise.all([ensureCatalog(), ensureLoaded()])
})
</script>

<template>
  <div
    class="quote-row"
    :class="{ 'quote-row--replied': isQuoteReplied(quote) }"
  >
    <RouterLink :to="{ name: 'upfitter-quote-detail', params: { id: quote.id } }" class="quote-row__link">
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
      <span v-if="dealership?.contactName" class="quote-row__dealer-contact">
        {{ dealership.contactName }}
      </span>
      <span class="quote-row__dealer-meta">
        <a
          v-if="dealership?.phone"
          :href="`tel:${dealership.phone}`"
          class="quote-row__dealer-link"
          @click.stop
        >
          {{ dealership.phone }}
        </a>
        <template v-if="dealership?.phone && dealership?.email"> · </template>
        <a
          v-if="dealership?.email"
          :href="`mailto:${dealership.email}`"
          class="quote-row__dealer-link"
          @click.stop
        >
          {{ dealership.email }}
        </a>
      </span>
      <span class="quote-row__quote-id">Request Id {{ formatQuoteId(quote.id) }}</span>
    </div>

    <div class="quote-row__col quote-row__col--vehicles">
      <span class="quote-row__vehicles-count">
        {{ quote.items.length }} Vehicle{{ quote.items.length === 1 ? '' : 's' }}
      </span>
      <span class="quote-row__submitted">
        Submitted {{ formatQuoteDate(quote.submittedAt) }}
      </span>
    </div>

    <div
      class="quote-row__col quote-row__col--date"
      :class="{ 'quote-row__col--overdue': replyOverdue }"
    >
      <span class="quote-row__reply-label">Reply by</span>
      <span class="quote-row__reply-date">{{ replyByLabel }}</span>
      <span v-if="replyOverdue" class="quote-row__overdue">Overdue</span>
    </div>
    </RouterLink>

    <QuoteRepliedToggle
      :quote-id="quote.id"
      :replied-at="quote.repliedAt"
      compact
      class="quote-row__replied"
    />
  </div>
</template>

<style scoped>
.quote-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.quote-row--replied {
  opacity: 0.72;
}

.quote-row__link {
  display: grid;
  grid-template-columns: 88px 1.6fr 1fr 1fr;
  align-items: center;
  gap: var(--space-lg);
  min-width: 0;
  text-decoration: none;
  color: inherit;
  transition: background var(--transition-fast);
  border-radius: var(--radius-sm);
}

.quote-row__link:hover {
  background: rgba(0, 0, 0, 0.02);
}

.quote-row__replied {
  flex-shrink: 0;
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
.quote-row__reply-date {
  font-weight: 700;
  font-size: var(--text-base);
}

.quote-row__dealer-contact {
  font-size: var(--text-sm);
  font-weight: 600;
}

.quote-row__dealer-meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-row__dealer-link {
  color: inherit;
  text-decoration: none;
}

.quote-row__dealer-link:hover {
  text-decoration: underline;
}

.quote-row__quote-id,
.quote-row__submitted,
.quote-row__reply-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quote-row__quote-id {
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-size: var(--text-xs);
}

.quote-row__reply-label {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.quote-row__col--overdue .quote-row__reply-date {
  color: #8b0000;
}

.quote-row__overdue {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #8b0000;
}

@media (max-width: 900px) {
  .quote-row {
    grid-template-columns: 1fr auto;
  }

  .quote-row__link {
    grid-template-columns: 72px 1fr;
    grid-template-rows: auto auto auto;
    gap: var(--space-sm) var(--space-md);
  }

  .quote-row__images {
    grid-row: 1 / 4;
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
    grid-column: 2;
    grid-row: 3;
  }
}

@media (max-width: 540px) {
  .quote-row {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .quote-row__link {
    grid-template-columns: 64px 1fr;
    grid-template-rows: auto auto auto;
  }

  .quote-row__replied {
    justify-self: start;
  }
}
</style>
