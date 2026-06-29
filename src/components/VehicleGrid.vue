<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import VehicleCard from './VehicleCard.vue'
import VehicleTable from './VehicleTable.vue'
import { useVehicleSelection } from '../composables/useVehicleSelection.js'
import { loadInventoryViewMode, saveInventoryViewMode } from '../composables/useInventoryViewMode.js'

defineProps({
  vehicles: {
    type: Array,
    required: true,
  },
  resultCount: {
    type: Number,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['toggle-select', 'update:sortBy'])
const router = useRouter()
const { selectedCount, clearSelection } = useVehicleSelection()
const viewMode = ref(loadInventoryViewMode())

watch(viewMode, (mode) => {
  saveInventoryViewMode(mode)
})

function setViewMode(mode) {
  viewMode.value = mode
}

function openDetail(id) {
  router.push({ name: 'dealer-vehicle-detail', params: { id } })
}
</script>

<template>
  <section class="vehicle-grid-section">
    <div class="vehicle-grid-section__toolbar reveal reveal--delay-2">
      <div class="vehicle-grid-section__summary">
        <div class="vehicle-grid-section__view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            class="vehicle-grid-section__view-btn"
            :class="{ 'vehicle-grid-section__view-btn--active': viewMode === 'cards' }"
            :aria-pressed="viewMode === 'cards'"
            aria-label="Card view"
            @click="setViewMode('cards')"
          >
            <Icon icon="mdi:view-grid-outline" width="20" height="20" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="vehicle-grid-section__view-btn"
            :class="{ 'vehicle-grid-section__view-btn--active': viewMode === 'table' }"
            :aria-pressed="viewMode === 'table'"
            aria-label="Table view"
            @click="setViewMode('table')"
          >
            <Icon icon="mdi:view-list" width="20" height="20" aria-hidden="true" />
          </button>
        </div>

        <p class="vehicle-grid-section__count">
          Showing {{ resultCount }} Result{{ resultCount === 1 ? '' : 's' }}
          <span class="vehicle-grid-section__count-selected" v-if="selectedCount > 0">{{ selectedCount }} Selected</span>
          <button
            v-if="selectedCount > 0"
            type="button"
            class="vehicle-grid-section__unselect-all"
            @click="clearSelection"
          >
            Unselect all
          </button>
        </p>
      </div>

      <label class="vehicle-grid-section__sort">
        <span class="vehicle-grid-section__sort-label">Sort By:</span>
        <span class="vehicle-grid-section__sort-control">
          <select
            class="vehicle-grid-section__sort-select"
            :value="sortBy"
            @change="$emit('update:sortBy', $event.target.value)"
          >
            <option value="make_model">Make &amp; Model</option>
            <option value="year_desc">Year (Newest)</option>
            <option value="year_asc">Year (Oldest)</option>
          </select>
          <Icon icon="mdi:chevron-down" class="vehicle-grid-section__sort-icon" width="18" height="18" aria-hidden="true" />
        </span>
      </label>
    </div>

    <div v-if="vehicles.length && viewMode === 'cards'" class="vehicle-grid reveal-stagger">
      <VehicleCard
        v-for="(vehicle, index) in vehicles"
        :key="vehicle.id"
        :vehicle="vehicle"
        :selected="isSelected(vehicle.id)"
        :style="{ '--stagger-i': index }"
        @toggle-select="emit('toggle-select', $event)"
        @open-detail="openDetail"
      />
    </div>

    <VehicleTable
      v-else-if="vehicles.length && viewMode === 'table'"
      class="reveal reveal--delay-2"
      :vehicles="vehicles"
      :is-selected="isSelected"
      @toggle-select="emit('toggle-select', $event)"
      @open-detail="openDetail"
    />

    <p v-else-if="!vehicles.length" class="vehicle-grid-section__empty reveal reveal--delay-2">
      No vehicles match your filters. Try adjusting your search or filter criteria.
    </p>
  </section>
</template>

<style scoped>
.vehicle-grid-section {
  flex: 1;
  min-width: 0;
}

.vehicle-grid-section__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.vehicle-grid-section__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
}

.vehicle-grid-section__count {
  margin: 0;
  font-weight: 600;
}

.vehicle-grid-section__count-selected {
  margin-left: 0.35rem;
  padding-left: 0.5rem;
  border-left: 1px solid #ccc;
}

.vehicle-grid-section__unselect-all {
  margin-left: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: underline;
  cursor: pointer;
}

.vehicle-grid-section__unselect-all:hover {
  opacity: 0.7;
}

.vehicle-grid-section__view-toggle {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  background: var(--color-bg-search);
  border-radius: 999px;
  gap: 2px;
}

.vehicle-grid-section__view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  color: var(--color-text-muted);
  background: transparent;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.vehicle-grid-section__view-btn:hover {
  color: var(--color-text);
}

.vehicle-grid-section__view-btn--active {
  background: #000;
  color: #fff;
  &:hover {
    color: #fff;
  }
}

.vehicle-grid-section__sort {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.vehicle-grid-section__sort-label {
  font-weight: 400;
}

.vehicle-grid-section__sort-control {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.vehicle-grid-section__sort-select {
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0.25rem 1.75rem 0.25rem 0.25rem;
  appearance: none;
}

.vehicle-grid-section__sort-icon {
  position: absolute;
  right: 0;
  pointer-events: none;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--card-min-width)), 1fr));
  gap: clamp(1.25rem, 2vw, 2rem);
  align-items: start;
}

@media (min-width: 1100px) {
  .vehicle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1500px) {
  .vehicle-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1900px) {
  .vehicle-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 2300px) {
  .vehicle-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.vehicle-grid-section__empty {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}
</style>
