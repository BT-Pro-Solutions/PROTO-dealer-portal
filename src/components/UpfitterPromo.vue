<template>
  <section class="upfitter-promo" aria-labelledby="upfitter-promo-heading">
    <img :src="resolvePublicUrl(profile.logoUrl)" :alt="profile.logoAlt" class="upfitter-promo__logo" />

    <div class="upfitter-promo__content">
      <h2 id="upfitter-promo-heading" class="upfitter-promo__heading">{{ profile.headline }}</h2>
      <p v-for="(paragraph, index) in profile.body" :key="index" class="upfitter-promo__text">
        {{ paragraph }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { resolvePublicUrl } from '../utils/publicUrl.js'

defineProps({
  profile: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.upfitter-promo {
  padding: var(--space-xl);
  background: #efefef;
  border-radius: var(--radius-md);
}

.upfitter-promo__logo {
  display: block;
  max-width: 180px;
  height: auto;
  margin-bottom: var(--space-lg);
}

.upfitter-promo__heading {
  margin: 0 0 var(--space-md);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
}

.upfitter-promo__text {
  margin: 0 0 var(--space-md);
  font-size: var(--text-base);
  line-height: 1.55;
}

.upfitter-promo__text:last-child {
  margin-bottom: 0;
}
</style>
