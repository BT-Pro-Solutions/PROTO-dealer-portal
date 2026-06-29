const STORAGE_KEY = 'dealer-quotes'
const DELETED_QUOTES_KEY = 'dealer-quotes-deleted'

const seedQuotes = [
  {
    id: 'REQ-20260318-1042',
    status: 'submitted',
    submittedAt: '2026-03-15T14:22:00.000Z',
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
        instructions: 'Flatbed upfit with toolboxes. Need delivery by end of April.',
      },
    ],
  },
  {
    id: 'REQ-20260320-0881',
    status: 'submitted',
    submittedAt: '2026-03-20T11:05:00.000Z',
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
        instructions: 'Service body, crane prep, white exterior.',
      },
      {
        vehicleId: '8',
        title: 'Ford F-550 Super Duty',
        vin: '9N2FV8M1EU7L0DT6K',
        instructions: 'Matching pair for fleet order.',
      },
    ],
  },
  {
    id: 'REQ-20260310-0315',
    status: 'submitted',
    submittedAt: '2026-03-10T16:40:00.000Z',
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
        instructions: 'Stake bed, gooseneck prep.',
      },
    ],
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

function normalizeCustomer(customer) {
  if (!customer || typeof customer !== 'object') {
    return { name: '', email: '', phone: '', company: '' }
  }
  return {
    name: customer.name ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    company: customer.company ?? '',
  }
}

function normalizeQuote(quote, seedQuote = null) {
  const normalized = {
    ...quote,
    customer: normalizeCustomer(quote.customer),
    repliedAt: quote.repliedAt ?? null,
  }

  const seedCustomer = seedQuote ? normalizeCustomer(seedQuote.customer) : null
  if (
    seedCustomer &&
    !normalized.customer.name &&
    !normalized.customer.email &&
    (seedCustomer.name || seedCustomer.email)
  ) {
    normalized.customer = seedCustomer
  }

  return normalized
}

export function createQuoteRecord(requestId, payload, catalog, dealership = {}) {
  const items = payload.items.map((item) => {
    const vehicle = catalog.find((v) => v.id === item.vehicleId)
    return {
      vehicleId: item.vehicleId,
      title: vehicle?.title ?? 'Unknown vehicle',
      vin: vehicle?.vin ?? '',
      instructions: item.instructions ?? '',
    }
  })

  return {
    id: requestId,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    dealershipId: dealership.id ?? null,
    dealershipName: dealership.name ?? '',
    customer: normalizeCustomer(payload.customer),
    items,
    repliedAt: null,
  }
}

export async function fetchQuotes() {
  // TODO: return await fetch('/api/dealer/quotes').then(r => r.json())
  const stored = readStoredQuotes()
  const seedById = new Map(seedQuotes.map((quote) => [quote.id, quote]))
  const byId = new Map(seedQuotes.map((quote) => [quote.id, normalizeQuote(quote)]))
  for (const quote of stored) {
    byId.set(quote.id, normalizeQuote(quote, seedById.get(quote.id)))
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
  const normalized = normalizeQuote(quote)
  const stored = readStoredQuotes()
  const without = stored.filter((q) => q.id !== normalized.id)
  writeStoredQuotes([normalized, ...without])
  return normalized
}

export async function fetchQuoteById(id) {
  const quotes = await fetchQuotes()
  return quotes.find((q) => q.id === id) ?? null
}

export function isQuoteReplied(quote) {
  return Boolean(quote?.repliedAt)
}

export async function setQuoteReplied(quoteId, replied) {
  // TODO: return await fetch(`/api/upfitter/quotes/${quoteId}/replied`, { method: 'PATCH', ... })
  const quotes = await fetchQuotes()
  const quote = quotes.find((q) => q.id === quoteId)
  if (!quote) return null

  quote.repliedAt = replied ? new Date().toISOString() : null
  return saveQuote(quote)
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

export function addBusinessDays(iso, days) {
  const date = new Date(iso)
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) added += 1
  }
  return date
}

export function getReplyByDate(submittedAt, responseDays = 3) {
  if (!submittedAt) return null
  return addBusinessDays(submittedAt, responseDays)
}

export function formatReplyByDate(submittedAt, responseDays = 3) {
  const date = getReplyByDate(submittedAt, responseDays)
  if (!date) return '—'
  return formatQuoteDateLong(date.toISOString())
}

export function isReplyOverdue(submittedAt, responseDays = 3) {
  const replyBy = getReplyByDate(submittedAt, responseDays)
  if (!replyBy) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  replyBy.setHours(0, 0, 0, 0)
  return replyBy < today
}
