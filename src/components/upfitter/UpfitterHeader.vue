<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'
import { useUpfitterNotifications } from '../../composables/useUpfitterNotifications.js'
import { searchUpfitters } from '../../data/upfitter.js'
import { resolvePublicUrl } from '../../utils/publicUrl.js'

defineProps({
  session: {
    type: Object,
    required: true,
  },
  stuck: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['logout'])

const route = useRoute()
const router = useRouter()
const { pendingCount, loadQuotes } = useUpfitterQuotes()
const { notifications, unreadCount, loadNotifications, markRead } = useUpfitterNotifications()

const accountMenuOpen = ref(false)
const notifMenuOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const accountMenuRef = ref(null)
const notifMenuRef = ref(null)
const searchMenuRef = ref(null)
const searchInputRef = ref(null)

const navLinks = [
  { name: 'upfitter-dashboard', label: 'Dashboard' },
  { name: 'upfitter-quotes', label: 'Requests' },
  { name: 'upfitter-dealerships', label: 'My Dealers' },
]

watch(searchQuery, async (query) => {
  const q = query.trim()
  if (q.length < 2) {
    searchResults.value = []
    return
  }
  searchResults.value = await searchUpfitters(q)
})

function goToAccount() {
  accountMenuOpen.value = false
  router.push({ name: 'upfitter-account' })
}

function handleLogout() {
  accountMenuOpen.value = false
  emit('logout')
}

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    accountMenuOpen.value = false
    notifMenuOpen.value = false
    await nextTick()
    searchInputRef.value?.focus()
  }
}

function toggleNotifications() {
  notifMenuOpen.value = !notifMenuOpen.value
  if (notifMenuOpen.value) {
    accountMenuOpen.value = false
    searchOpen.value = false
  }
}

function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value
  if (accountMenuOpen.value) {
    searchOpen.value = false
    notifMenuOpen.value = false
  }
}

async function handleNotificationClick(notif) {
  await markRead(notif.id)
  notifMenuOpen.value = false
  if (notif.type === 'quote' && notif.quoteId) {
    router.push({ name: 'upfitter-quote-detail', params: { id: notif.quoteId } })
  } else if (notif.type === 'user' && notif.dealershipId) {
    router.push({ name: 'upfitter-dealership-detail', params: { id: notif.dealershipId }, hash: '#portal-users' })
  }
}

function formatNotifDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isNavActive(linkName) {
  if (route.name === linkName) return true
  if (linkName === 'upfitter-quotes' && route.name === 'upfitter-quote-detail') return true
  if (linkName === 'upfitter-dealerships' && (route.name === 'upfitter-dealership-detail' || route.name === 'upfitter-dealership-new')) return true
  return false
}

function onDocumentClick(event) {
  if (!accountMenuRef.value?.contains(event.target)) accountMenuOpen.value = false
  if (!notifMenuRef.value?.contains(event.target)) notifMenuOpen.value = false
  if (!searchMenuRef.value?.contains(event.target)) searchOpen.value = false
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') {
    accountMenuOpen.value = false
    notifMenuOpen.value = false
    searchOpen.value = false
  }
}

onMounted(() => {
  loadQuotes()
  loadNotifications()
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <header class="header" :class="{ 'header--stuck': stuck }">
    <div class="header__inner">
      <RouterLink :to="{ name: 'upfitter-dashboard' }" class="header__brand">
        <div class="header__logo">
          <img :src="resolvePublicUrl(session.logoUrl)" :alt="session.logoAlt ?? session.companyName" class="header__logo-img" />
        </div>
      </RouterLink>

      <nav class="header__nav" aria-label="Main">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="{ name: link.name }"
          class="header__nav-link"
          :class="{ 'header__nav-link--active': isNavActive(link.name) }"
        >
          {{ link.label }}
          <span v-if="link.name === 'upfitter-quotes' && pendingCount > 0" class="header__nav-badge">
            {{ pendingCount }}
          </span>
        </RouterLink>
      </nav>

      <div class="header__tools">
        <div
          ref="searchMenuRef"
          class="header__search"
          :class="{ 'header__search--open': searchOpen }"
        >
          <button
            type="button"
            class="header__search-toggle"
            aria-label="Search upfitters"
            :aria-expanded="searchOpen"
            @click.stop="toggleSearch"
          >
            <Icon icon="mdi:magnify" width="22" height="22" aria-hidden="true" />
          </button>
          <div class="header__search-field">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="search"
              class="header__search-input"
              placeholder="Search upfitters…"
              @keydown.escape="searchOpen = false"
            />
            <ul v-if="searchResults.length" class="header__search-results">
              <li v-for="result in searchResults" :key="result.id">
                <button type="button" class="header__search-result">
                  <img v-if="result.logoUrl" :src="resolvePublicUrl(result.logoUrl)" alt="" class="header__search-result-logo" />
                  {{ result.name }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="header__actions">
          <div ref="notifMenuRef" class="header__notif-menu">
            <button
              type="button"
              class="header__notif-btn"
              aria-label="Notifications"
              :aria-expanded="notifMenuOpen"
              @click.stop="toggleNotifications"
            >
              <Icon icon="mdi:bell-outline" width="22" height="22" aria-hidden="true" />
              <span v-if="unreadCount > 0" class="header__notif-badge">{{ unreadCount }}</span>
            </button>

            <div v-show="notifMenuOpen" class="header__notif-dropdown" role="menu">
              <p class="header__notif-heading">Notifications</p>
              <ul v-if="notifications.length" class="header__notif-list">
                <li v-for="notif in notifications" :key="notif.id">
                  <button
                    type="button"
                    class="header__notif-item"
                    :class="{ 'header__notif-item--unread': !notif.read }"
                    @click="handleNotificationClick(notif)"
                  >
                    <span class="header__notif-title">{{ notif.title }}</span>
                    <span class="header__notif-message">{{ notif.message }}</span>
                    <span class="header__notif-date">{{ formatNotifDate(notif.createdAt) }}</span>
                  </button>
                </li>
              </ul>
              <p v-else class="header__notif-empty">No notifications.</p>
            </div>
          </div>

          <div ref="accountMenuRef" class="header__account-menu">
            <button
              type="button"
              class="header__account-group"
              :aria-expanded="accountMenuOpen"
              aria-haspopup="true"
              @click.stop="toggleAccountMenu"
            >
              <Icon icon="mdi:account" width="22" height="22" aria-hidden="true" />
              <div class="header__welcome">
                <div class="header__welcome-text">
                  <span class="header__welcome-name">{{ session.userName }}</span>
                  <span class="header__company">{{ session.companyName }}</span>
                </div>
              </div>
              <span
                class="header__account-chevron"
                :class="{ 'header__account-chevron--open': accountMenuOpen }"
                aria-hidden="true"
              >
                <Icon icon="mdi:chevron-down" width="22" height="22" />
              </span>
            </button>

            <div v-show="accountMenuOpen" class="header__account-dropdown" role="menu">
              <button type="button" class="header__account-item" role="menuitem" @click="goToAccount">
                My Account
              </button>
              <button
                type="button"
                class="header__account-item header__account-item--logout"
                role="menuitem"
                @click="handleLogout"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  --header-control-height: 52px;

  padding: 30px 40px 50px 40px;
  transition: background 0.35s ease, padding 0.35s ease;
}

.header--stuck {
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 15px 40px;
}

.header--stuck .header__logo {
  width: 150px;
}

.header__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-lg);
  max-width: var(--content-wide-max);
  margin: 0 auto;
}

.header__brand {
  text-decoration: none;
  color: inherit;
}

.header__logo {
  width: 200px;
  flex-shrink: 0;
  transition: width 0.25s ease;
}

.header__logo-img {
  display: block;
  height: 100%;
  width: auto;
  max-width: 100%;
}

.header__nav {
  display: inline-flex;
  align-items: stretch;
  height: var(--header-control-height);
  padding: 4px;
  background: #fff;
  border: 2px solid #efefef;
  border-radius: var(--radius-pill);
  justify-self: center;
}

.header__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 100%;
  padding: 0 1.25rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.header__nav-link:hover:not(.header__nav-link--active) {
  color: var(--color-text);
  background: rgba(0, 0, 0, 0.04);
}

.header__nav-link--active {
  background: var(--color-bg-pill-active);
  color: var(--color-text-inverse);
}

.header__nav-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--brand-color);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
}

.header__tools {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header__search {
  position: relative;
  display: flex;
  align-items: center;
}

.header__search-toggle {
  display: none;
}

.header__search-field {
  position: relative;
  width: 220px;
}

.header__search-input {
  width: 100%;
  height: var(--header-control-height);
  padding: 0 1rem;
  border: 2px solid #efefef;
  border-radius: var(--radius-pill);
  background: #fff;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  box-sizing: border-box;
}

.header__search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.header__search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  list-style: none;
  margin: 0;
  padding: 0.35rem 0;
  background: #fff;
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.header__search-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 1rem;
  text-align: left;
  font-weight: 600;
  background: transparent;
}

.header__search-result:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header__search-result-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__notif-menu {
  position: relative;
}

.header__notif-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--header-control-height);
  height: var(--header-control-height);
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #efefef;
  color: var(--color-text);
  box-sizing: border-box;
}

.header__notif-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--brand-color);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
}

.header__notif-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: var(--space-sm) 0;
  z-index: 10;
}

.header__notif-heading {
  margin: 0;
  padding: 0.5rem 1rem;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.header__notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.header__notif-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: transparent;
  border-left: 3px solid transparent;
}

.header__notif-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.header__notif-item--unread {
  border-left-color: var(--brand-color);
  background: rgba(0, 0, 0, 0.02);
}

.header__notif-title {
  font-weight: 700;
  font-size: var(--text-sm);
}

.header__notif-message {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.4;
}

.header__notif-date {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.header__notif-empty {
  margin: 0;
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.header__account-menu {
  position: relative;
}

.header__account-group {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  height: var(--header-control-height);
  border: 2px solid #efefef;
  border-radius: 50px;
  padding: 0 15px;
  box-sizing: border-box;
}

.header__account-group:hover {
  border-color: #ccc;
}

.header__account-chevron {
  display: inline-flex;
  transition: transform 0.2s ease;
}

.header__account-chevron--open {
  transform: rotate(180deg);
}

.header__account-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 180px;
  background: #fff;
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 0.35rem 0;
  z-index: 10;
  width: 240px;
}

.header__account-item {
  display: block;
  width: 100%;
  padding: 0.65rem 1.1rem;
  text-align: left;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text);
  background: transparent;
}

.header__account-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header__account-item--logout {
  border-top: 1px solid #efefef;
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  color: var(--brand-color);
}

.header__welcome-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.header__welcome-name {
  font-family: var(--font-display);
  font-weight: 800;
}

.header__company {
  font-family: var(--font-display);
  opacity: 0.7;
  font-weight: 700;
  font-size: 12px;
  line-height: 0.98;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

@media (max-width: 1024px) {
  .header__inner {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }

  .header__nav {
    grid-column: 1 / -1;
    justify-self: start;
    overflow-x: auto;
  }

  .header__tools {
    justify-self: end;
  }
}

@media (max-width: 768px) {
  .header {
    padding: var(--space-sm) var(--space-md) 40px;
  }

  .header--stuck {
    padding: var(--space-xs) var(--space-md);
  }

  .header--stuck .header__logo {
    width: 88px;
  }

  .header__nav {
    display: none;
  }

  .header__search-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 2px solid #efefef;
    background: #fff;
    border-radius: 50%;
  }

  .header__search-field {
    width: 0;
    overflow: hidden;
    opacity: 0;
  }

  .header__search--open {
    flex: 1 1 100%;
    order: 2;
  }

  .header__search--open .header__search-field {
    width: 100%;
    opacity: 1;
  }

  .header__welcome,
  .header__account-chevron {
    display: none;
  }

  .header__notif-btn,
  .header__account-group {
    width: 42px;
    height: 42px;
    padding: 0;
    justify-content: center;
  }
}
</style>
