<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from '../../composables/useAuth.js'
import { resolvePublicUrl } from '../../utils/publicUrl.js'

const router = useRouter()
const brandLogo = resolvePublicUrl('/assets/Dealer-Logo.svg')

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const submitting = ref(false)

function handleSubmit() {
  if (submitting.value) return

  submitting.value = true
  signIn('upfitter')
  router.push({ name: 'upfitter-dashboard' })
}
</script>

<template>
  <div class="portal-login" data-portal="upfitter">
    <div class="portal-login__panel reveal reveal--down">
      <img
        :src="brandLogo"
        alt="Zoresco"
        class="portal-login__logo"
        width="200"
        height="80"
      />

      <h1 class="portal-login__title">Upfitter Portal</h1>
      <p class="portal-login__subtitle">Sign in to manage dealerships, quotes, and portal users.</p>

      <form class="portal-login__form" novalidate @submit.prevent="handleSubmit">
        <div class="portal-login__field">
          <label class="portal-login__label" for="upfitter-login-email">Email</label>
          <input
            id="upfitter-login-email"
            v-model="email"
            type="text"
            class="portal-login__input"
            autocomplete="username"
            placeholder="you@zoresco.example"
          />
        </div>

        <div class="portal-login__field">
          <label class="portal-login__label" for="upfitter-login-password">Password</label>
          <input
            id="upfitter-login-password"
            v-model="password"
            type="password"
            class="portal-login__input"
            autocomplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        <div class="portal-login__row">
          <label class="portal-login__remember">
            <input v-model="rememberMe" type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" class="portal-login__link" @click.prevent>Forgot password?</a>
        </div>

        <button type="submit" class="portal-login__submit" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>

    <footer class="portal-login__footer reveal reveal--fade reveal--delay-5">
      <p>© {{ new Date().getFullYear() }} Zoresco. All rights reserved.</p>
      <nav aria-label="Legal">
        <a href="#" @click.prevent>Privacy Policy</a>
        <a href="#" @click.prevent>Terms of Use</a>
        <a href="https://www.zoresco.com" target="_blank" rel="noopener noreferrer">Zoresco</a>
      </nav>
    </footer>
  </div>
</template>
