<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import VehicleImageGallery from '../../components/VehicleImageGallery.vue'
import UpfitterPromo from '../../components/UpfitterPromo.vue'
import { vehicleDetailFields, formatDetailValue } from '../../data/vehicles.js'
import { fetchUpfitterProfile } from '../../data/dealer.js'
import { useVehicleSelection } from '../../composables/useVehicleSelection.js'
import { flyCardToRequestButton } from '../../composables/useFlyToRequest.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const catalog = inject('catalog')
const router = useRouter()
const upfitterProfile = ref(null)
const { isSelected, toggleSelection } = useVehicleSelection()
const addToQuoteBtnRef = ref(null)

onMounted(async () => {
  upfitterProfile.value = await fetchUpfitterProfile()
})

const vehicle = computed(() => catalog.value.find((v) => v.id === props.id))

const detailRows = computed(() => {
  if (!vehicle.value) return []
  return vehicleDetailFields.map((field) => ({
    label: field.label,
    value: formatDetailValue(vehicle.value, field),
  }))
})

function goBack() {
  router.push({ name: 'dealer-inventory' })
}

function handleToggleQuote() {
  if (!vehicle.value) return

  if (isSelected(vehicle.value.id)) {
    toggleSelection(vehicle.value.id)
    return
  }

  const source = addToQuoteBtnRef.value
  if (!source) return

  const sourceRect = source.getBoundingClientRect()
  const staticClone = source.cloneNode(true)
  staticClone.textContent = 'Add To Request'
  staticClone.classList.remove('detail__select-btn--selected')

  toggleSelection(vehicle.value.id)
  flyCardToRequestButton(source, staticClone, sourceRect)
}
</script>

<template>
  <div v-if="vehicle" class="detail page-content page-content--narrow">
    <button type="button" class="detail__back reveal" @click="goBack">
      <Icon icon="mdi:arrow-left" width="18" height="18" aria-hidden="true" />
      Back to inventory
    </button>

    

    <div class="detail__layout">
      <div class="detail__left reveal reveal--delay-2">
        <div class="detail__media">
          <VehicleImageGallery :images="vehicle.imageUrls" :alt="vehicle.title" />
        </div>

        <section class="detail__specs-section reveal reveal--delay-3" aria-labelledby="vehicle-specs-heading">
          <h2 id="vehicle-specs-heading" class="detail__specs-heading">Full Vehicle Spec</h2>

          <table class="detail__table">
            <tbody>
              <tr v-for="row in detailRows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
      <div class="detail__right">
        <div class="detail__header reveal reveal--delay-1">
          <div>
            <h1 class="detail__title">{{ vehicle.title }}</h1>
            <p class="detail__meta">{{ vehicle.year }} · {{ vehicle.make }}</p>
          </div>

          <button
            ref="addToQuoteBtnRef"
            type="button"
            class="detail__select-btn"
            :class="{ 'detail__select-btn--selected': isSelected(vehicle.id) }"
            @click="handleToggleQuote"
          >
            {{ isSelected(vehicle.id) ? 'Remove From Request' : 'Add To Request' }}
          </button>
        </div>
        <UpfitterPromo v-if="upfitterProfile" :profile="upfitterProfile" />
      </div>
      
    </div>
  </div>

  <div v-else class="page-content page-content--narrow">
    <p class="detail__missing">Vehicle not found.</p>
    <RouterLink :to="{ name: 'dealer-inventory' }">Return to inventory</RouterLink>
  </div>
</template>

<style scoped>
.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: var(--space-lg);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  padding: 0;
}

.detail__back:hover {
  text-decoration: underline;
}

.detail__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.detail__title {
  margin: 0 0 var(--space-xs);
  font-size: 1.75rem;
  font-weight: 800;
}

.detail__meta {
  margin: 0;
  color: var(--color-text-muted);
  font-weight: 400;
}

.detail__layout {
  display: flex;
  gap: var(--space-2xl);
  align-items: start;
}

.detail__left {
  display: flex;
  flex-direction: column;
  min-width: 65%;
}

.detail__media {
  position: relative;
}

.detail__specs-section {
  background: var(--color-bg-card);
  color: #fff;
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  margin-top: var(--space-xl);
}

.detail__specs-heading {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-xl);
  font-weight: 700;
}

.detail__table {
  width: 100%;
  border-collapse: collapse;
}

.detail__table th,
.detail__table td {
  padding: 0.75rem 0;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--color-border);
}

.detail__table tr:last-child th,
.detail__table tr:last-child td {
  border-bottom: none;
}

.detail__table th {
  width: 42%;
  padding-right: var(--space-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  color: #ccc;
}

.detail__table td {
  font-size: var(--text-base);
  font-weight: 600;
}

.detail__select-btn {
  background: var(--brand-color);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  padding: 1rem 2rem;
  border-radius: 50px;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.detail__select-btn--selected {
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-primary);
}

.detail__select-btn:hover {
  opacity: 0.85;
}

.detail__missing {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .detail__layout {
    flex-direction: column;
    width: 100%;
  }

  .detail__table th {
    width: 45%;
  }
}
</style>
