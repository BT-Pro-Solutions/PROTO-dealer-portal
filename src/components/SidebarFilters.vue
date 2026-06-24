<script setup>
import { Icon } from '@iconify/vue'
import { filterOptions } from '../data/vehicles.js'
import ColorSwatchCheck from './ColorSwatchCheck.vue'

defineProps({
  filters: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:search', 'set-make', 'toggle-color', 'toggle-filter'])

function onSearchInput(event) {
  emit('update:search', event.target.value)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__search">
      <input
        type="search"
        class="sidebar__search-input"
        placeholder="Search"
        :value="filters.search"
        @input="onSearchInput"
      />
      <Icon icon="mdi:magnify" class="sidebar__search-icon" width="24" height="24" aria-hidden="true" />
    </div>

    <section class="sidebar__section">
      <h2 class="sidebar__heading">Make</h2>
      <div class="sidebar__pills">
        <button
          v-for="make in filterOptions.makes"
          :key="make"
          type="button"
          class="sidebar__pill"
          :class="{ 'sidebar__pill--active': filters.make === make }"
          @click="$emit('set-make', make)"
        >
          {{ make }}
        </button>
      </div>
    </section>

    <section class="sidebar__section">
      <h2 class="sidebar__heading">Color</h2>
      <div class="sidebar__colors">
        <button
          v-for="color in filterOptions.colors"
          :key="color.id"
          type="button"
          class="sidebar__color"
          :class="{ 'sidebar__color--selected': filters.colors.includes(color.id) }"
          :style="{ '--swatch-color': color.hex }"
          :aria-label="color.label"
          :aria-pressed="filters.colors.includes(color.id)"
          @click="$emit('toggle-color', color.id)"
        >
          <span class="sidebar__color-swatch"></span>
          <ColorSwatchCheck v-if="filters.colors.includes(color.id)" class="sidebar__color-check" />
        </button>
      </div>
    </section>

    <section class="sidebar__section">
      <h2 class="sidebar__heading">Truck Type</h2>
      <ul class="sidebar__checkboxes">
        <li v-for="type in filterOptions.truckTypes" :key="type">
          <label class="sidebar__checkbox-label">
            <input
              type="checkbox"
              :checked="filters.truckTypes.includes(type)"
              @change="$emit('toggle-filter', 'truckTypes', type)"
            />
            <span>{{ type }}</span>
          </label>
        </li>
      </ul>
    </section>

    <section class="sidebar__section">
      <h2 class="sidebar__heading">Rear Wheel</h2>
      <ul class="sidebar__checkboxes">
        <li v-for="wheel in filterOptions.rearWheels" :key="wheel.id">
          <label class="sidebar__checkbox-label">
            <input
              type="checkbox"
              :checked="filters.rearWheels.includes(wheel.id)"
              @change="$emit('toggle-filter', 'rearWheels', wheel.id)"
            />
            <span>{{ wheel.label }}</span>
          </label>
        </li>
      </ul>
    </section>

    <section class="sidebar__section">
      <h2 class="sidebar__heading">Drive</h2>
      <ul class="sidebar__checkboxes">
        <li v-for="drive in filterOptions.drives" :key="drive">
          <label class="sidebar__checkbox-label">
            <input
              type="checkbox"
              :checked="filters.drives.includes(drive)"
              @change="$emit('toggle-filter', 'drives', drive)"
            />
            <span>{{ drive }}</span>
          </label>
        </li>
      </ul>
    </section>

    <section class="sidebar__section">
      <h2 class="sidebar__heading">Pre-upfit Price</h2>
      <ul class="sidebar__checkboxes">
        <li v-for="range in filterOptions.priceRanges" :key="range.id">
          <label class="sidebar__checkbox-label">
            <input
              type="checkbox"
              :checked="filters.priceRanges.includes(range.id)"
              @change="$emit('toggle-filter', 'priceRanges', range.id)"
            />
            <span>{{ range.label }}</span>
          </label>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.sidebar__search {
  position: relative;
  display: flex;
  align-items: center;
}

.sidebar__search-input {
  width: 100%;
  height: 54px;
  padding: 0 3.5rem 0 2rem;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-bg-search);
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  color: var(--color-text);
  outline: none;
}

.sidebar__search-input::placeholder {
  color: var(--color-text);
}

.sidebar__search-input:focus {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.sidebar__search-icon {
  position: absolute;
  right: 1.25rem;
  color: var(--color-text);
  pointer-events: none;
}

.sidebar__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.sidebar__heading {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
}

.sidebar__pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.sidebar__pill {
  height: 54px;
  padding: 0 1rem;
  border-radius: var(--radius-chip);
  background: var(--color-bg-pill);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.sidebar__pill--active {
  background: var(--color-bg-pill-active);
  color: var(--color-text-inverse);
}

.sidebar__colors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.sidebar__color {
  position: relative;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
}

.sidebar__color--selected {
  border-color: var(--color-primary);
}

.sidebar__color-swatch {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--swatch-color);
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.sidebar__color-check {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 21px;
  height: 17px;
  pointer-events: none;
}

.sidebar__checkboxes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.sidebar__checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-base);
  cursor: pointer;
}
</style>
