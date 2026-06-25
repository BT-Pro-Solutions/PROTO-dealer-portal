<script setup>
import { ref, watch, computed } from 'vue'
import { vehicleHasImages } from '../data/vehicles.js'
import VehicleImagePlaceholder from './VehicleImagePlaceholder.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  alt: {
    type: String,
    default: 'Vehicle photo',
  },
})

const activeIndex = ref(0)

const hasImages = computed(() => vehicleHasImages({ imageUrls: props.images }))

watch(
  () => props.images,
  () => {
    activeIndex.value = 0
  },
)

function selectImage(index) {
  activeIndex.value = index
}
</script>

<template>
  <div class="gallery">
    <div class="gallery__main">
      <img
        v-if="hasImages"
        :src="images[activeIndex]"
        :alt="`${alt} — photo ${activeIndex + 1} of ${images.length}`"
        class="gallery__main-image"
      />
      <VehicleImagePlaceholder v-else :alt="`${alt} — no photo available`" />
    </div>

    <div v-if="images.length > 1" class="gallery__thumbs" role="tablist" aria-label="Vehicle photos">
      <button
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        type="button"
        class="gallery__thumb"
        :class="{ 'gallery__thumb--active': index === activeIndex }"
        role="tab"
        :aria-selected="index === activeIndex"
        :aria-label="`View photo ${index + 1}`"
        @click="selectImage(index)"
      >
        <img :src="image" :alt="`${alt} thumbnail ${index + 1}`" class="gallery__thumb-image" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.gallery__main {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-muted);
}

.gallery__main-image {
  display: block;
  width: 100%;
  aspect-ratio: 400 / 268;
  object-fit: cover;
}

.gallery__thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.gallery__thumb {
  flex: 0 0 auto;
  width: 72px;
  height: 52px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.gallery__thumb--active {
  border-color: var(--color-primary);
}

.gallery__thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
