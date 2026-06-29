<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useVehicleSelection } from '../composables/useVehicleSelection.js'
import { useInventorySearch, inventorySearchRoute, syncInventorySearchFromRoute } from '../composables/useInventorySearch.js'
import { useDealerQuotes } from '../composables/useDealerQuotes.js'
import { requestButtonRef } from '../composables/useFlyToRequest.js'

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
const { selectedCount } = useVehicleSelection()
const { searchQuery } = useInventorySearch()
const { loadQuotes } = useDealerQuotes()

const isQuoteRequestPage = computed(() => route.name === 'dealer-quote-request')

function goToQuoteRequest() {
  router.push({ name: 'dealer-quote-request' })
}

function goBackToInventory() {
  router.push({ name: 'dealer-inventory' })
}

function goToAccount() {
  accountMenuOpen.value = false
  router.push({ name: 'dealer-account' })
}

function goToManageTeam() {
  accountMenuOpen.value = false
  router.push({ name: 'dealer-manage-team' })
}

function handleLogout() {
  accountMenuOpen.value = false
  emit('logout')
}

const requestBtnEl = ref(null)
const accountMenuOpen = ref(false)
const accountMenuRef = ref(null)
const searchOpen = ref(false)
const searchMenuRef = ref(null)
const searchInputRef = ref(null)

watch(requestBtnEl, (el) => {
  requestButtonRef.value = el
}, { immediate: true })

watch(() => route.fullPath, () => {
  syncInventorySearchFromRoute(route)
  searchOpen.value = false
}, { immediate: true })

function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value
  if (accountMenuOpen.value) {
    searchOpen.value = false
  }
}

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    accountMenuOpen.value = false
    await nextTick()
    searchInputRef.value?.focus()
  }
}

function handleSearchSubmit(event) {
  event.preventDefault()
  router.push(inventorySearchRoute(searchQuery.value))
  searchOpen.value = false
}

function onDocumentClick(event) {
  if (!accountMenuRef.value?.contains(event.target)) {
    accountMenuOpen.value = false
  }
  if (!searchMenuRef.value?.contains(event.target)) {
    searchOpen.value = false
  }
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') {
    accountMenuOpen.value = false
    searchOpen.value = false
  }
}

onMounted(() => {
  loadQuotes()
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
      <RouterLink :to="{ name: 'dealer-inventory' }" class="header__brand">
        <div class="header__logo">
          <img src="/assets/Dealer-Logo.svg" alt="" class="header__logo-img" />
        </div>
      </RouterLink>

      <div class="header__tools">
        <form
          ref="searchMenuRef"
          class="header__search"
          :class="{ 'header__search--open': searchOpen }"
          @submit="handleSearchSubmit"
        >
          <button
            type="button"
            class="header__search-toggle"
            aria-label="Search inventory"
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
              placeholder="Search"
              @keydown.escape="searchOpen = false"
            />
            <button type="submit" class="header__search-submit" aria-label="Search inventory">
              <Icon icon="mdi:magnify" class="header__search-icon" width="22" height="22" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div :class="`header__actions ${selectedCount > 0 ? 'header__actions--hasitems' : ''}`">
        <RouterLink
          :to="{ name: 'dealer-my-quotes' }"
          class="header__quotes-btn"
          aria-label="My Requests"
        >
          <Icon icon="mdi:clipboard-text-outline" width="22" height="22" aria-hidden="true" />
        </RouterLink>

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
                <span class="header__dealership">{{ session.dealershipName }}</span>
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
            <button type="button" class="header__account-item" role="menuitem" @click="goToManageTeam">
              Manage Team
            </button>
            <button type="button" class="header__account-item header__account-item--logout" role="menuitem" @click="handleLogout">
              Log Out
            </button>
          </div>
        </div>

        <button
          v-if="isQuoteRequestPage"
          type="button"
          class="header__request-btn header__request-btn--back"
          aria-label="Back to inventory"
          @click="goBackToInventory"
        >
          <Icon icon="mdi:arrow-left" width="22" height="22" aria-hidden="true" />
          <span class="header__request-text">Back to inventory</span>
        </button>
        <div
          v-else
          ref="requestBtnEl"
          class="header__request-wrap"
          :class="{ 'header__request-wrap--visible': selectedCount > 0 }"
        >
          <button
            type="button"
            class="header__request-btn"
            :aria-label="`Start information request (${selectedCount} selected)`"
            :tabindex="selectedCount > 0 ? 0 : -1"
            :aria-hidden="selectedCount === 0"
            @click="goToQuoteRequest"
          >
            <Icon icon="mdi:clipboard-plus-outline" class="header__request-icon" width="22" height="22" aria-hidden="true" />
            <span class="header__request-label">
              Request
              <span class="header__request-count">{{ selectedCount }}</span>
            </span>
            <span v-if="selectedCount > 0" class="header__request-badge">{{ selectedCount }}</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: 30px 40px 50px 40px;
  transition: background 0.35s ease, padding 0.35s ease;
}

.header--stuck {
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 15px 40px;
  .header__logo {
    width: 150px;
  }
}

.header__inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-lg);
  max-width: var(--content-wide-max);
  margin: 0 auto;
  min-width: 0;
}

.header__brand {
  grid-column: 1;
  justify-self: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.header__tools {
  display: contents;
}

.header__search {
  grid-column: 2;
  width: 100%;
  max-width: 480px;
  min-width: 0;
  justify-self: center;
  display: flex;
  align-items: center;
}

.header__search-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--color-bg-search);
  color: var(--color-text);
}

.header__search-toggle:hover {
  background: #e4e4e4;
}

.header__search-field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.header__search-input {
  width: 100%;
  height: 52px;
  padding: 0 2.75rem 0 1.25rem;
  border: 2px solid var(--color-bg-muted);
  border-radius: var(--radius-pill);
  background: #fff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--color-text);
  outline: none;
  &:hover {
    border: 2px solid #ccc;
  }
}

.header__search-input::placeholder {
  color: var(--color-text-muted);
}

.header__search-input:focus {
  border: 2px solid #555;
}

.header__search-submit {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--color-text);
  background: transparent;
}

.header__search-submit:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header__search-icon {
  pointer-events: none;
}

.header__actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  min-width: 0;
}

.header__quotes-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #efefef;
  color: var(--color-text);
  text-decoration: none;
  transition: border-color var(--transition-fast);
}

.header__quotes-btn:hover {
  border-color: #ccc;
}

.header__quotes-badge {
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

.header__logo {
  position: relative;
  width: 200px;
  flex-shrink: 0;
  transition: .2s;
}

.header__logo-img {
  display: block;
  height: 100%;
  width: auto;
  max-width: 100%;
}

.header__account-menu {
  position: relative;
}

.header__account-group {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  height: 52px;
  border-radius: 50px;
  padding: 10px 15px;
}

.header__account-group:hover {
  box-shadow: 0 0 0 2px #ccc;
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
  transition: background var(--transition-fast);
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

.header__welcome {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  font-family: var(--font-display);
}

.header__welcome-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.header__welcome-label {
  font-weight: 600;
  font-size: var(--text-base);
}

.header__welcome-name {
  font-weight: 800;
}

.header__dealership {
  font-family: var(--font-display);
  opacity: .7;
  font-weight: 700;
  font-size: 12px;
  line-height: 0.98;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.header__request-wrap {
  max-width: 0;
  max-height: 10px;
  overflow: hidden;
  border-radius: 50px;
  opacity: 0;
  transition: max-width 1s cubic-bezier(0.22, 1, 0.36, 1), max-height .5s .25s, opacity .5s;
}

.header__request-wrap--visible {
  max-width: 320px;
  max-height: 52px;
  opacity: 1;
  transition: max-width 1s cubic-bezier(0.22, 1, 0.36, 1), max-height .5s cubic-bezier(0.22, 1, 0.36, 1), opacity .25s;
}

.header__request-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--brand-color);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
  padding: 0.9rem 2.5rem;
  white-space: nowrap;
}

.header__request-label {
  opacity: 0;
  transition: opacity 0.35s ease 0.2s;
}

.header__request-count {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  justify-content: center;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  background: #000;
  color: #fff;
  position: relative;
  top: -1px;
}

.header__request-wrap--visible .header__request-label {
  opacity: 1;
}

.header__request-btn:hover {
  opacity: 0.85;
}

.header__request-btn--back {
  background: #222;
  border-radius: 50px;
}

.header__request-icon {
  display: none;
}

.header__request-text {
  white-space: nowrap;
}

.header__request-badge {
  display: none;
}

@media (max-width: 1260px) {
  .header {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .header__inner {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--space-md);
  }

  .header__brand {
    flex: 0 0 auto;
  }

  .header__logo {
    width: 160px;
  }

  .header__tools {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--space-md);
    min-width: 0;
  }

  .header__search {
    grid-column: unset;
    justify-self: unset;
    flex: 1 1 auto;
    width: auto;
    max-width: 480px;
    min-width: 0;
  }

  .header__actions {
    grid-column: unset;
    justify-self: unset;
    flex: 0 0 auto;
    gap: 10px;
  }

  .header__account-group {
    gap: 10px;
    padding: 10px 12px;
  }

  .header__welcome-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header__dealership {
    max-width: 120px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .header {
    transition: none;
  }

  .header__request-wrap {
    transition: none;
  }

  .header__request-label {
    transition: none;
    opacity: 1;
  }

  .header__account-chevron {
    transition: none;
  }

  .header__search-field {
    transition: none;
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

  .header__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .header__brand {
    flex: 0 0 auto;
    align-items: flex-start;
  }

  .header__logo {
    width: 108px;
  }

  .header__tools {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .header__search {
    grid-column: unset;
    justify-self: unset;
    flex: 0 0 auto;
    width: auto;
    max-width: none;
  }

  .header__actions {
    grid-column: unset;
    justify-self: unset;
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  .header__search-toggle {
    display: flex;
    width: 42px;
    height: 42px;
    border: 2px solid #efefef;
    background: #fff;
  }

  .header__search-field {
    width: 0;
    overflow: hidden;
    opacity: 0;
    transition: width 0.3s ease, opacity 0.25s ease;
  }

  .header__search--open {
    flex: 1 1 100%;
    width: 100%;
    order: 2;
  }

  .header__search--open .header__search-field {
    width: 100%;
    opacity: 1;
  }

  .header__search--open .header__search-toggle {
    display: none;
  }

  .header__search-input {
    height: 42px;
  }

  .header__welcome,
  .header__account-chevron {
    display: none;
  }

  .header__quotes-btn,
  .header__account-group,
  .header__request-btn,
  .header__request-btn--back {
    width: 42px;
    height: 42px;
    padding: 0;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .header__quotes-btn {
    border: 2px solid #efefef;
  }

  .header__account-group {
    gap: 0;
    border: 2px solid #efefef;
    box-shadow: none;
    justify-content: center;
    padding: 0;
  }

  .header__request-wrap--visible {
    max-width: 42px;
    max-height: 42px;
  }

  .header__request-btn {
    position: relative;
    font-size: 0;
    padding: 0;
    border-radius: 50%;
  }

  .header__request-icon {
    display: block;
  }

  .header__request-label,
  .header__request-text {
    display: none;
  }

  .header__request-badge {
    display: block;
    position: absolute;
    top: -3px;
    right: -3px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #000;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    line-height: 18px;
    text-align: center;
  }

  .header__request-wrap--visible .header__request-label {
    opacity: 1;
  }
}
</style>
