<script setup>
import { ref, inject, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { fetchPortalUsers, requestPortalUser } from '../data/dealer.js'

const session = inject('session')

const portalUsers = ref([])
const showUserForm = ref(false)
const submitting = ref(false)
const userRequestMessage = ref(null)

const newUser = ref({
  name: '',
  email: '',
  role: 'Sales',
  notes: '',
})

onMounted(async () => {
  portalUsers.value = await fetchPortalUsers()
})

async function handleUserRequest() {
  if (!newUser.value.name.trim() || !newUser.value.email.trim()) return

  submitting.value = true
  userRequestMessage.value = null

  try {
    const result = await requestPortalUser({
      name: newUser.value.name.trim(),
      email: newUser.value.email.trim(),
      role: newUser.value.role,
      notes: newUser.value.notes.trim(),
    })
    userRequestMessage.value = {
      type: 'success',
      text: `User request ${result.requestId} submitted. Your upfitter will review and follow up.`,
    }
    newUser.value = { name: '', email: '', role: 'Sales', notes: '' }
    showUserForm.value = false
  } catch {
    userRequestMessage.value = {
      type: 'error',
      text: 'Unable to submit user request. Please try again.',
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="account page-content page-content--narrow">
    <h1 class="account__title">My Account</h1>
    <p class="account__subtitle">Manage your dealer portal profile and preferences.</p>

    <section class="account__section">
      <h2 class="account__heading">Profile</h2>
      <dl class="account__fields">
        <div class="account__field">
          <dt>Name</dt>
          <dd>{{ session.userName }}</dd>
        </div>
        <div class="account__field">
          <dt>Email</dt>
          <dd>{{ session.email }}</dd>
        </div>
        <div class="account__field">
          <dt>Phone</dt>
          <dd>{{ session.phone }}</dd>
        </div>
      </dl>
    </section>

    <section class="account__section">
      <h2 class="account__heading">Dealership</h2>
      <dl class="account__fields">
        <div class="account__field">
          <dt>Dealership</dt>
          <dd>{{ session.dealershipName }}</dd>
        </div>
        <div class="account__field">
          <dt>Address</dt>
          <dd>{{ session.dealershipAddress }}</dd>
        </div>
        <div class="account__field">
          <dt>Upfitter</dt>
          <dd>{{ session.upfitterName }}</dd>
        </div>
      </dl>
    </section>

    <section class="account__section">
      <div class="account__section-header">
        <h2 class="account__heading">Portal users</h2>
        <button
          type="button"
          class="account__btn account__btn--primary"
          @click="showUserForm = !showUserForm"
        >
          {{ showUserForm ? 'Cancel' : 'Request new user' }}
        </button>
      </div>

      <p class="account__note">
        Users with access to this dealer portal for {{ session.dealershipName }}.
      </p>

      <div
        v-if="userRequestMessage"
        class="account__message"
        :class="`account__message--${userRequestMessage.type}`"
        role="status"
      >
        {{ userRequestMessage.text }}
      </div>

      <ul v-if="portalUsers.length" class="account__users">
        <li v-for="user in portalUsers" :key="user.id" class="account__user">
          <div class="account__user-info">
            <span class="account__user-name">{{ user.name }}</span>
            <span class="account__user-email">{{ user.email }}</span>
          </div>
          <span class="account__user-role">{{ user.role }}</span>
        </li>
      </ul>

      <form v-if="showUserForm" class="account__user-form" @submit.prevent="handleUserRequest">
        <h3 class="account__form-heading">Request a new portal user</h3>
        <p class="account__note">
          Submit a request to {{ session.upfitterName }} to add someone from your dealership.
        </p>

        <label class="account__label">
          Full name
          <input v-model="newUser.name" type="text" class="account__input" required />
        </label>

        <label class="account__label">
          Email
          <input v-model="newUser.email" type="email" class="account__input" required />
        </label>

        <label class="account__label">
          Role
          <select v-model="newUser.role" class="account__input">
            <option value="Sales">Sales</option>
            <option value="Admin">Admin</option>
            <option value="View only">View only</option>
          </select>
        </label>

        <label class="account__label">
          Notes <span class="account__optional">(optional)</span>
          <textarea
            v-model="newUser.notes"
            class="account__input account__textarea"
            rows="3"
            placeholder="Any context for the upfitter…"
          ></textarea>
        </label>

        <button type="submit" class="account__btn account__btn--primary" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Submit request' }}
        </button>
      </form>
    </section>

    <section class="account__section">
      <h2 class="account__heading">Security</h2>
      <p class="account__note">Password management will connect to auth when the backend is ready.</p>
      <button type="button" class="account__btn" disabled>Change password</button>
    </section>

    <RouterLink to="/" class="account__link">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to inventory
    </RouterLink>
  </div>
</template>

<style scoped>
.account__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.account__subtitle {
  margin: 0 0 var(--space-2xl);
  color: var(--color-text-muted);
}

.account__section {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.account__section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.account__section-header .account__heading {
  margin-bottom: 0;
}

.account__heading {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-xl);
  font-weight: 700;
}

.account__fields {
  display: grid;
  gap: var(--space-md);
  margin: 0;
}

.account__field dt {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.15rem;
}

.account__field dd {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 500;
}

.account__note {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.account__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.account__message--success {
  background: var(--color-available);
}

.account__message--error {
  background: var(--color-on-hold);
}

.account__users {
  list-style: none;
  margin: 0 0 var(--space-lg);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.account__user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
}

.account__user-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.account__user-name {
  font-weight: 600;
}

.account__user-email {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.account__user-role {
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  background: var(--color-bg-search);
  border-radius: var(--radius-chip);
}

.account__user-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.account__form-heading {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
}

.account__label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: 600;
}

.account__optional {
  font-weight: 400;
  color: var(--color-text-muted);
}

.account__input {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}

.account__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.account__textarea {
  resize: vertical;
  min-height: 80px;
}

.account__btn {
  align-self: flex-start;
  background: var(--color-bg-search);
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-base);
}

.account__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.account__btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.account__btn--primary:hover:not(:disabled) {
  opacity: 0.85;
}

.account__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-md);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.account__link:hover {
  text-decoration: underline;
}
</style>
