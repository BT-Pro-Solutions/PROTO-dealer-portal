import { ref } from 'vue'
import { fetchVehicles, vehicleHasImages } from '../data/vehicles.js'

const catalog = ref([])
let loadPromise = null

export function useQuoteVehicleImages() {
  async function ensureCatalog() {
    if (!loadPromise) {
      loadPromise = fetchVehicles().then((data) => {
        catalog.value = data
      })
    }
    await loadPromise
    return catalog.value
  }

  function vehicleImage(vehicleId) {
    const vehicle = catalog.value.find((v) => v.id === vehicleId)
    if (vehicle && vehicleHasImages(vehicle)) return vehicle.imageUrl
    return null
  }

  function quoteImages(quote) {
    return quote.items
      .map((item) => vehicleImage(item.vehicleId))
      .filter(Boolean)
      .slice(0, 3)
  }

  function baseValue(quote) {
    return quote.items.reduce((sum, item) => sum + (item.preUpfitPrice ?? 0), 0)
  }

  return {
    catalog,
    ensureCatalog,
    vehicleImage,
    quoteImages,
    baseValue,
  }
}
