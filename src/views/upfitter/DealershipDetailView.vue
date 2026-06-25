<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import {
  fetchDealershipById,
  updateDealership,
  availableBrands,
  fetchDealershipUsers,
  fetchPendingUserRequests,
  createDealershipUser,
  updateDealershipUser,
  deleteDealershipUser,
  approveUserRequest,
  denyUserRequest,
  deleteDealership,
} from '../../data/upfitter.js'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'
import { formatQuoteDate } from '../../data/quotes.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
const { loadQuotes, getQuotesForDealership, refreshQuotes } = useUpfitterQuotes()

const ROLES = ['Admin', 'Sales', 'View only']

const dealership = ref(null)
const users = ref([])
const pendingRequests = ref([])
const loading = ref(true)
const saving = ref(false)
const saveMessage = ref(null)
const userMessage = ref(null)
const processingRequestId = ref(null)
const showUserForm = ref(false)
const editingUserId = ref(null)
const userSaving = ref(false)
const showDeleteFlow = ref(false)
const deleteAcknowledged = ref(false)
const deleteQuotesAcknowledged = ref(false)
const deleteConfirmText = ref('')
const deleting = ref(false)
const deleteError = ref(null)

const editForm = ref({
  contactName: '',
  phone: '',
  email: '',
  address: '',
  allowedBrands: [],
})

const userForm = ref({
  name: '',
  email: '',
  role: 'Sales',
})

const dealershipQuotes = computed(() =>
  dealership.value ? getQuotesForDealership(dealership.value.id) : [],
)

const pendingQuotes = computed(() =>
  dealershipQuotes.value.filter((q) => q.status === 'submitted'),
)

const dealerPortalUrl = computed(() =>
  router.resolve({ name: 'dealer-inventory' }).href,
)

const canDeleteDealer = computed(() =>
  deleteAcknowledged.value &&
  deleteQuotesAcknowledged.value &&
  deleteConfirmText.value.trim() === dealership.value?.name,
)

async function loadUsers() {
  users.value = await fetchDealershipUsers(props.id)
}

async function loadPendingRequests() {
  const all = await fetchPendingUserRequests()
  pendingRequests.value = all.filter((r) => r.dealershipId === props.id)
}

onMounted(async () => {
  await loadQuotes()
  dealership.value = await fetchDealershipById(props.id)
  loading.value = false

  if (!dealership.value) {
    router.replace({ name: 'upfitter-dealerships' })
    return
  }

  editForm.value = {
    contactName: dealership.value.contactName,
    phone: dealership.value.phone,
    email: dealership.value.email,
    address: dealership.value.address,
    allowedBrands: [...dealership.value.allowedBrands],
  }

  await Promise.all([loadUsers(), loadPendingRequests()])

  if (route.hash === '#portal-users') {
    document.getElementById('portal-users')?.scrollIntoView({ behavior: 'smooth' })
  }
})

function toggleBrand(brand) {
  const brands = editForm.value.allowedBrands
  const idx = brands.indexOf(brand)
  if (idx === -1) {
    brands.push(brand)
  } else {
    brands.splice(idx, 1)
  }
}

async function handleSave() {
  if (!dealership.value || saving.value) return

  saving.value = true
  saveMessage.value = null

  try {
    dealership.value = await updateDealership(dealership.value.id, {
      contactName: editForm.value.contactName.trim(),
      phone: editForm.value.phone.trim(),
      email: editForm.value.email.trim(),
      address: editForm.value.address.trim(),
      allowedBrands: [...editForm.value.allowedBrands],
    })
    saveMessage.value = { type: 'success', text: 'Dealership updated.' }
  } catch {
    saveMessage.value = { type: 'error', text: 'Unable to save changes.' }
  } finally {
    saving.value = false
  }
}

function resetUserForm() {
  userForm.value = { name: '', email: '', role: 'Sales' }
  editingUserId.value = null
  showUserForm.value = false
}

function startAddUser() {
  resetUserForm()
  showUserForm.value = true
}

function startEditUser(user) {
  editingUserId.value = user.id
  userForm.value = { name: user.name, email: user.email, role: user.role }
  showUserForm.value = true
}

async function handleUserSubmit() {
  if (!userForm.value.name.trim() || !userForm.value.email.trim() || userSaving.value) return

  userSaving.value = true
  userMessage.value = null

  try {
    if (editingUserId.value) {
      await updateDealershipUser(props.id, editingUserId.value, userForm.value)
      userMessage.value = { type: 'success', text: 'User updated.' }
    } else {
      await createDealershipUser(props.id, userForm.value)
      userMessage.value = { type: 'success', text: 'User added.' }
    }
    await loadUsers()
    resetUserForm()
  } catch {
    userMessage.value = { type: 'error', text: 'Unable to save user.' }
  } finally {
    userSaving.value = false
  }
}

async function handleDeleteUser(user) {
  userMessage.value = null

  try {
    await deleteDealershipUser(props.id, user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    if (editingUserId.value === user.id) resetUserForm()
    userMessage.value = { type: 'success', text: 'User removed.' }
  } catch {
    userMessage.value = { type: 'error', text: 'Unable to remove user.' }
  }
}

async function handleApprove(requestId) {
  processingRequestId.value = requestId
  userMessage.value = null

  try {
    await approveUserRequest(requestId)
    pendingRequests.value = pendingRequests.value.filter((r) => r.id !== requestId)
    await loadUsers()
    userMessage.value = { type: 'success', text: 'Access request approved.' }
  } catch {
    userMessage.value = { type: 'error', text: 'Unable to approve request.' }
  } finally {
    processingRequestId.value = null
  }
}

async function handleDeny(requestId) {
  processingRequestId.value = requestId
  userMessage.value = null

  try {
    await denyUserRequest(requestId)
    pendingRequests.value = pendingRequests.value.filter((r) => r.id !== requestId)
    userMessage.value = { type: 'success', text: 'Access request denied.' }
  } catch {
    userMessage.value = { type: 'error', text: 'Unable to deny request.' }
  } finally {
    processingRequestId.value = null
  }
}

function cancelDeleteFlow() {
  showDeleteFlow.value = false
  deleteAcknowledged.value = false
  deleteQuotesAcknowledged.value = false
  deleteConfirmText.value = ''
  deleteError.value = null
}

async function handleDeleteDealer() {
  if (!canDeleteDealer.value || deleting.value || !dealership.value) return

  const quoteCount = dealershipQuotes.value.length
  const dealerName = dealership.value.name
  const confirmed = window.confirm(
    `Final confirmation: permanently delete "${dealerName}" and all ${quoteCount} associated quote requests and invoices? This cannot be undone.`,
  )
  if (!confirmed) return

  deleting.value = true
  deleteError.value = null

  try {
    const result = await deleteDealership(dealership.value.id)
    if (!result.success) {
      deleteError.value = 'Unable to delete dealership.'
      deleting.value = false
      return
    }
    await refreshQuotes()
    router.push({ name: 'upfitter-dealerships' })
  } catch {
    deleteError.value = 'Unable to delete dealership. Please try again.'
    deleting.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="dealer-detail page-content page-content--narrow">
    <p class="dealer-detail__loading">Loading dealership…</p>
  </div>

  <div v-else-if="dealership" class="dealer-detail page-content page-content--narrow">
    <RouterLink :to="{ name: 'upfitter-dealerships' }" class="dealer-detail__back reveal">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to dealerships
    </RouterLink>

    <div class="dealer-detail__header reveal reveal--delay-1">
      <div>
        <h1 class="dealer-detail__title">{{ dealership.name }}</h1>
        <p class="dealer-detail__address">{{ dealership.address }}</p>
      </div>
      <a
        :href="dealerPortalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="dealer-detail__impersonate-btn"
      >
        <Icon icon="mdi:account-switch" width="18" height="18" aria-hidden="true" />
        Impersonate
        <Icon icon="mdi:open-in-new" width="16" height="16" aria-hidden="true" />
      </a>
    </div>

    <form class="dealer-detail__section reveal reveal--delay-2" @submit.prevent="handleSave">
      <h2 class="dealer-detail__heading">Contact info</h2>

      <div
        v-if="saveMessage"
        class="dealer-detail__message"
        :class="`dealer-detail__message--${saveMessage.type}`"
        role="status"
      >
        {{ saveMessage.text }}
      </div>

      <div class="dealer-detail__fields">
        <label class="dealer-detail__label">
          Contact name
          <input v-model="editForm.contactName" type="text" class="dealer-detail__input" />
        </label>
        <label class="dealer-detail__label">
          Phone
          <input v-model="editForm.phone" type="tel" class="dealer-detail__input" />
        </label>
        <label class="dealer-detail__label">
          Email
          <input v-model="editForm.email" type="email" class="dealer-detail__input" />
        </label>
        <label class="dealer-detail__label">
          Address
          <input v-model="editForm.address" type="text" class="dealer-detail__input" />
        </label>
      </div>
<br>
      <h3 class="dealer-detail__subheading">Brands Made Available to This Dealership</h3>
      <div class="dealer-detail__brands">
        <label
          v-for="brand in availableBrands"
          :key="brand"
          class="dealer-detail__brand"
          :class="{ 'dealer-detail__brand--active': editForm.allowedBrands.includes(brand) }"
        >
          <input
            type="checkbox"
            :checked="editForm.allowedBrands.includes(brand)"
            class="dealer-detail__brand-check"
            @change="toggleBrand(brand)"
          />
          {{ brand }}
        </label>
      </div>

      <button type="submit" class="dealer-detail__save-btn" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save changes' }}
      </button>
    </form>

    <section id="portal-users" class="dealer-detail__section reveal reveal--delay-3">
      <div class="dealer-detail__section-header">
        <h2 class="dealer-detail__heading">Dealership User Management</h2>
        <button
          type="button"
          class="dealer-detail__add-btn"
          @click="showUserForm ? resetUserForm() : startAddUser()"
        >
          <Icon :icon="showUserForm ? 'mdi:close' : 'mdi:account-plus-outline'" width="18" height="18" aria-hidden="true" />
          {{ showUserForm ? 'Cancel' : 'Add user' }}
        </button>
      </div>

      <div
        v-if="userMessage"
        class="dealer-detail__message"
        :class="`dealer-detail__message--${userMessage.type}`"
        role="status"
      >
        {{ userMessage.text }}
      </div>

      <div v-if="pendingRequests.length" class="dealer-detail__pending-requests">
        <h3 class="dealer-detail__subheading">Pending access requests</h3>
        <ul class="dealer-detail__requests">
          <li v-for="request in pendingRequests" :key="request.id" class="dealer-detail__request">
            <div class="dealer-detail__request-info">
              <span class="dealer-detail__request-name">{{ request.name }}</span>
              <span class="dealer-detail__request-email">{{ request.email }}</span>
              <span class="dealer-detail__request-role">{{ request.role }}</span>
              <p v-if="request.notes" class="dealer-detail__request-notes">{{ request.notes }}</p>
            </div>
            <div class="dealer-detail__request-actions">
              <button
                type="button"
                class="dealer-detail__btn dealer-detail__btn--primary"
                :disabled="processingRequestId === request.id"
                @click="handleApprove(request.id)"
              >
                Approve
              </button>
              <button
                type="button"
                class="dealer-detail__btn"
                :disabled="processingRequestId === request.id"
                @click="handleDeny(request.id)"
              >
                Deny
              </button>
            </div>
          </li>
        </ul>
      </div>

      <form v-if="showUserForm" class="dealer-detail__user-form" @submit.prevent="handleUserSubmit">
        <h3 class="dealer-detail__subheading">{{ editingUserId ? 'Edit user' : 'Add user' }}</h3>
        <div class="dealer-detail__user-fields">
          <label class="dealer-detail__label">
            Full name
            <input v-model="userForm.name" type="text" class="dealer-detail__input" required />
          </label>
          <label class="dealer-detail__label">
            Email
            <input v-model="userForm.email" type="email" class="dealer-detail__input" required />
          </label>
          <label class="dealer-detail__label">
            Role
            <select v-model="userForm.role" class="dealer-detail__input">
              <option v-for="role in ROLES" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>
        </div>
        <button type="submit" class="dealer-detail__save-btn" :disabled="userSaving">
          {{ userSaving ? 'Saving…' : editingUserId ? 'Update user' : 'Add user' }}
        </button>
      </form>

      <ul v-if="users.length" class="dealer-detail__users">
        <li v-for="user in users" :key="user.id" class="dealer-detail__user">
          <div class="dealer-detail__user-info">
            <span class="dealer-detail__user-name">{{ user.name }}</span>
            <span class="dealer-detail__user-email">{{ user.email }}</span>
          </div>
          <span class="dealer-detail__user-role">{{ user.role }}</span>
          <div class="dealer-detail__user-actions">
            <button
              type="button"
              class="dealer-detail__icon-btn"
              aria-label="Edit user"
              @click="startEditUser(user)"
            >
              <Icon icon="mdi:pencil-outline" width="18" height="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="dealer-detail__icon-btn dealer-detail__icon-btn--danger"
              aria-label="Remove user"
              @click="handleDeleteUser(user)"
            >
              <Icon icon="mdi:delete-outline" width="18" height="18" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
      <p v-else-if="!showUserForm" class="dealer-detail__note">No portal users yet.</p>
    </section>

    <section class="dealer-detail__section reveal reveal--delay-4">
      <div class="dealer-detail__section-header">
        <h2 class="dealer-detail__heading">Quote requests</h2>
        <span v-if="pendingQuotes.length" class="dealer-detail__pending-badge">
          {{ pendingQuotes.length }} pending
        </span>
      </div>

      <ul v-if="dealershipQuotes.length" class="dealer-detail__quotes">
        <li v-for="quote in dealershipQuotes" :key="quote.id">
          <RouterLink
            :to="{ name: 'upfitter-quote-detail', params: { id: quote.id } }"
            class="dealer-detail__quote-item"
          >
            <div class="dealer-detail__quote-main">
              <span class="dealer-detail__quote-id">{{ quote.id }}</span>
              <span class="dealer-detail__quote-meta">
                {{ quote.customer.name }} · {{ formatQuoteDate(quote.submittedAt) }}
              </span>
            </div>
            <span
              class="dealer-detail__quote-status"
              :class="quote.status === 'submitted' ? 'dealer-detail__quote-status--pending' : 'dealer-detail__quote-status--quoted'"
            >
              {{ quote.status === 'submitted' ? 'Pending' : 'Quoted' }}
            </span>
          </RouterLink>
        </li>
      </ul>
      <p v-else class="dealer-detail__note">No quote requests from this dealership yet.</p>
    </section>

    <section class="dealer-detail__section dealer-detail__section--danger reveal reveal--delay-5">
      <h2 class="dealer-detail__heading dealer-detail__heading--danger">Danger zone</h2>
      <p class="dealer-detail__danger-text">
        Permanently remove this dealership and all associated data from the portal.
        This action cannot be undone.
      </p>

      <ul class="dealer-detail__danger-summary">
        <li>{{ users.length }} portal {{ users.length === 1 ? 'user' : 'users' }}</li>
        <li>{{ dealershipQuotes.length }} quote {{ dealershipQuotes.length === 1 ? 'request' : 'requests' }} and invoices</li>
        <li>{{ pendingRequests.length }} pending access {{ pendingRequests.length === 1 ? 'request' : 'requests' }}</li>
      </ul>

      <div
        v-if="deleteError"
        class="dealer-detail__message dealer-detail__message--error"
        role="alert"
      >
        {{ deleteError }}
      </div>

      <button
        v-if="!showDeleteFlow"
        type="button"
        class="dealer-detail__danger-trigger"
        @click="showDeleteFlow = true"
      >
        <Icon icon="mdi:alert-outline" width="18" height="18" aria-hidden="true" />
        Delete dealership…
      </button>

      <div v-else class="dealer-detail__danger-flow">
        <p class="dealer-detail__danger-warning">
          You are about to permanently delete <strong>{{ dealership.name }}</strong>.
          Complete every step below to enable deletion.
        </p>

        <label class="dealer-detail__danger-check">
          <input v-model="deleteAcknowledged" type="checkbox" />
          <span>I understand this dealership will be permanently removed and cannot be recovered.</span>
        </label>

        <label class="dealer-detail__danger-check">
          <input v-model="deleteQuotesAcknowledged" type="checkbox" />
          <span>
            I understand all {{ dealershipQuotes.length }} associated quote requests and invoices
            will be permanently deleted.
          </span>
        </label>

        <label class="dealer-detail__danger-confirm">
          <span>Type <strong>{{ dealership.name }}</strong> to confirm</span>
          <input
            v-model="deleteConfirmText"
            type="text"
            class="dealer-detail__input"
            autocomplete="off"
            spellcheck="false"
            :placeholder="dealership.name"
          />
        </label>

        <div class="dealer-detail__danger-actions">
          <button type="button" class="dealer-detail__btn" :disabled="deleting" @click="cancelDeleteFlow">
            Cancel
          </button>
          <button
            type="button"
            class="dealer-detail__btn dealer-detail__btn--danger"
            :disabled="!canDeleteDealer || deleting"
            @click="handleDeleteDealer"
          >
            {{ deleting ? 'Deleting…' : 'Permanently delete dealership' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dealer-detail__loading {
  color: var(--color-text-muted);
}

.dealer-detail__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: var(--space-lg);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.dealer-detail__back:hover {
  text-decoration: underline;
}

.dealer-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.dealer-detail__impersonate-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.12);
  border-radius: 50px;
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text);
  text-decoration: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.dealer-detail__impersonate-btn:hover {
  background: var(--color-bg-muted);
  border-color: rgba(0, 0, 0, 0.2);
}

.dealer-detail__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.75rem;
}

.dealer-detail__address {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

.dealer-detail__section {
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.dealer-detail__heading {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-xl);
  font-weight: 700;
}

.dealer-detail__subheading {
  margin: 0 0 var(--space-md);
  font-size: var(--text-base);
  font-weight: 700;
}

.dealer-detail__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.dealer-detail__section-header .dealer-detail__heading {
  margin: 0;
}

.dealer-detail__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-sm);
}

.dealer-detail__add-btn:hover {
  background: var(--color-bg-muted);
}

.dealer-detail__pending-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-chip);
  background: var(--color-pending);
  color: var(--color-pending-text);
}

.dealer-detail__fields,
.dealer-detail__user-fields {
  display: grid;
  gap: var(--space-md);
}

.dealer-detail__user-fields {
  margin-bottom: var(--space-md);
}

.dealer-detail__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.dealer-detail__input {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: #fff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.dealer-detail__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.dealer-detail__note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dealer-detail__brands {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.dealer-detail__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-chip);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}

.dealer-detail__brand--active {
  background: var(--brand-color);
  color: #fff;
  border-color: var(--brand-color);
}

.dealer-detail__brand-check {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.dealer-detail__save-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
}

.dealer-detail__save-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.dealer-detail__save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dealer-detail__message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.dealer-detail__message--success {
  background: var(--color-available);
}

.dealer-detail__message--error {
  background: var(--color-on-hold);
}

.dealer-detail__pending-requests {
  margin-bottom: var(--space-md);
  border-bottom: 1px solid #fff;
  padding-bottom: var(--space-md);
}

.dealer-detail__requests {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dealer-detail__request {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
}

.dealer-detail__request-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dealer-detail__request-name {
  font-weight: 700;
}

.dealer-detail__request-email {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dealer-detail__request-role {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.dealer-detail__request-notes {
  margin: 0.35rem 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dealer-detail__request-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.dealer-detail__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-sm);
  line-height: 1.2;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

.dealer-detail__btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.dealer-detail__btn--danger {
  background: #8b0000;
  color: #fff;
  border-color: #8b0000;
}

.dealer-detail__btn--danger:hover:not(:disabled) {
  background: #6d0000;
}

.dealer-detail__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dealer-detail__user-form {
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
}

.dealer-detail__users {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dealer-detail__user {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
}

.dealer-detail__user-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.dealer-detail__user-name {
  font-weight: 700;
}

.dealer-detail__user-email {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dealer-detail__user-role {
  font-size: var(--text-sm);
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  background: var(--color-bg-pill);
  border-radius: var(--radius-chip);
  white-space: nowrap;
}

.dealer-detail__user-actions {
  display: flex;
  gap: 0.25rem;
}

.dealer-detail__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.dealer-detail__icon-btn:hover {
  background: var(--color-bg-search);
  color: var(--color-text);
}

.dealer-detail__icon-btn--danger:hover {
  background: var(--color-on-hold);
  color: #8b0000;
}

.dealer-detail__quotes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dealer-detail__quote-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: inherit;
}

.dealer-detail__quote-item:hover {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.dealer-detail__quote-main {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.dealer-detail__quote-id {
  font-family: ui-monospace, monospace;
  font-weight: 700;
  font-size: var(--text-sm);
}

.dealer-detail__quote-meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.dealer-detail__quote-status {
  flex-shrink: 0;
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-chip);
  line-height: 1.3;
}

.dealer-detail__quote-status--pending {
  background: var(--color-pending);
  color: var(--color-pending-text);
}

.dealer-detail__quote-status--quoted {
  background: var(--color-available);
  color: #1a5c36;
}

.dealer-detail__section--danger {
  background: #fff5f5;
  border: 1px solid rgba(139, 0, 0, 0.2);
}

.dealer-detail__heading--danger {
  color: #8b0000;
}

.dealer-detail__danger-text {
  margin: 0 0 var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.dealer-detail__danger-summary {
  margin: 0 0 var(--space-lg);
  padding-left: 1.25rem;
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.6;
}

.dealer-detail__danger-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid rgba(139, 0, 0, 0.35);
  border-radius: var(--radius-sm);
  color: #8b0000;
  font-weight: 600;
  font-size: var(--text-sm);
}

.dealer-detail__danger-trigger:hover {
  background: var(--color-on-hold);
}

.dealer-detail__danger-flow {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border: 1px solid rgba(139, 0, 0, 0.15);
  border-radius: var(--radius-sm);
}

.dealer-detail__danger-warning {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.5;
}

.dealer-detail__danger-check {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: var(--text-sm);
  line-height: 1.45;
  cursor: pointer;
}

.dealer-detail__danger-check input {
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.dealer-detail__danger-confirm {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-sm);
  font-weight: 600;
}

.dealer-detail__danger-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding-top: var(--space-xs);
}

@media (max-width: 640px) {
  .dealer-detail__user {
    grid-template-columns: 1fr;
  }

  .dealer-detail__user-actions {
    justify-content: flex-end;
  }

  .dealer-detail__request {
    flex-direction: column;
  }
}
</style>
