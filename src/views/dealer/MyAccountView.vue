<script setup>
import { inject } from 'vue'
import { Icon } from '@iconify/vue'

const session = inject('session')
</script>

<template>
  <div class="account page-content page-content--narrow">
    <RouterLink :to="{ name: 'dealer-inventory' }" class="account__link">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to inventory
    </RouterLink>
    
    <h1 class="account__title reveal">My Account</h1>
    <p class="account__subtitle reveal reveal--delay-1">Manage your dealer portal profile and preferences.</p>

    <section class="account__section reveal reveal--delay-2">
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

    <section class="account__section reveal reveal--delay-3">
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

    <section class="account__section reveal reveal--delay-4">
      <h2 class="account__heading">Security</h2>
      <p class="account__note">Password management will connect to auth when the backend is ready.</p>
      <button type="button" class="account__btn" disabled>Change password</button>
    </section>

    
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
  background: var(--color-bg-search);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
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
  color: var(--color-text);
}

.account__note {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.account__btn {
  align-self: flex-start;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-base);
}

.account__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
