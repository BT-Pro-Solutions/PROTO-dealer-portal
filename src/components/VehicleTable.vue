<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { vehicleHasImages } from '../data/vehicles.js'
import VehicleImagePlaceholder from './VehicleImagePlaceholder.vue'
import { flyCardToRequestButton } from '../composables/useFlyToRequest.js'

const props = defineProps({
  vehicles: {
    type: Array,
    required: true,
  },
  isSelected: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['toggle-select', 'open-detail'])

const thumbRefs = ref({})

function setThumbRef(id, el) {
  if (el) {
    thumbRefs.value[id] = el
  } else {
    delete thumbRefs.value[id]
  }
}

function handleToggleSelect(vehicle) {
  const selected = props.isSelected(vehicle.id)
  if (selected) {
    emit('toggle-select', vehicle.id)
    return
  }

  const source = thumbRefs.value[vehicle.id]
  emit('toggle-select', vehicle.id)
  flyCardToRequestButton(source)
}
</script>

<template>
  <div class="vehicle-table-wrap">
    <table class="vehicle-table">
      <thead>
        <tr>
          <th class="vehicle-table__col-select" scope="col">
            <span class="vehicle-table__sr-only">Select</span>
          </th>
          <th class="vehicle-table__col-image" scope="col">
            <span class="vehicle-table__sr-only">Image</span>
          </th>
          <th scope="col">Vehicle</th>
          <th scope="col">VIN</th>
          <th scope="col">Year</th>
          <th scope="col">Rear Wheel</th>
          <th scope="col">Drive</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(vehicle, index) in vehicles"
          :key="vehicle.id"
          class="vehicle-table__row"
          :class="{ 'vehicle-table__row--selected': isSelected(vehicle.id) }"
          :style="{ '--stagger-i': index }"
          tabindex="0"
          role="link"
          @click="emit('open-detail', vehicle.id)"
          @keydown.enter="emit('open-detail', vehicle.id)"
        >
          <td
            class="vehicle-table__cell-select"
            role="button"
            tabindex="0"
            :aria-label="isSelected(vehicle.id) ? `Deselect ${vehicle.title}` : `Select ${vehicle.title}`"
            :aria-pressed="isSelected(vehicle.id)"
            @click.stop="handleToggleSelect(vehicle)"
            @keydown.enter.stop="handleToggleSelect(vehicle)"
            @keydown.space.prevent.stop="handleToggleSelect(vehicle)"
          >
            <span
              class="vehicle-table__select-indicator"
              :class="{ 'vehicle-table__select-indicator--active': isSelected(vehicle.id) }"
              aria-hidden="true"
            >
              <Icon
                v-if="isSelected(vehicle.id)"
                icon="mdi:check-bold"
                width="16"
                height="16"
              />
            </span>
          </td>
          <td class="vehicle-table__cell-image">
            <div
              :ref="(el) => setThumbRef(vehicle.id, el)"
              class="vehicle-table__thumb-wrap"
            >
              <img
                v-if="vehicleHasImages(vehicle)"
                :src="vehicle.imageUrl"
                :alt="vehicle.title"
                class="vehicle-table__thumb"
                loading="lazy"
              />
              <VehicleImagePlaceholder
                v-else
                compact
                :alt="`${vehicle.title} — no photo available`"
                class="vehicle-table__thumb"
              />
            </div>
          </td>
          <td class="vehicle-table__cell-title">{{ vehicle.title }}</td>
          <td class="vehicle-table__cell-vin">{{ vehicle.vin }}</td>
          <td>{{ vehicle.year }}</td>
          <td>{{ vehicle.rearWheel }}</td>
          <td>{{ vehicle.drive }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.vehicle-table-wrap {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;
}

.vehicle-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.vehicle-table thead {
  background: var(--color-bg-search);
  border-bottom: 1px solid #e8e8e8;
}

.vehicle-table th {
  padding: 0.65rem 0.85rem;
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.vehicle-table td {
  padding: 0.55rem 0.85rem;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}

.vehicle-table tbody tr:last-child td {
  border-bottom: none;
}

.vehicle-table__row {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.vehicle-table__row:hover {
  background: #fafafa;
}

.vehicle-table__row--selected {
  background: rgba(255, 0, 0, 0.04);
  box-shadow: inset 3px 0 0 var(--brand-color);
}

.vehicle-table__row--selected:hover {
  background: rgba(255, 0, 0, 0.06);
}

.vehicle-table__col-select,
.vehicle-table__cell-select {
  width: 52px;
  padding: 0.55rem 0.65rem;
  text-align: center;
  cursor: pointer;
}

.vehicle-table__cell-select:hover .vehicle-table__select-indicator {
  border-color: #aaa;
}

.vehicle-table__cell-select:focus-visible {
  outline: none;
}

.vehicle-table__cell-select:focus-visible .vehicle-table__select-indicator {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.vehicle-table__col-image,
.vehicle-table__cell-image {
  width: 72px;
  padding-right: 0.35rem;
}

.vehicle-table__cell-title {
  font-weight: 600;
  white-space: nowrap;
}

.vehicle-table__cell-vin {
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.vehicle-table__thumb-wrap {
  width: 56px;
  height: 38px;
}

.vehicle-table__thumb {
  display: block;
  width: 56px;
  height: 38px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
}

.vehicle-table__select-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: #fff;
  color: #fff;
  pointer-events: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.vehicle-table__select-indicator--active {
  background: var(--brand-color);
  border-color: var(--brand-color);
  color: #fff;
}

.vehicle-table__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
