<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from '../../composables/useAuth.js'
import { resolvePublicUrl } from '../../utils/publicUrl.js'

const router = useRouter()
const brandLogo = resolvePublicUrl('/assets/treqso-logo.svg')

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const submitting = ref(false)

function handleSubmit() {
  if (submitting.value) return

  submitting.value = true
  signIn('admin')
  router.push({ name: 'admin-dashboard' })
}
</script>

<template>
  <div class="portal-login" data-portal="admin">
    <div class="portal-login__panel reveal reveal--down">
      <img
        :src="brandLogo"
        alt="TREQSO"
        class="portal-login__logo"
        width="200"
        height="48"
      />

      <h1 class="portal-login__title">Dealer Portal Central</h1>
      <p class="portal-login__subtitle">
        Sign in to manage upfitter tenants, branding, features, and platform configuration.
      </p>

      <form class="portal-login__form" novalidate @submit.prevent="handleSubmit">
        <div class="portal-login__field">
          <label class="portal-login__label" for="admin-login-email">Email</label>
          <input
            id="admin-login-email"
            v-model="email"
            type="text"
            class="portal-login__input"
            autocomplete="username"
            placeholder="admin@treqso.example"
          />
        </div>

        <div class="portal-login__field">
          <label class="portal-login__label" for="admin-login-password">Password</label>
          <input
            id="admin-login-password"
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
      <p>© {{ new Date().getFullYear() }} TREQSO. All rights reserved.</p>
      <nav aria-label="Legal">
        <a href="#" @click.prevent>Privacy Policy</a>
        <a href="#" @click.prevent>Terms of Use</a>
      </nav>
    </footer>
  </div>
</template>
