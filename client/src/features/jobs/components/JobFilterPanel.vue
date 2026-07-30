<script setup lang="ts">
/**
 * The full filter set, bound to the search store.
 *
 * One component serves both the desktop sidebar rail and the mobile drawer:
 * the layout differs but the controls, labels, and validation do not, so the
 * two can never drift. It renders a real `<form>` so Enter submits, and the
 * search is applied on submit rather than on every keystroke — filter changes
 * rewrite the URL and refetch, which is too expensive to do per character.
 */
import { computed, onMounted } from 'vue'
import { RotateCcw, SlidersHorizontal } from 'lucide-vue-next'
import { UiAlert, UiButton, UiInput, UiSelect } from '@/components/ui'
import { useTaxonomies } from '@/composables/useTaxonomies'
import { useSearchStore } from '@/stores/useSearchStore'
import { EXPERIENCE_LEVEL_OPTIONS, WORK_TYPE_OPTIONS } from '@/lib/status'

const { layout = 'sidebar' } = defineProps<{
  layout?: 'sidebar' | 'drawer'
}>()

const emit = defineEmits<{ search: []; reset: [] }>()

const store = useSearchStore()
const { categories, error: taxonomyError, loadTaxonomies, locations } = useTaxonomies()

const categoryOptions = computed(() =>
  categories.value.map((item) => ({ value: item.id, label: item.name })),
)
const locationOptions = computed(() =>
  locations.value.map((item) => ({ value: item.id, label: item.name })),
)

/** Guards against a range the API would reject, before the request is made. */
const salaryError = computed(() => {
  const { salary_max: max, salary_min: min } = store

  return min !== null && max !== null && min > max
    ? 'Maximum must be greater than the minimum.'
    : ''
})

function submit() {
  if (salaryError.value) {
    return
  }

  emit('search')
}

function reset() {
  store.resetFilters()
  emit('reset')
}

onMounted(() => {
  void loadTaxonomies()
})
</script>

<template>
  <form
    class="grid gap-5"
    :class="layout === 'sidebar' ? 'rounded-card border border-border bg-surface p-5' : ''"
    aria-labelledby="job-filters-heading"
    @submit.prevent="submit"
  >
    <div v-if="layout === 'sidebar'" class="flex items-center gap-2 border-b border-border pb-4">
      <SlidersHorizontal class="size-4 text-accent" aria-hidden="true" />
      <h2 id="job-filters-heading" class="text-support font-semibold text-text-primary">
        Filters
      </h2>
    </div>
    <h2 v-else id="job-filters-heading" class="sr-only">Filters</h2>

    <UiAlert v-if="taxonomyError" tone="warning" title="Some filters are unavailable">
      {{ taxonomyError }} You can still search by keyword.
    </UiAlert>

    <UiInput
      v-model="store.q"
      label="Keyword"
      type="search"
      placeholder="Job title or description"
      hint="Matches the job title and description."
    />

    <UiSelect
      v-model="store.category_id"
      label="Category"
      placeholder="All categories"
      :options="categoryOptions"
    />

    <UiSelect
      v-model="store.location_id"
      label="Location"
      placeholder="All locations"
      :options="locationOptions"
    />

    <UiSelect
      v-model="store.work_type"
      label="Work type"
      placeholder="Any work type"
      :options="WORK_TYPE_OPTIONS"
    />

    <UiSelect
      v-model="store.experience_level"
      label="Experience level"
      placeholder="Any level"
      :options="EXPERIENCE_LEVEL_OPTIONS"
    />

    <fieldset class="grid gap-3">
      <legend class="mb-1 text-support font-medium text-text-secondary">Salary range (USD)</legend>
      <div class="grid grid-cols-2 gap-3">
        <UiInput v-model="store.salary_min" label="Minimum" type="number" :min="0" placeholder="0" />
        <UiInput
          v-model="store.salary_max"
          label="Maximum"
          type="number"
          :min="0"
          placeholder="Any"
          :error="salaryError"
        />
      </div>
    </fieldset>

    <fieldset class="grid gap-3">
      <legend class="mb-1 text-support font-medium text-text-secondary">Date posted</legend>
      <div class="grid grid-cols-2 gap-3">
        <UiInput v-model="store.posted_after" label="From" type="date" />
        <UiInput v-model="store.posted_before" label="To" type="date" />
      </div>
    </fieldset>

    <div class="grid gap-2 pt-1">
      <UiButton type="submit" block :disabled="Boolean(salaryError)">Apply filters</UiButton>
      <UiButton
        v-if="store.activeFiltersCount > 0"
        type="button"
        variant="ghost"
        block
        @click="reset"
      >
        <template #icon><RotateCcw class="size-4" aria-hidden="true" /></template>
        Clear all filters
      </UiButton>
    </div>
  </form>
</template>
