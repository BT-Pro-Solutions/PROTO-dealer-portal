<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { signIn } from '../../composables/useAuth.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const submitting = ref(false)

function handleSubmit() {
  if (submitting.value) return

  submitting.value = true
  signIn()
  router.push({ name: 'dealer-inventory' })
}
</script>

<template>
  <div class="login">
    <div class="login__panel reveal reveal--down">
      <img
        src="/assets/Dealer-Logo.svg"
        alt="Zoresco"
        class="login__logo"
        width="200"
        height="80"
      />

      <h1 class="login__title">Dealer Portal</h1>
      <p class="login__subtitle">Sign in to browse inventory and request quotes.</p>

      <form class="login__form" novalidate @submit.prevent="handleSubmit">
        <div class="login__field">
          <label class="login__label" for="login-email">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="text"
            class="login__input"
            autocomplete="username"
            placeholder="you@dealership.com"
          />
        </div>

        <div class="login__field">
          <label class="login__label" for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="login__input"
            autocomplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        <div class="login__row">
          <label class="login__remember">
            <input v-model="rememberMe" type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" class="login__link" @click.prevent>Forgot password?</a>
        </div>

        <button type="submit" class="login__submit" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>

    <footer class="login__footer reveal reveal--fade reveal--delay-5">
      <p>© {{ new Date().getFullYear() }} Zoresco. All rights reserved.</p>
      <nav aria-label="Legal">
        <a href="#" @click.prevent>Privacy Policy</a>
        <a href="#" @click.prevent>Terms of Use</a>
        <a href="https://www.zoresco.com" target="_blank" rel="noopener noreferrer">Zoresco</a>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-xl) var(--content-padding);
  background: linear-gradient(165deg, var(--color-bg-muted) 0%, #d4d8de 100%);
}

.login__panel {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--space-2xl) var(--space-xl);
}

.login__logo {
  display: block;
  width: min(200px, 70%);
  height: auto;
  margin: 0 auto var(--space-lg);
}

.login__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.login__subtitle {
  margin: 0 0 var(--space-xl);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.login__label {
  font-size: var(--text-sm);
  font-weight: 600;
}

.login__input {
  width: 100%;
  padding: 0.75rem var(--space-md);
  border: 1px solid #ccc;
  border-radius: 10px;
  height: 55px;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  background: var(--color-bg);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.login__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  font-size: var(--text-sm);
}

.login__remember {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.login__link {
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.login__link:hover {
  text-decoration: underline;
}

.login__submit {
  width: 100%;
  margin-top: var(--space-xs);
  padding: 0.9rem var(--space-lg);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.login__submit:hover:not(:disabled) {
  opacity: 0.85;
}

.login__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__notice {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
  margin-top: var(--space-xl);
  padding: var(--space-md);
  background: var(--color-bg-search);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  line-height: 1.45;
  color: var(--color-text-muted);
}

.login__notice p {
  margin: 0;
}

.login__notice strong {
  color: var(--color-text);
  font-weight: 600;
}

.login__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  width: 100%;
  max-width: 420px;
  margin-top: var(--space-xl);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.login__footer p {
  margin: 0;
}

.login__footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.login__footer a {
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.login__footer a:hover {
  text-decoration: underline;
}
</style>
