<script setup lang="ts">
/**
 * The dark search band at the top of job discovery.
 *
 * Holds the keyword field, the result count, and — below `lg` — the button
 * that opens the filter drawer. The filter button shows the active count so
 * mobile users can tell that results are narrowed without opening the drawer.
 */
import { SlidersHorizontal } from 'lucide-vue-next'
import { UiSearchInput } from '@/components/ui'
import { useSearchStore } from '@/stores/useSearchStore'

const { resultLabel } = defineProps<{
  /** e.g. "128 jobs". Rendered next to the field on large screens. */
  resultLabel?: string
}>()

const emit = defineEmits<{ search: []; 'open-filters': [] }>()

const store = useSearchStore()
</script>

<template>
  <section
    class="rounded-panel bg-surface-inverse px-4 py-5 sm:px-6 sm:py-6"
    aria-labelledby="job-search-heading"
  >
    <h2 id="job-search-heading" class="sr-only">Search jobs</h2>

    <form class="flex flex-col gap-3 sm:flex-row sm:items-center" @submit.prevent="emit('search')">
      <div class="min-w-0 flex-1">
        <UiSearchInput
          v-model="store.q"
          label="Search jobs by title or description"
          placeholder="Search by job title, skill, or keyword"
          size="lg"
          tone="dark"
          @submit="emit('search')"
          @clear="emit('search')"
        />
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-field border border-border-inverse bg-ink-800 px-4 text-support font-semibold text-text-inverse transition-colors duration-[var(--duration-control)] hover:border-muted-600 lg:hidden"
          @click="emit('open-filters')"
        >
          <SlidersHorizontal class="size-4" aria-hidden="true" />
          Filters
          <span
            v-if="store.activeFiltersCount > 0"
            class="inline-flex size-5 items-center justify-center rounded-full bg-brand-600 text-[0.6875rem] font-bold text-ink-950"
          >
            {{ store.activeFiltersCount }}
            <span class="sr-only">filters active</span>
          </span>
        </button>

        <button
          type="submit"
          class="inline-flex h-12 flex-1 items-center justify-center rounded-field bg-brand-600 px-6 text-support font-semibold text-ink-950 transition-[background-color,transform] duration-[var(--duration-control)] hover:bg-brand-400 active:scale-[0.98] sm:flex-none"
        >
          Search
        </button>
      </div>
    </form>

    <p v-if="resultLabel" class="mt-4 text-support text-text-inverse-muted" aria-live="polite">
      {{ resultLabel }}
    </p>
  </section>
</template>
