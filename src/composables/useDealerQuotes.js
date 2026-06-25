import { ref, computed } from 'vue'
import { fetchQuotes, saveQuote, createQuoteRecord } from '../data/quotes.js'

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

export function useDealerQuotes() {
  const pendingCount = computed(
    () => quotes.value.filter((quote) => quote.status === 'submitted').length,
  )

  async function loadQuotes() {
    return ensureLoaded()
  }

  async function registerQuote(payload, catalog, requestId, dealership = {}) {
    const quote = createQuoteRecord(requestId, payload, catalog, dealership)
    await saveQuote(quote)
    quotes.value = [quote, ...quotes.value.filter((q) => q.id !== quote.id)]
    return quote
  }

  function getQuote(id) {
    return quotes.value.find((q) => q.id === id) ?? null
  }

  return {
    quotes,
    pendingCount,
    loadQuotes,
    refreshQuotes,
    registerQuote,
    getQuote,
  }
}
