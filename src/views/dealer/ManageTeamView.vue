<script setup>
import { ref, inject, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { fetchPortalUsers, requestPortalUser } from '../../data/dealer.js'

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
  <div class="team page-content page-content--narrow">
    <RouterLink :to="{ name: 'dealer-account' }" class="team__link">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to My Account
    </RouterLink>
    
    <h1 class="team__title reveal">Manage Team</h1>
    <p class="team__subtitle reveal reveal--delay-1">
      Portal users with access to {{ session.dealershipName }}.
    </p>

    <section class="team__section reveal reveal--delay-2">
      <div class="team__section-header">
        <h2 class="team__heading">Portal users</h2>
        <button
          type="button"
          class="team__btn team__btn--primary"
          @click="showUserForm = !showUserForm"
        >
          {{ showUserForm ? 'Cancel' : 'Request new user' }}
        </button>
      </div>

      <div
        v-if="userRequestMessage"
        class="team__message"
        :class="`team__message--${userRequestMessage.type}`"
        role="status"
      >
        {{ userRequestMessage.text }}
      </div>

      <ul v-if="portalUsers.length" class="team__users">
        <li v-for="user in portalUsers" :key="user.id" class="team__user">
          <div class="team__user-info">
            <span class="team__user-name">{{ user.name }}</span>
            <span class="team__user-email">{{ user.email }}</span>
          </div>
          <span class="team__user-role">{{ user.role }}</span>
        </li>
      </ul>

      <p v-else class="team__note">No portal users found.</p>

      <form v-if="showUserForm" class="team__user-form" @submit.prevent="handleUserRequest">
        <h3 class="team__form-heading">Request a new portal user</h3>
        <p class="team__note">
          Submit a request to {{ session.upfitterName }} to add someone from your dealership.
        </p>

        <label class="team__label">
          Full name
          <input v-model="newUser.name" type="text" class="team__input" required />
        </label>

        <label class="team__label">
          Email
          <input v-model="newUser.email" type="email" class="team__input" required />
        </label>

        <label class="team__label">
          Role
          <select v-model="newUser.role" class="team__input">
            <option value="Sales">Sales</option>
            <option value="Admin">Admin</option>
            <option value="View only">View only</option>
          </select>
        </label>

        <label class="team__label">
          Notes <span class="team__optional">(optional)</span>
          <textarea
            v-model="newUser.notes"
            class="team__input team__textarea"
            rows="3"
            placeholder="Any context for the upfitter…"
          ></textarea>
        </label>

        <button type="submit" class="team__btn team__btn--primary" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Submit request' }}
        </button>
      </form>
    </section>

  </div>
</template>

<style scoped>
.team__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.team__subtitle {
  margin: 0 0 var(--space-2xl);
  color: var(--color-text-muted);
}

.team__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.team__section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.team__section-header .team__heading {
  margin-bottom: 0;
}

.team__heading {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-xl);
  font-weight: 700;
}

.team__note {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.team__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.team__message--success {
  background: var(--color-available);
  color: var(--color-text);
}

.team__message--error {
  background: var(--color-on-hold);
  color: var(--color-text);
}

.team__users {
  list-style: none;
  margin: 0 0 var(--space-lg);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.team__user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.team__user-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.team__user-name {
  font-weight: 600;
}

.team__user-email {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.team__user-role {
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-chip);
}

.team__user-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.team__form-heading {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
}

.team__label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: 600;
}

.team__optional {
  font-weight: 400;
  color: var(--color-text-muted);
}

.team__input {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: #fff;
}

.team__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.team__textarea {
  resize: vertical;
  min-height: 80px;
}

.team__btn {
  align-self: flex-start;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-base);
}

.team__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.team__btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.team__btn--primary:hover:not(:disabled) {
  opacity: 0.85;
}

.team__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: var(--space-md);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.team__link:hover {
  text-decoration: underline;
}
</style>
