<script setup lang="ts">
/**
 * Removable summary of the filters currently narrowing the results.
 *
 * Exists so that "no jobs found" is never a mystery — the reason is on screen
 * and each cause can be removed individually. Taxonomy ids are resolved to
 * their names, because "Category 4" tells the user nothing.
 */
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { AnimatePresence, motion } from 'motion-v'
import { useSearchStore } from '@/stores/useSearchStore'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { chipTransition, useMotionPreset } from '@/design/motion'
import { experienceLevelLabel, workTypeLabel } from '@/lib/status'
import { formatDate, formatSalaryRange } from '../utils/formatters'

const emit = defineEmits<{ change: [] }>()

const store = useSearchStore()
const { categoryName, locationName } = useTaxonomies()
// Named `chipMotion`, not `chip`: the v-for below binds each item to `chip`,
// and a shadowed preset would silently bind the wrong object.
const chipMotion = useMotionPreset(chipTransition)

interface FilterChip {
  key: string
  /** What the filter narrows by, announced before the value. */
  term: string
  label: string
  clear: () => void
}

const chips = computed<FilterChip[]>(() => {
  const items: FilterChip[] = []

  if (store.q) {
    items.push({
      key: 'q',
      term: 'Keyword',
      label: store.q,
      clear: () => { store.q = '' },
    })
  }

  if (store.category_id !== null) {
    items.push({
      key: 'category',
      term: 'Category',
      label: categoryName(store.category_id) ?? 'Selected category',
      clear: () => { store.category_id = null },
    })
  }

  if (store.location_id !== null) {
    items.push({
      key: 'location',
      term: 'Location',
      label: locationName(store.location_id) ?? 'Selected location',
      clear: () => { store.location_id = null },
    })
  }

  if (store.work_type) {
    items.push({
      key: 'work-type',
      term: 'Work type',
      label: workTypeLabel(store.work_type),
      clear: () => { store.work_type = null },
    })
  }

  if (store.experience_level) {
    items.push({
      key: 'experience',
      term: 'Experience level',
      label: experienceLevelLabel(store.experience_level),
      clear: () => { store.experience_level = null },
    })
  }

  // One chip for the pair: clearing "salary" should clear the whole range.
  if (store.salary_min !== null || store.salary_max !== null) {
    items.push({
      key: 'salary',
      term: 'Salary',
      label: formatSalaryRange(store.salary_min, store.salary_max, true),
      clear: () => {
        store.salary_min = null
        store.salary_max = null
      },
    })
  }

  if (store.posted_after) {
    items.push({
      key: 'posted-after',
      term: 'Posted from',
      label: formatDate(store.posted_after),
      clear: () => { store.posted_after = null },
    })
  }

  if (store.posted_before) {
    items.push({
      key: 'posted-before',
      term: 'Posted to',
      label: formatDate(store.posted_before),
      clear: () => { store.posted_before = null },
    })
  }

  return items
})

function remove(chipToRemove: FilterChip) {
  chipToRemove.clear()
  emit('change')
}

function clearAll() {
  store.resetFilters()
  emit('change')
}
</script>

<template>
  <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-2">
    <h2 class="sr-only">Active filters</h2>

    <AnimatePresence>
      <motion.span
        v-for="chip in chips"
        :key="chip.key"
        layout
        class="inline-flex h-8 max-w-full items-center gap-1 rounded-pill border border-border bg-surface pl-3 pr-1 text-meta font-medium text-text-secondary"
        v-bind="chipMotion"
      >
        <span class="truncate">
          <span class="text-text-muted">{{ chip.term }}:</span> {{ chip.label }}
        </span>
        <button
          type="button"
          class="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary"
          @click="remove(chip)"
        >
          <X class="size-3.5" aria-hidden="true" />
          <span class="sr-only">Remove {{ chip.term }} filter</span>
        </button>
      </motion.span>
    </AnimatePresence>

    <button
      type="button"
      class="ml-1 rounded-control px-2 py-1 text-meta font-semibold text-accent transition-colors duration-[var(--duration-instant)] hover:bg-brand-50 hover:underline"
      @click="clearAll"
    >
      Clear all
    </button>
  </div>
</template>
