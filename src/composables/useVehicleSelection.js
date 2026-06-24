import { ref, computed } from 'vue'

const selectedIds = ref(new Set())

export function useVehicleSelection() {
  function toggleSelection(id) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  function isSelected(id) {
    return selectedIds.value.has(id)
  }

  function removeSelection(id) {
    const next = new Set(selectedIds.value)
    next.delete(id)
    selectedIds.value = next
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  const selectedCount = computed(() => selectedIds.value.size)

  const selectedIdsList = computed(() => [...selectedIds.value])

  return {
    selectedIds,
    selectedCount,
    selectedIdsList,
    toggleSelection,
    isSelected,
    removeSelection,
    clearSelection,
  }
}
