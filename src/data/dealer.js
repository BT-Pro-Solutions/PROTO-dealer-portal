/**
 * Dealer session & upfitter context.
 * Replace fetchDealerSession() with a real API call when backend is ready.
 */
export const dealerSession = {
  userName: 'John Dealershipman',
  email: 'john@bobstrucks.example',
  phone: '(555) 867-5309',
  dealershipName: "Bob's Emporium of Trucks",
  dealershipAddress: '1234 Truck Lane, Motor City, MI 48201',
  upfitterName: 'Zoresco',
}

export const upfitterContact = {
  name: 'Zoresco',
  phone: '(800) 555-0199',
  email: 'quotes@zoresco.example',
  address: '500 Industrial Parkway, Cleveland, OH 44101',
  hours: 'Mon–Fri, 8:00 AM – 5:00 PM ET',
}

export const upfitterProfile = {
  name: 'Zoresco',
  logoUrl: '/assets/Dealer-Logo.svg',
  logoAlt: 'Zoresco',
  headline: 'Why buy from Zoresco',
  body: [
    'For over four decades, Zoresco has been a trusted partner to commercial truck dealers nationwide. We specialize in chassis upfitting, fleet-ready builds, and turnkey delivery so your customers get on the road faster.',
    'Every vehicle in this portal is backed by our in-house engineering team, factory-direct relationships, and a dedicated dealer support line. When you request a quote, you are working directly with the upfitter — not a middleman.',
    'From service bodies and flatbeds to custom upfits, Zoresco delivers quality craftsmanship, transparent lead times, and competitive pricing built for dealer success.',
  ],
}

export async function fetchDealerSession() {
  // TODO: return await fetch('/api/dealer/session').then(r => r.json())
  return dealerSession
}

export async function fetchUpfitterContact() {
  // TODO: return await fetch('/api/dealer/upfitter-contact').then(r => r.json())
  return upfitterContact
}

export async function fetchUpfitterProfile() {
  // TODO: return await fetch('/api/dealer/upfitter-profile').then(r => r.json())
  return upfitterProfile
}

export const portalUsers = [
  {
    id: '1',
    name: 'John Dealershipman',
    email: 'john@bobstrucks.example',
    role: 'Admin',
  },
  {
    id: '2',
    name: 'Jane Sales',
    email: 'jane@bobstrucks.example',
    role: 'Sales',
  },
  {
    id: '3',
    name: 'Mike Fleet',
    email: 'mike@bobstrucks.example',
    role: 'Sales',
  },
]

export async function fetchPortalUsers() {
  // TODO: return await fetch('/api/dealer/portal-users').then(r => r.json())
  return portalUsers
}

export async function requestPortalUser({ name, email, role, notes }) {
  // TODO: return await fetch('/api/dealer/portal-users/requests', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, email, role, notes }),
  // }).then(r => r.json())
  console.info('[dummy] Portal user request submitted:', { name, email, role, notes })
  return { success: true, requestId: `USR-${Date.now()}` }
}
