<script setup>
import { ref, onMounted, onUnmounted, provide, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import UpfitterHeader from '../../components/upfitter/UpfitterHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import HeaderSwoop from '../../components/HeaderSwoop.vue'
import { fetchUpfitterSession } from '../../data/upfitter.js'
import { signOut } from '../../composables/useAuth.js'

const router = useRouter()

const session = ref(null)
const loading = ref(true)
const headerStuck = ref(false)
const stickySentinel = ref(null)

provide('session', session)

let stickyObserver = null

function applyBrandColor(color) {
  if (color) {
    document.documentElement.style.setProperty('--brand-color', color)
  }
}

onMounted(async () => {
  session.value = await fetchUpfitterSession()
  applyBrandColor(session.value?.brandColor)
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

watch(
  () => session.value?.brandColor,
  (color) => applyBrandColor(color),
)

onUnmounted(() => {
  stickyObserver?.disconnect()
})

function handleLogout() {
  signOut('upfitter')
  router.push({ name: 'upfitter-login' })
}
</script>

<template>
  <div class="portal-layout" data-portal="upfitter">
    <div v-if="loading" class="portal-layout__loading">Loading portal…</div>

    <template v-else-if="session">
      <div ref="stickySentinel" class="portal-layout__sticky-sentinel" aria-hidden="true"></div>
      <div class="portal-layout__header-sticky reveal reveal--down">
        <UpfitterHeader :session="session" :stuck="headerStuck" @logout="handleLogout" />
      </div>
      <HeaderSwoop class="reveal reveal--fade reveal--delay-1" />

      <main class="portal-layout__main">
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.name" class="page-enter" />
        </router-view>
      </main>

      <AppFooter class="reveal reveal--fade reveal--delay-2" />
    </template>
  </div>
</template>
