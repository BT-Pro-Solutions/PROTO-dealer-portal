<script setup>
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import VehicleCard from './VehicleCard.vue'

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

function openDetail(id) {
  router.push({ name: 'vehicle-detail', params: { id } })
}
</script>

<template>
  <section class="vehicle-grid-section">
    <div class="vehicle-grid-section__toolbar">
      <p class="vehicle-grid-section__count">
        Showing {{ resultCount }} Result{{ resultCount === 1 ? '' : 's' }}
      </p>

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
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
          <Icon icon="mdi:chevron-down" class="vehicle-grid-section__sort-icon" width="18" height="18" aria-hidden="true" />
        </span>
      </label>
    </div>

    <div v-if="vehicles.length" class="vehicle-grid">
      <VehicleCard
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :vehicle="vehicle"
        :selected="isSelected(vehicle.id)"
        @toggle-select="emit('toggle-select', $event)"
        @open-detail="openDetail"
      />
    </div>

    <p v-else class="vehicle-grid-section__empty">
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

.vehicle-grid-section__count {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
}

.vehicle-grid-section__sort {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-lg);
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
  font-size: var(--text-lg);
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
