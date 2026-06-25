const VIEW_MODE_KEY = 'inventory-view-mode'

export function loadInventoryViewMode() {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    return stored === 'table' ? 'table' : 'cards'
  } catch {
    return 'cards'
  }
}

export function saveInventoryViewMode(mode) {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode)
  } catch {
    // ignore storage failures
  }
}
