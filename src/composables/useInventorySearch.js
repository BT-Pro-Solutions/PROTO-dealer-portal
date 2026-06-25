import { ref } from 'vue'

const searchQuery = ref('')

export function queryFromSearchSlug(slug) {
  if (!slug) return ''
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export function searchSlugFromQuery(query) {
  return encodeURIComponent(query.trim())
}

export function inventorySearchRoute(query) {
  const trimmed = query.trim()
  if (!trimmed) return { name: 'dealer-inventory' }
  return {
    name: 'dealer-inventory-search',
    params: { slug: searchSlugFromQuery(trimmed) },
  }
}

export function syncInventorySearchFromRoute(route) {
  if (route.name === 'dealer-inventory-search' && route.params.slug) {
    searchQuery.value = queryFromSearchSlug(route.params.slug)
    return
  }

  if (route.name === 'dealer-inventory') {
    searchQuery.value = ''
  }
}

export function useInventorySearch() {
  return { searchQuery }
}
