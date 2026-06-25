const STORAGE_KEY = 'dealer-quotes'

const seedQuotes = [
  {
    id: 'REQ-20260318-1042',
    status: 'quoted',
    submittedAt: '2026-03-15T14:22:00.000Z',
    quotedAt: '2026-03-16T09:15:00.000Z',
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

export function createQuoteRecord(requestId, payload, catalog) {
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
  return [...byId.values()].sort(
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

export function formatQuoteDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
