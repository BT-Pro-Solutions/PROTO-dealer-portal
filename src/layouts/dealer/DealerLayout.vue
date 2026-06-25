<script setup>
import { ref, onMounted, onUnmounted, provide, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import HeaderSwoop from '../../components/HeaderSwoop.vue'
import { fetchDealerSession } from '../../data/dealer.js'
import { fetchVehicles } from '../../data/vehicles.js'
import { signOut } from '../../composables/useAuth.js'

const router = useRouter()

const session = ref(null)
const catalog = ref([])
const loading = ref(true)
const headerStuck = ref(false)
const stickySentinel = ref(null)

provide('session', session)
provide('catalog', catalog)

let stickyObserver = null

onMounted(async () => {
  const [sessionData, vehicleData] = await Promise.all([fetchDealerSession(), fetchVehicles()])
  session.value = sessionData
  catalog.value = vehicleData
  loading.value = false

  await nextTick()

  if (stickySentinel.value) {
    stickyObserver = new IntersectionObserver(
      ([entry]) => {
        headerStuck.value = !entry.isIntersecting
      },
      { threshold: 0 },
    )
    stickyObserver.observe(stickySentinel.value)
  }
})

onUnmounted(() => {
  stickyObserver?.disconnect()
})

function handleLogout() {
  signOut()
  router.push({ name: 'dealer-login' })
}
</script>

<template>
  <div class="layout">
    <div v-if="loading" class="layout__loading">Loading inventory…</div>

    <template v-else-if="session">
      <div ref="stickySentinel" class="layout__sticky-sentinel" aria-hidden="true"></div>
      <div class="layout__header-sticky reveal reveal--down">
        <AppHeader :session="session" :stuck="headerStuck" @logout="handleLogout" />
      </div>
      <HeaderSwoop class="reveal reveal--fade reveal--delay-1" />

      <main class="layout__main">
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.name" class="page-enter" />
        </router-view>
      </main>

      <AppFooter class="reveal reveal--fade reveal--delay-2" />
    </template>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--color-bg-muted);
}

.layout__sticky-sentinel {
  height: 1px;
  margin-bottom: -1px;
  pointer-events: none;
}

.layout__header-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}

.layout__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}

.layout__main {
  background: var(--color-bg);
  padding: var(--space-sm) var(--content-padding) var(--space-2xl);
  min-height: calc(100vh - var(--header-height) - var(--swoop-height));
}
</style>
