const STORAGE_KEY = 'dealer-quotes'
const DELETED_QUOTES_KEY = 'dealer-quotes-deleted'

const seedQuotes = [
  {
    id: 'REQ-20260318-1042',
    status: 'quoted',
    submittedAt: '2026-03-15T14:22:00.000Z',
    quotedAt: '2026-03-16T09:15:00.000Z',
    dealershipId: 'jasper-truck-sales',
    dealershipName: "Jasper Truck Sales",
    customer: {
      name: 'Acme Fleet Services',
      email: 'procurement@acmefleet.example',
      phone: '(555) 410-2200',
      company: 'Acme Fleet Services',
    },
    items: [
      {
        vehicleId: '3',
        title: 'Ford F-450 Super Duty',
        vin: 'XAP3GW9N2FV8M1EU7',
        preUpfitPrice: 67700,
        instructions: 'Flatbed upfit with toolboxes. Need delivery by end of April.',
        quotedPrice: 89400,
      },
    ],
    quotedTotal: 89400,
  },
  {
    id: 'REQ-20260320-0881',
    status: 'submitted',
    submittedAt: '2026-03-20T11:05:00.000Z',
    quotedAt: null,
    dealershipId: 'river-city-trucks',
    dealershipName: 'River City Truck Center',
    customer: {
      name: 'River City Construction',
      email: 'fleet@rivercity.example',
      phone: '(555) 902-1188',
      company: 'River City Construction LLC',
    },
    items: [
      {
        vehicleId: '7',
        title: 'Ford F-550 Super Duty',
        vin: 'M1EU7L0DT6KZCS5JY',
        preUpfitPrice: 64800,
        instructions: 'Service body, crane prep, white exterior.',
        quotedPrice: null,
      },
      {
        vehicleId: '8',
        title: 'Ford F-550 Super Duty',
        vin: '9N2FV8M1EU7L0DT6K',
        preUpfitPrice: 75900,
        instructions: 'Matching pair for fleet order.',
        quotedPrice: null,
      },
    ],
    quotedTotal: null,
  },
  {
    id: 'REQ-20260310-0315',
    status: 'quoted',
    submittedAt: '2026-03-10T16:40:00.000Z',
    quotedAt: '2026-03-12T10:30:00.000Z',
    dealershipId: 'northland-commercial',
    dealershipName: 'Northland Commercial Trucks',
    customer: {
      name: 'Sarah Mitchell',
      email: 's.mitchell@northland.example',
      phone: '(555) 334-9876',
      company: '',
    },
    items: [
      {
        vehicleId: '1',
        title: 'Ford F-350 Super Duty',
        vin: 'ZCS5JYBR4HXAP3GW9',
        preUpfitPrice: 61600,
        instructions: 'Stake bed, gooseneck prep.',
        quotedPrice: 78250,
      },
    ],
    quotedTotal: 78250,
  },
]

function readStoredQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStoredQuotes(quotes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))
  } catch {
    // ignore storage failures
  }
}

function readDeletedQuoteIds() {
  try {
    const raw = localStorage.getItem(DELETED_QUOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeDeletedQuoteIds(ids) {
  try {
    localStorage.setItem(DELETED_QUOTES_KEY, JSON.stringify(ids))
  } catch {
    // ignore storage failures
  }
}

export function createQuoteRecord(requestId, payload, catalog, dealership = {}) {
  const items = payload.items.map((item) => {
    const vehicle = catalog.find((v) => v.id === item.vehicleId)
    return {
      vehicleId: item.vehicleId,
      title: vehicle?.title ?? 'Unknown vehicle',
      vin: vehicle?.vin ?? '',
      preUpfitPrice: vehicle?.preUpfitPrice ?? 0,
      instructions: item.instructions ?? '',
      quotedPrice: null,
    }
  })

  return {
    id: requestId,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    quotedAt: null,
    dealershipId: dealership.id ?? null,
    dealershipName: dealership.name ?? '',
    customer: { ...payload.customer },
    items,
    quotedTotal: null,
  }
}

export async function fetchQuotes() {
  // TODO: return await fetch('/api/dealer/quotes').then(r => r.json())
  const stored = readStoredQuotes()
  const byId = new Map(seedQuotes.map((quote) => [quote.id, quote]))
  for (const quote of stored) {
    byId.set(quote.id, quote)
  }
  const deletedIds = new Set(readDeletedQuoteIds())
  return [...byId.values()]
    .filter((q) => !deletedIds.has(q.id))
    .sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )
}

export async function saveQuote(quote) {
  // TODO: return await fetch('/api/dealer/quotes', { method: 'POST', ... })
  const stored = readStoredQuotes()
  const without = stored.filter((q) => q.id !== quote.id)
  writeStoredQuotes([quote, ...without])
  return quote
}

export async function fetchQuoteById(id) {
  const quotes = await fetchQuotes()
  return quotes.find((q) => q.id === id) ?? null
}

export async function sendQuoteToCustomer(quoteId, { email, message }) {
  // TODO: return await fetch(`/api/dealer/quotes/${quoteId}/send`, { method: 'POST', ... })
  console.info('[dummy] Quote sent to customer:', { quoteId, email, message })
  return { success: true, sentAt: new Date().toISOString() }
}

export async function submitUpfitterQuote(quoteId, response) {
  // TODO: return await fetch(`/api/upfitter/quotes/${quoteId}/respond`, { method: 'POST', ... })
  const { itemPrices, itemComments = {}, generalComment = '', estimatedReadyDate = null } = response
  const quotes = await fetchQuotes()
  const quote = quotes.find((q) => q.id === quoteId)
  if (!quote) return null

  let quotedTotal = 0
  for (const item of quote.items) {
    const price = itemPrices[item.vehicleId]
    if (price != null) {
      item.quotedPrice = Number(price)
      quotedTotal += item.quotedPrice
    }
    item.upfitterComment = itemComments[item.vehicleId]?.trim() ?? ''
  }

  quote.status = 'quoted'
  quote.quotedAt = new Date().toISOString()
  quote.quotedTotal = quotedTotal
  quote.generalComment = generalComment.trim()
  quote.estimatedReadyDate = estimatedReadyDate || null
  await saveQuote(quote)
  return quote
}

export async function deleteQuotesForDealership(dealershipId) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${dealershipId}/quotes`, { method: 'DELETE' })
  const quotes = await fetchQuotes()
  const idsToDelete = quotes
    .filter((q) => q.dealershipId === dealershipId)
    .map((q) => q.id)

  const stored = readStoredQuotes()
  writeStoredQuotes(stored.filter((q) => q.dealershipId !== dealershipId))

  const deleted = new Set(readDeletedQuoteIds())
  for (const id of idsToDelete) deleted.add(id)
  writeDeletedQuoteIds([...deleted])

  return idsToDelete.length
}

export function formatQuoteDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatQuoteDateLong(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatQuoteTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatQuoteId(id) {
  if (!id) return '—'
  const num = id.replace(/\D/g, '').slice(-4)
  return num || id
}
