<script setup>
import { ref, inject } from 'vue'
import SidebarFilters from '../../components/SidebarFilters.vue'
import VehicleGrid from '../../components/VehicleGrid.vue'
import { useVehicleFilters } from '../../composables/useVehicleFilters.js'
import { useVehicleSelection } from '../../composables/useVehicleSelection.js'

const catalog = inject('catalog')
const mobileFiltersOpen = ref(false)

const { filters, sortBy, filteredVehicles, resultCount, setMake, toggleColor, toggleArrayFilter } =
  useVehicleFilters(catalog)

const { toggleSelection, isSelected } = useVehicleSelection()
</script>

<template>
  <div class="inventory">
    <button
      type="button"
      class="inventory__filters-toggle reveal"
      :aria-expanded="mobileFiltersOpen"
      @click="mobileFiltersOpen = !mobileFiltersOpen"
    >
      {{ mobileFiltersOpen ? 'Hide Filters' : 'Show Filters' }}
    </button>

    <div class="inventory__layout" :class="{ 'inventory__layout--filters-open': mobileFiltersOpen }">
      <SidebarFilters
        class="inventory__sidebar reveal reveal--delay-1"
        :filters="filters"
        @set-make="setMake"
        @toggle-color="toggleColor"
        @toggle-filter="toggleArrayFilter"
      />

      <VehicleGrid
        :vehicles="filteredVehicles"
        :result-count="resultCount"
        :sort-by="sortBy"
        :is-selected="isSelected"
        @toggle-select="toggleSelection"
        @update:sort-by="sortBy = $event"
      />
    </div>
  </div>
</template>

<style scoped>
.inventory {
  max-width: var(--content-wide-max);
  margin: 0 auto;
}

.inventory__filters-toggle {
  display: none;
  width: 100%;
  margin-bottom: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-search);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-base);
}

.inventory__layout {
  display: flex;
  gap: var(--layout-gap);
  align-items: flex-start;
}

.inventory__sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .inventory__filters-toggle {
    display: block;
  }

  .inventory__layout {
    flex-direction: column;
  }

  .inventory__sidebar {
    display: none;
    width: 100%;
    background: var(--color-bg-search);
    padding: var(--space-lg);
    border-radius: var(--radius-md);
  }

  .inventory__layout--filters-open .inventory__sidebar {
    display: flex;
  }
}
</style>
