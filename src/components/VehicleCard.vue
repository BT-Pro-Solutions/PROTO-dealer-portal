<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { formatPrice } from '../data/vehicles.js'
import { flyCardToRequestButton } from '../composables/useFlyToRequest.js'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-select', 'open-detail'])

const cardBodyRef = ref(null)

function handleToggleSelect() {
  if (props.selected) {
    emit('toggle-select', props.vehicle.id)
    return
  }

  const source = cardBodyRef.value
  emit('toggle-select', props.vehicle.id)
  flyCardToRequestButton(source)
}
</script>

<template>
  <article class="vehicle-card" :class="{ 'vehicle-card--selected': selected }">
    <div
      ref="cardBodyRef"
      class="vehicle-card__body"
      role="link"
      tabindex="0"
      @click="$emit('open-detail', vehicle.id)"
      @keydown.enter="$emit('open-detail', vehicle.id)"
    >
      <div class="vehicle-card__image-wrap">
        <img :src="vehicle.imageUrl" :alt="vehicle.title" class="vehicle-card__image" loading="lazy" />

        <span
          class="vehicle-card__badge"
          :class="vehicle.status === 'available' ? 'vehicle-card__badge--available' : 'vehicle-card__badge--hold'"
        >
          {{ vehicle.status === 'available' ? 'AVAILABLE' : 'ON HOLD' }}
        </span>

        <button
          type="button"
          class="vehicle-card__select-btn"
          :class="{ 'vehicle-card__select-btn--active': selected }"
          :aria-label="selected ? `Deselect ${vehicle.title}` : `Select ${vehicle.title}`"
          :aria-pressed="selected"
          @click.stop="handleToggleSelect"
        >
          <Icon
            v-if="selected"
            icon="mdi:check-bold"
            width="20"
            height="20"
            color="white"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="vehicle-card__info">
        <h3 class="vehicle-card__title">{{ vehicle.title }}</h3>
        <p class="vehicle-card__price">
          <span class="vehicle-card__price-amount">{{ formatPrice(vehicle.preUpfitPrice) }}</span>
          <span class="vehicle-card__price-label">Pre-upfit pricing</span>
        </p>
        <p class="vehicle-card__vin">{{ vehicle.vin }}</p>
      </div>

      <div class="vehicle-card__specs">
        <div class="vehicle-card__spec">
          <span class="vehicle-card__spec-label">Year</span>
          <span class="vehicle-card__spec-value">{{ vehicle.year }}</span>
        </div>
        <div class="vehicle-card__spec-divider" aria-hidden="true"></div>
        <div class="vehicle-card__spec">
          <span class="vehicle-card__spec-label">Rear Wheel</span>
          <span class="vehicle-card__spec-value">{{ vehicle.rearWheel }}</span>
        </div>
        <div class="vehicle-card__spec-divider" aria-hidden="true"></div>
        <div class="vehicle-card__spec">
          <span class="vehicle-card__spec-label">Drive</span>
          <span class="vehicle-card__spec-value">{{ vehicle.drive }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.vehicle-card__body {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  color: #fff;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
  outline: none;
}

.vehicle-card:not(.vehicle-card--selected) .vehicle-card__body:hover {
/* TODO: Add hover effect */
}

.vehicle-card--selected .vehicle-card__body {
  box-shadow: 0 0 0 2px #fff, 0 0 0 5px var(--brand-color);
}

.vehicle-card__body:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.25);
}

.vehicle-card__image-wrap {
  position: relative;
  aspect-ratio: 400 / 268;
  overflow: hidden;
}

.vehicle-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vehicle-card__badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem 1.25rem;
  color: #222;
  font-size: 14px;
  font-weight: 700;
  border-bottom-right-radius: 10px;
  pointer-events: none;
}

.vehicle-card__badge--available {
  background: var(--color-available);
}

.vehicle-card__badge--hold {
  background: var(--color-on-hold);
}

.vehicle-card__select-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.vehicle-card__select-btn:hover {
  border-color: rgba(0, 0, 0, 0.35);
}

.vehicle-card__select-btn--active {
  background: var(--brand-color);
  border-color: var(--brand-color);
}

.vehicle-card__info {
  text-align: center;
  padding: var(--space-md) var(--space-md) var(--space-sm);
}

.vehicle-card__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 700;
}

.vehicle-card__price {
  margin: 0.45rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.vehicle-card__price-amount {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
}

.vehicle-card__price-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.vehicle-card__vin {
  margin: 0.35rem 0 0;
  font-size: var(--text-sm);
  font-weight: 300;
  color: var(--color-text-muted);
}

.vehicle-card__specs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl) var(--space-xl);
  gap: var(--space-sm);
}

.vehicle-card__spec {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: var(--text-base);
}

.vehicle-card__spec-label {
  font-weight: 700;
}

.vehicle-card__spec-value {
  margin-top: 0.25rem;
  font-weight: 400;
}

.vehicle-card__spec-divider {
  width: 1px;
  height: 26px;
  background: var(--color-divider);
  flex-shrink: 0;
}
</style>
