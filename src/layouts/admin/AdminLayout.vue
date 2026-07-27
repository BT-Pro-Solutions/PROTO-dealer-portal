<script setup>
import { ref, onMounted, onUnmounted, provide, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import HeaderSwoop from '../../components/HeaderSwoop.vue'
import { fetchAdminSession } from '../../data/admin.js'
import { signOut } from '../../composables/useAuth.js'

const router = useRouter()

const session = ref(null)
const loading = ref(true)
const headerStuck = ref(false)
const stickySentinel = ref(null)

provide('session', session)

let stickyObserver = null

onMounted(async () => {
  session.value = await fetchAdminSession()
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
  signOut('admin')
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="portal-layout" data-portal="admin">
    <div v-if="loading" class="portal-layout__loading">Loading portal…</div>

    <template v-else-if="session">
      <div ref="stickySentinel" class="portal-layout__sticky-sentinel" aria-hidden="true"></div>
      <div class="portal-layout__header-sticky reveal reveal--down">
        <AdminHeader :session="session" :stuck="headerStuck" @logout="handleLogout" />
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
