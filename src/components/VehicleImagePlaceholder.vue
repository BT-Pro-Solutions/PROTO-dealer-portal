<script setup>
import { upfitterProfile } from '../data/dealer.js'

defineProps({
  alt: {
    type: String,
    default: 'No photo available',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="vehicle-image-placeholder"
    :class="{ 'vehicle-image-placeholder--compact': compact }"
    role="img"
    :aria-label="alt"
  >
    <img
      :src="upfitterProfile.logoUrl"
      :alt="upfitterProfile.logoAlt"
      class="vehicle-image-placeholder__logo"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.vehicle-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-bg-muted);
  aspect-ratio: 400 / 268;
}

.vehicle-image-placeholder--compact {
  aspect-ratio: auto;
  border-radius: var(--radius-sm);
}

.vehicle-image-placeholder__logo {
  width: 42%;
  max-width: 150px;
  height: auto;
  object-fit: contain;
  filter: grayscale(1) contrast(0.5);
  opacity: 0.35;
  pointer-events: none;
  user-select: none;
}

.vehicle-image-placeholder--compact .vehicle-image-placeholder__logo {
  width: 72%;
  max-width: 44px;
}
</style>
