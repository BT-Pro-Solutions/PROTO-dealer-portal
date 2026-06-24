<script setup>
import { ref, onMounted, provide } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import HeaderSwoop from '../components/HeaderSwoop.vue'
import { fetchDealerSession } from '../data/dealer.js'
import { fetchVehicles } from '../data/vehicles.js'

const session = ref(null)
const catalog = ref([])
const loading = ref(true)

provide('session', session)
provide('catalog', catalog)

onMounted(async () => {
  const [sessionData, vehicleData] = await Promise.all([fetchDealerSession(), fetchVehicles()])
  session.value = sessionData
  catalog.value = vehicleData
  loading.value = false
})

function handleLogout() {
  alert('Logout will connect to auth when backend is ready.')
}
</script>

<template>
  <div class="layout">
    <div v-if="loading" class="layout__loading">Loading inventory…</div>

    <template v-else-if="session">
      <AppHeader :session="session" @logout="handleLogout" />
      <HeaderSwoop />

      <main class="layout__main">
        <router-view />
      </main>

      <AppFooter />
    </template>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--color-bg-muted);
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
