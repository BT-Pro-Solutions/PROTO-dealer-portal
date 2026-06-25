const PORTALS = ['dealer', 'upfitter', 'admin']

function authKey(portal) {
  return `${portal}-authenticated`
}

export function isAuthenticated(portal) {
  if (portal) {
    return sessionStorage.getItem(authKey(portal)) === '1'
  }
  return PORTALS.some((p) => sessionStorage.getItem(authKey(p)) === '1')
}

export function getActivePortal() {
  return PORTALS.find((p) => sessionStorage.getItem(authKey(p)) === '1') ?? null
}

export function signIn(portal = 'dealer') {
  sessionStorage.setItem(authKey(portal), '1')
}

export function signOut(portal) {
  if (portal) {
    sessionStorage.removeItem(authKey(portal))
    return
  }
  for (const p of PORTALS) {
    sessionStorage.removeItem(authKey(p))
  }
}

export function portalHomeRoute(portal) {
  switch (portal) {
    case 'upfitter':
      return { name: 'upfitter-dashboard' }
    case 'admin':
      return { name: 'admin-dashboard' }
    default:
      return { name: 'dealer-inventory' }
  }
}

export function portalLoginRoute(portal) {
  switch (portal) {
    case 'upfitter':
      return { name: 'upfitter-login' }
    case 'admin':
      return { name: 'admin-login' }
    default:
      return { name: 'dealer-login' }
  }
}
