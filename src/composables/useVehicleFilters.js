import { ref, computed } from 'vue'
import { filterOptions } from '../data/vehicles.js'
import { useInventorySearch } from './useInventorySearch.js'

const defaultFilters = () => ({
  makes: [...filterOptions.makes],
  colors: ['white', 'silver'],
  truckTypes: [...filterOptions.truckTypes],
  bodyTypes: [...filterOptions.bodyTypes],
  rearWheels: ['SRW', 'DRW'],
  drives: ['4x2', '4x4'],
})

export function useVehicleFilters(vehicles) {
  const filters = ref(defaultFilters())
  const sortBy = ref('make_model')
  const { searchQuery } = useInventorySearch()

  const filteredVehicles = computed(() => {
    let results = vehicles.value.filter((vehicle) => {
      const { makes, colors, truckTypes, bodyTypes, rearWheels, drives } = filters.value

      if (makes.length && !makes.includes(vehicle.make)) return false
      if (colors.length && !colors.includes(vehicle.color)) return false
      if (truckTypes.length && !truckTypes.includes(vehicle.truckType)) return false
      if (bodyTypes.length && !bodyTypes.includes(vehicle.bodyType)) return false
      if (rearWheels.length && !rearWheels.includes(vehicle.rearWheel)) return false
      if (drives.length && !drives.includes(vehicle.drive)) return false

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase()
        const haystack = `${vehicle.title} ${vehicle.vin} ${vehicle.make} ${vehicle.model}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })

    if (sortBy.value === 'make_model') {
      results = [...results].sort((a, b) => {
        const makeCmp = a.make.localeCompare(b.make)
        return makeCmp !== 0 ? makeCmp : a.model.localeCompare(b.model)
      })
    } else if (sortBy.value === 'year_desc') {
      results = [...results].sort((a, b) => b.year - a.year)
    } else if (sortBy.value === 'year_asc') {
      results = [...results].sort((a, b) => a.year - b.year)
    }

    return results
  })

  const resultCount = computed(() => filteredVehicles.value.length)

  function toggleColor(colorId) {
    const colors = filters.value.colors
    if (colors.includes(colorId)) {
      filters.value.colors = colors.filter((c) => c !== colorId)
    } else {
      filters.value.colors = [...colors, colorId]
    }
  }

  function toggleArrayFilter(key, value) {
    const current = filters.value[key]
    if (current.includes(value)) {
      filters.value[key] = current.filter((v) => v !== value)
    } else {
      filters.value[key] = [...current, value]
    }
  }

  function resetFilters() {
    filters.value = defaultFilters()
    searchQuery.value = ''
    sortBy.value = 'make_model'
  }

  return {
    filters,
    sortBy,
    filteredVehicles,
    resultCount,
    toggleColor,
    toggleArrayFilter,
    resetFilters,
  }
}
