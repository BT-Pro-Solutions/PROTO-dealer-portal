/** Resolve a path under Vite's public/ folder for the current deploy base. */
export function resolvePublicUrl(url) {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  const path = url.startsWith('/') ? url.slice(1) : url
  return `${import.meta.env.BASE_URL}${path}`
}
