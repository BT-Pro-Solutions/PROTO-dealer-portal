<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { formatQuoteDate } from '../../data/quotes.js'
import { useUpfitterQuotes } from '../../composables/useUpfitterQuotes.js'

const props = defineProps({
  quoteId: {
    type: String,
    required: true,
  },
  repliedAt: {
    type: String,
    default: null,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update'])

const { markQuoteReplied } = useUpfitterQuotes()
const saving = ref(false)

const isReplied = computed(() => Boolean(props.repliedAt))

async function handleToggle() {
  if (saving.value) return

  saving.value = true
  try {
    const updated = await markQuoteReplied(props.quoteId, !isReplied.value)
    if (updated) {
      emit('update', updated)
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <label
    class="replied-toggle"
    :class="{
      'replied-toggle--checked': isReplied,
      'replied-toggle--compact': compact,
    }"
    @click.prevent="handleToggle"
  >
    <span class="replied-toggle__box" aria-hidden="true">
      <Icon v-if="isReplied" icon="mdi:check-bold" width="14" height="14" />
    </span>
    <span class="replied-toggle__label">
      {{ isReplied ? 'Replied' : 'Mark replied' }}
    </span>
    <span v-if="isReplied && repliedAt && !compact" class="replied-toggle__date">
      {{ formatQuoteDate(repliedAt) }}
    </span>
  </label>
</template>

<style scoped>
.replied-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.18);
  border-radius: var(--radius-pill);
  background: #fff;
  cursor: pointer;
  user-select: none;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
}

.replied-toggle--compact {
  padding: 0.45rem 0.85rem;
  gap: 0.45rem;
}

.replied-toggle:hover {
  border-color: rgba(0, 0, 0, 0.32);
}

.replied-toggle--checked {
  border-color: #1a5c36;
  background: rgba(46, 125, 50, 0.1);
  box-shadow: inset 0 0 0 1px rgba(26, 92, 54, 0.15);
}

.replied-toggle--checked:hover {
  border-color: #134228;
}

.replied-toggle__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.22);
  border-radius: 50%;
  background: #fff;
  color: #fff;
  flex-shrink: 0;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.replied-toggle--checked .replied-toggle__box {
  border-color: #1a5c36;
  background: #1a5c36;
  color: #fff;
}

.replied-toggle--checked .replied-toggle__label {
  color: #1a5c36;
}

.replied-toggle__label {
  font-size: var(--text-sm);
  font-weight: 700;
  white-space: nowrap;
}

.replied-toggle--compact .replied-toggle__label {
  font-size: var(--text-xs);
}

.replied-toggle__date {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
