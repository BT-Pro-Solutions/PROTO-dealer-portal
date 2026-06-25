import { ref, computed } from 'vue'
import {
  fetchNotifications,
  markNotificationRead,
  fetchPendingUserRequests,
} from '../data/upfitter.js'

const notifications = ref([])
const userRequests = ref([])
let loadPromise = null

async function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      fetchNotifications().then((data) => {
        notifications.value = data
      }),
      fetchPendingUserRequests().then((data) => {
        userRequests.value = data
      }),
    ])
  }
  await loadPromise
}

export function useUpfitterNotifications() {
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  const pendingUserRequestCount = computed(() => userRequests.value.length)

  async function loadNotifications() {
    return ensureLoaded()
  }

  async function markRead(id) {
    await markNotificationRead(id)
    notifications.value = notifications.value.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    )
  }

  async function refreshUserRequests() {
    userRequests.value = await fetchPendingUserRequests()
  }

  return {
    notifications,
    userRequests,
    unreadCount,
    pendingUserRequestCount,
    loadNotifications,
    markRead,
    refreshUserRequests,
  }
}
