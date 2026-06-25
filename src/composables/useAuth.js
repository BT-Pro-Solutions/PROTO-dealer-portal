const AUTH_KEY = 'dealer-authenticated'

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function signIn() {
  sessionStorage.setItem(AUTH_KEY, '1')
}

export function signOut() {
  sessionStorage.removeItem(AUTH_KEY)
}
