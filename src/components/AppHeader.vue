<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useVehicleSelection } from '../composables/useVehicleSelection.js'
import { requestButtonRef } from '../composables/useFlyToRequest.js'

defineProps({
  session: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const { selectedCount } = useVehicleSelection()

const isQuoteRequestPage = computed(() => route.name === 'quote-request')

const requestLabel = computed(() => {
  const count = selectedCount.value
  return `Request ${count} Truck${count === 1 ? '' : 's'}`
})

function goToQuoteRequest() {
  router.push({ name: 'quote-request' })
}

function goBackToInventory() {
  router.push({ name: 'inventory' })
}

const requestBtnEl = ref(null)

watch(requestBtnEl, (el) => {
  requestButtonRef.value = el
}, { immediate: true })
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="header__brand">
        <div class="header__logo">
          <img src="/assets/Dealer-Logo.svg" alt="" class="header__logo-img" />
        </div>
        <div class="header__portal-title">
          <span class="header__portal-name">Dealer Portal For</span>
          <span class="header__dealership">{{ session.dealershipName }}</span>
        </div>
      </RouterLink>

      <div class="header__actions">
        <div class="header__welcome">
          <span class="header__welcome-label">Welcome Back,</span>
          <span class="header__welcome-name">{{ session.userName }}</span>
        </div>

        <div class="header__icon-group">
          <button type="button" class="header__icon-btn" aria-label="Log out" @click="$emit('logout')">
            <Icon icon="mdi:logout" width="22" height="22" aria-hidden="true" />
          </button>
          <RouterLink to="/account" class="header__icon-btn" aria-label="My Account">
            <Icon icon="mdi:cog" width="22" height="22" aria-hidden="true" />
          </RouterLink>
        </div>

        <button
          v-if="isQuoteRequestPage"
          type="button"
          class="header__request-btn header__request-btn--back"
          @click="goBackToInventory"
        >
          <Icon icon="mdi:arrow-left" width="20" height="20" aria-hidden="true" />
          Back to inventory
        </button>
        <button
          v-else-if="selectedCount > 0"
          ref="requestBtnEl"
          type="button"
          class="header__request-btn"
          @click="goToQuoteRequest"
        >
          {{ requestLabel }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: linear-gradient(to top, #efefef, #fff);
  padding: 30px 40px 50px 40px;
}

.header__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  max-width: var(--content-wide-max);
  margin: 0 auto;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  text-decoration: none;
  color: inherit;
}

.header__logo {
  position: relative;
  width: 250px;
  flex-shrink: 0;
}

.header__logo-img {
  display: block;
  height: 100%;
  width: auto;
  max-width: 100%;
}

.header__portal-title {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.header__portal-name {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: var(--text-xl);
  line-height: 0.98;
}

.header__dealership {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  line-height: 0.98;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

.header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
}

.header__welcome {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  font-family: var(--font-display);
}

.header__welcome-label {
  font-weight: 600;
  font-size: var(--text-base);
}

.header__welcome-name {
  font-weight: 800;
  font-size: var(--text-lg);
}

.header__icon-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.header__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  text-decoration: none;
}

.header__icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.header__request-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--brand-color);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
  padding: 0.9rem 2.5rem;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  transition: opacity var(--transition-fast);
}

.header__request-btn:hover {
  opacity: 0.85;
}

.header__request-btn--back {
  background: #222;
}

@media (max-width: 768px) {
  .header {
    padding-top: var(--space-md);
  }

  .header__brand {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .header__actions {
    width: 100%;
    justify-content: space-between;
  }

  .header__welcome {
    align-items: flex-start;
    text-align: left;
    order: -1;
    width: 100%;
  }

  .header__request-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
