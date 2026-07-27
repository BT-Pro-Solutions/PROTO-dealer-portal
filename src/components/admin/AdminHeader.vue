<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
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

const brandLogo = resolvePublicUrl('/assets/treqso-logo.svg')

const accountMenuOpen = ref(false)
const accountMenuRef = ref(null)

const navLinks = [
  { name: 'admin-dashboard', label: 'Tenants' },
]

function isNavActive(linkName) {
  if (route.name === linkName) return true
  if (linkName === 'admin-dashboard') {
    return [
      'admin-tenant-new',
      'admin-tenant-settings',
      'admin-tenant-branding',
      'admin-tenant-features',
      'admin-tenant-provisioning',
      'admin-tenant-users',
      'admin-tenant-user-detail',
    ].includes(route.name)
  }
  return false
}

function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value
}

function handleLogout() {
  accountMenuOpen.value = false
  emit('logout')
}

function onDocumentClick(event) {
  if (!accountMenuRef.value?.contains(event.target)) accountMenuOpen.value = false
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') accountMenuOpen.value = false
}

onMounted(() => {
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
      <RouterLink :to="{ name: 'admin-dashboard' }" class="header__brand">
        <div class="header__logo">
          <img :src="brandLogo" alt="TREQSO" class="header__logo-img" />
        </div>
        <span class="header__tagline">Dealer Portal Central</span>
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
        </RouterLink>
      </nav>

      <div class="header__tools">
        <div ref="accountMenuRef" class="header__account-menu">
          <button
            type="button"
            class="header__account-group"
            :aria-expanded="accountMenuOpen"
            aria-haspopup="true"
            @click.stop="toggleAccountMenu"
          >
            <Icon icon="mdi:shield-account" width="22" height="22" aria-hidden="true" />
            <div class="header__welcome">
              <div class="header__welcome-text">
                <span class="header__welcome-name">{{ session.userName }}</span>
                <span class="header__company">{{ session.role }}</span>
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
  width: 130px;
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
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-decoration: none;
  color: inherit;
}

.header__logo {
  width: 160px;
  flex-shrink: 0;
  transition: width 0.25s ease;
}

.header__logo-img {
  display: block;
  height: auto;
  width: 100%;
}

.header__tagline {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
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

.header__tools {
  display: flex;
  align-items: center;
  gap: var(--space-md);
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
    width: 100px;
  }

  .header__tagline {
    display: none;
  }

  .header__nav {
    display: none;
  }

  .header__welcome,
  .header__account-chevron {
    display: none;
  }

  .header__account-group {
    width: 42px;
    height: 42px;
    padding: 0;
    justify-content: center;
  }
}
</style>
