/**
 * Upfitter session, dealerships, and notifications.
 * Replace fetch functions with real API calls when backend is ready.
 */

import { deleteQuotesForDealership } from './quotes.js'

export const upfitterSession = {
  userName: 'Pat Richardson',
  email: 'pat@zoresco.example',
  phone: '(800) 555-0199',
  companyName: 'Zoresco',
  logoUrl: '/assets/Dealer-Logo.svg',
  logoAlt: 'Zoresco',
  brandColor: '#c41230',
  address: '500 Industrial Parkway, Cleveland, OH 44101',
  hours: 'Mon–Fri, 8:00 AM – 5:00 PM ET',
  headline: 'Why buy from Zoresco',
  body: [
    'For over four decades, Zoresco has been a trusted partner to commercial truck dealers nationwide.',
    'From service bodies and flatbeds to custom upfits, Zoresco delivers quality craftsmanship and competitive pricing.',
  ],
}

export const availableBrands = ['Ford', 'Chevrolet', 'RAM', 'International', 'Freightliner', 'GMC']

export const dealerships = [
  {
    id: 'jasper-truck-sales',
    name: "Jasper Truck Sales",
    address: '1234 Truck Lane, Motor City, MI 48201',
    phone: '(555) 867-5309',
    email: 'contact@jaspertrucks.example',
    contactName: 'John Smithington',
    allowedBrands: ['Ford', 'Chevrolet'],
  },
  {
    id: 'northland-commercial',
    name: 'Northland Commercial Trucks',
    address: '8900 Highway 10, Duluth, MN 55807',
    phone: '(555) 334-9876',
    email: 'sales@northland.example',
    contactName: 'Sarah Mitchell',
    allowedBrands: ['Ford', 'RAM', 'Freightliner'],
  },
  {
    id: 'river-city-trucks',
    name: 'River City Truck Center',
    address: '2200 River Rd, Louisville, KY 40202',
    phone: '(555) 902-1188',
    email: 'fleet@rivercity.example',
    contactName: 'Mike Torres',
    allowedBrands: ['Ford', 'International'],
  },
]

export const dealershipUsers = {
  'jasper-truck-sales': [
    { id: '1', name: 'John Dealershipman', email: 'john@bobstrucks.example', role: 'Admin' },
    { id: '2', name: 'Jane Sales', email: 'jane@bobstrucks.example', role: 'Sales' },
    { id: '3', name: 'Mike Fleet', email: 'mike@bobstrucks.example', role: 'Sales' },
  ],
  'northland-commercial': [
    { id: '4', name: 'Sarah Mitchell', email: 's.mitchell@northland.example', role: 'Admin' },
    { id: '5', name: 'Tom Werner', email: 't.werner@northland.example', role: 'Sales' },
  ],
  'river-city-trucks': [
    { id: '6', name: 'Mike Torres', email: 'fleet@rivercity.example', role: 'Admin' },
  ],
}

export const pendingUserRequests = [
  {
    id: 'USR-20260322-001',
    dealershipId: 'jasper-truck-sales',
    dealershipName: "Jasper Truck Sales",
    name: 'Alex Porter',
    email: 'alex@bobstrucks.example',
    role: 'Sales',
    notes: 'New sales rep, needs inventory access.',
    requestedAt: '2026-03-22T09:30:00.000Z',
  },
  {
    id: 'USR-20260321-004',
    dealershipId: 'northland-commercial',
    dealershipName: 'Northland Commercial Trucks',
    name: 'Chris Nguyen',
    email: 'c.nguyen@northland.example',
    role: 'View only',
    notes: '',
    requestedAt: '2026-03-21T14:15:00.000Z',
  },
]

export const notifications = [
  {
    id: 'notif-1',
    type: 'quote',
    title: 'New quote request',
    message: 'River City Construction submitted REQ-20260320-0881 (2 vehicles).',
    quoteId: 'REQ-20260320-0881',
    dealershipId: 'river-city-trucks',
    createdAt: '2026-03-20T11:05:00.000Z',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'user',
    title: 'User access request',
    message: 'Jasper Truck Sales requested portal access for Alex Porter.',
    requestId: 'USR-20260322-001',
    dealershipId: 'jasper-truck-sales',
    createdAt: '2026-03-22T09:30:00.000Z',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'user',
    title: 'User access request',
    message: 'Northland Commercial Trucks requested portal access for Chris Nguyen.',
    requestId: 'USR-20260321-004',
    dealershipId: 'northland-commercial',
    createdAt: '2026-03-21T14:15:00.000Z',
    read: true,
  },
]

export async function fetchUpfitterSession() {
  // TODO: return await fetch('/api/upfitter/session').then(r => r.json())
  return { ...upfitterSession }
}

export async function fetchDealerships() {
  // TODO: return await fetch('/api/upfitter/dealerships').then(r => r.json())
  return dealerships.map((d) => ({ ...d }))
}

export async function fetchDealershipById(id) {
  const list = await fetchDealerships()
  return list.find((d) => d.id === id) ?? null
}

export async function updateDealership(id, updates) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${id}`, { method: 'PATCH', ... })
  const dealer = dealerships.find((d) => d.id === id)
  if (!dealer) return null
  Object.assign(dealer, updates)
  return { ...dealer }
}

function slugifyDealershipName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function uniqueDealershipId(name) {
  const base = slugifyDealershipName(name) || 'dealership'
  let id = base
  let counter = 2
  while (dealerships.some((d) => d.id === id)) {
    id = `${base}-${counter}`
    counter += 1
  }
  return id
}

export async function createDealership({ name, contactName, phone, email, address, allowedBrands }) {
  // TODO: return await fetch('/api/upfitter/dealerships', { method: 'POST', ... })
  const dealer = {
    id: uniqueDealershipId(name),
    name: name.trim(),
    contactName: contactName.trim(),
    phone: phone.trim(),
    email: email.trim(),
    address: address.trim(),
    allowedBrands: [...allowedBrands],
  }
  dealerships.push(dealer)
  dealershipUsers[dealer.id] = []
  return { ...dealer }
}

export async function deleteDealership(id) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${id}`, { method: 'DELETE' })
  const idx = dealerships.findIndex((d) => d.id === id)
  if (idx === -1) return { success: false }

  const dealer = dealerships[idx]
  const deletedQuotes = await deleteQuotesForDealership(id)

  for (let i = pendingUserRequests.length - 1; i >= 0; i -= 1) {
    if (pendingUserRequests[i].dealershipId === id) {
      pendingUserRequests.splice(i, 1)
    }
  }

  for (let i = notifications.length - 1; i >= 0; i -= 1) {
    if (notifications[i].dealershipId === id) {
      notifications.splice(i, 1)
    }
  }

  delete dealershipUsers[id]
  dealerships.splice(idx, 1)

  return { success: true, name: dealer.name, deletedQuotes }
}

export async function fetchDealershipUsers(dealershipId) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${dealershipId}/users`).then(r => r.json())
  return (dealershipUsers[dealershipId] ?? []).map((u) => ({ ...u }))
}

export async function createDealershipUser(dealershipId, { name, email, role }) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${dealershipId}/users`, { method: 'POST', ... })
  const users = dealershipUsers[dealershipId] ?? []
  const user = {
    id: String(Date.now()),
    name: name.trim(),
    email: email.trim(),
    role,
  }
  users.push(user)
  dealershipUsers[dealershipId] = users
  return { ...user }
}

export async function updateDealershipUser(dealershipId, userId, { name, email, role }) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${dealershipId}/users/${userId}`, { method: 'PATCH', ... })
  const users = dealershipUsers[dealershipId] ?? []
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  user.name = name.trim()
  user.email = email.trim()
  user.role = role
  return { ...user }
}

export async function deleteDealershipUser(dealershipId, userId) {
  // TODO: return await fetch(`/api/upfitter/dealerships/${dealershipId}/users/${userId}`, { method: 'DELETE' })
  const users = dealershipUsers[dealershipId] ?? []
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return { success: false }
  users.splice(idx, 1)
  return { success: true }
}

export async function fetchPendingUserRequests() {
  // TODO: return await fetch('/api/upfitter/user-requests').then(r => r.json())
  return pendingUserRequests.map((r) => ({ ...r }))
}

export async function approveUserRequest(requestId) {
  // TODO: return await fetch(`/api/upfitter/user-requests/${requestId}/approve`, { method: 'POST' })
  const idx = pendingUserRequests.findIndex((r) => r.id === requestId)
  if (idx === -1) return { success: false }
  const request = pendingUserRequests.splice(idx, 1)[0]
  const users = dealershipUsers[request.dealershipId] ?? []
  users.push({
    id: String(Date.now()),
    name: request.name,
    email: request.email,
    role: request.role,
  })
  dealershipUsers[request.dealershipId] = users
  return { success: true }
}

export async function denyUserRequest(requestId) {
  // TODO: return await fetch(`/api/upfitter/user-requests/${requestId}/deny`, { method: 'POST' })
  const idx = pendingUserRequests.findIndex((r) => r.id === requestId)
  if (idx === -1) return { success: false }
  pendingUserRequests.splice(idx, 1)
  return { success: true }
}

export async function fetchNotifications() {
  // TODO: return await fetch('/api/upfitter/notifications').then(r => r.json())
  return notifications.map((n) => ({ ...n }))
}

export async function markNotificationRead(id) {
  const notif = notifications.find((n) => n.id === id)
  if (notif) notif.read = true
  return notif
}

export async function updateUpfitterProfile(updates) {
  // TODO: return await fetch('/api/upfitter/profile', { method: 'PATCH', ... })
  Object.assign(upfitterSession, updates)
  return { ...upfitterSession }
}

export async function searchUpfitters(query) {
  // TODO: return await fetch(`/api/upfitters/search?q=${encodeURIComponent(query)}`).then(r => r.json())
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches = [{ id: 'zoresco', name: 'Zoresco', logoUrl: '/assets/Dealer-Logo.svg' }]
  return matches.filter((u) => u.name.toLowerCase().includes(q))
}
