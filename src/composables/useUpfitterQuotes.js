import { ref, computed } from 'vue'
import { fetchQuotes, submitUpfitterQuote } from '../data/quotes.js'

const quotes = ref([])
let loadPromise = null

async function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = fetchQuotes().then((data) => {
      quotes.value = data
    })
  }
  await loadPromise
  return quotes.value
}

function refreshQuotes() {
  loadPromise = fetchQuotes().then((data) => {
    quotes.value = data
  })
  return loadPromise
}

export function useUpfitterQuotes() {
  const pendingQuotes = computed(() =>
    quotes.value.filter((quote) => quote.status === 'submitted'),
  )

  const pendingCount = computed(() => pendingQuotes.value.length)

  const totalQuotedAmount = computed(() =>
    quotes.value
      .filter((q) => q.status === 'quoted' && q.quotedTotal != null)
      .reduce((sum, q) => sum + q.quotedTotal, 0),
  )

  function getQuotedTotalForDealership(dealershipId) {
    return quotes.value
      .filter(
        (q) =>
          q.dealershipId === dealershipId &&
          q.status === 'quoted' &&
          q.quotedTotal != null,
      )
      .reduce((sum, q) => sum + q.quotedTotal, 0)
  }

  async function loadQuotes() {
    return ensureLoaded()
  }

  function getQuote(id) {
    return quotes.value.find((q) => q.id === id) ?? null
  }

  function getQuotesForDealership(dealershipId) {
    return quotes.value.filter((q) => q.dealershipId === dealershipId)
  }

  async function respondToQuote(quoteId, response) {
    const updated = await submitUpfitterQuote(quoteId, response)
    if (updated) {
      quotes.value = quotes.value.map((q) => (q.id === updated.id ? updated : q))
    }
    return updated
  }

  return {
    quotes,
    pendingQuotes,
    pendingCount,
    totalQuotedAmount,
    loadQuotes,
    refreshQuotes,
    getQuote,
    getQuotesForDealership,
    getQuotedTotalForDealership,
    respondToQuote,
  }
}
