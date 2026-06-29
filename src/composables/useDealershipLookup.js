import { ref } from 'vue'
import { fetchDealerships } from '../data/upfitter.js'

const dealershipsById = ref({})
let loadPromise = null

export function useDealershipLookup() {
  async function ensureLoaded() {
    if (!loadPromise) {
      loadPromise = fetchDealerships().then((list) => {
        dealershipsById.value = Object.fromEntries(list.map((dealer) => [dealer.id, dealer]))
      })
    }
    await loadPromise
    return dealershipsById.value
  }

  function getDealership(id) {
    return dealershipsById.value[id] ?? null
  }

  return {
    ensureLoaded,
    getDealership,
  }
}
