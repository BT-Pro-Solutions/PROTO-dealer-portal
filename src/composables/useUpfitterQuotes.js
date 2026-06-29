import { ref, computed } from 'vue'
import { fetchQuotes, setQuoteReplied as persistQuoteReplied } from '../data/quotes.js'

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

function isUnreplied(quote) {
  return quote.status === 'submitted' && !quote.repliedAt
}

export function useUpfitterQuotes() {
  const pendingQuotes = computed(() => quotes.value.filter(isUnreplied))

  const pendingCount = computed(() => pendingQuotes.value.length)

  const totalRequestCount = computed(() => quotes.value.length)

  function getRequestCountForDealership(dealershipId) {
    return quotes.value.filter((q) => q.dealershipId === dealershipId).length
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

  async function markQuoteReplied(quoteId, replied) {
    const updated = await persistQuoteReplied(quoteId, replied)
    if (updated) {
      quotes.value = quotes.value.map((q) => (q.id === updated.id ? updated : q))
    }
    return updated
  }

  return {
    quotes,
    pendingQuotes,
    pendingCount,
    totalRequestCount,
    loadQuotes,
    refreshQuotes,
    getQuote,
    getQuotesForDealership,
    getRequestCountForDealership,
    markQuoteReplied,
  }
}
