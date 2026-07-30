<script setup lang="ts">
/**
 * The job discovery surface: search band, filter rail, and results grid.
 *
 * Shared by the public `/jobs` page and the candidate's `/candidate/jobs`, which
 * differ only in shell and in whether the inline apply control is offered.
 * Keeping them one component is what stops the two search experiences from
 * drifting apart.
 *
 * Responsive behaviour:
 *  - `lg` and up: persistent filter rail beside a two-column results grid.
 *  - below `lg`: filters move into a drawer, results become one column, and
 *    the active-filter chips stay visible so the narrowing is never hidden.
 */
import { computed, onMounted, ref } from 'vue'
import { SearchX } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { UiButton, UiEmptyState, UiErrorState, UiPagination, UiSheet, UiSkeleton } from '@/components/ui'
import { fadeRise, useStaggeredPreset } from '@/design/motion'
import { useJobSearch } from '@/composables/useJobSearch'
import type { PublicJobSummary } from '@/composables/usePublicJobs'
import ActiveFilterChips from './ActiveFilterChips.vue'
import JobCard from './JobCard.vue'
import JobFilterPanel from './JobFilterPanel.vue'
import JobSearchBar from './JobSearchBar.vue'

const { appliedJobIds, showApply = false } = defineProps<{
  /** Job ids the signed-in candidate has already applied to. */
  appliedJobIds?: Set<number>
  showApply?: boolean
}>()

const emit = defineEmits<{ apply: [job: PublicJobSummary] }>()

const {
  executeSearch,
  formError,
  isListLoading,
  jobs,
  paginationLinks,
  paginationMeta,
  store,
  syncFromQuery,
} = useJobSearch()

const filtersOpen = ref(false)
const cardMotion = useStaggeredPreset(fadeRise)

const resultLabel = computed(() => {
  if (isListLoading.value) return 'Searching…'

  const total = paginationMeta.value.total

  return total === 1 ? '1 job found' : `${total} jobs found`
})

function search(page = 1) {
  filtersOpen.value = false
  void executeSearch(page)
}

onMounted(() => {
  syncFromQuery()
  void executeSearch(store.page)
})
</script>

<template>
  <div class="grid gap-6">
    <JobSearchBar
      :result-label="resultLabel"
      @search="search(1)"
      @open-filters="filtersOpen = true"
    />

    <ActiveFilterChips @change="search(1)" />

    <div class="grid gap-6 lg:grid-cols-[var(--size-filter-rail)_minmax(0,1fr)] lg:items-start">
      <!-- Sticky so filters stay reachable while the results column scrolls. -->
      <div class="hidden lg:sticky lg:top-6 lg:block">
        <JobFilterPanel @search="search(1)" @reset="search(1)" />
      </div>

      <section aria-labelledby="results-heading" class="min-w-0">
        <h2 id="results-heading" class="sr-only">Search results</h2>

        <div
          v-if="isListLoading"
          class="grid gap-4 sm:grid-cols-2"
          role="status"
          aria-busy="true"
        >
          <span class="sr-only">Loading job listings</span>
          <UiSkeleton v-for="index in 6" :key="index" class="h-64" rounded="card" />
        </div>

        <UiErrorState
          v-else-if="formError"
          title="Jobs could not be loaded"
          :description="formError"
          @retry="search(store.page)"
        />

        <UiEmptyState
          v-else-if="jobs.length === 0"
          :icon="SearchX"
          title="No jobs match these filters"
          description="Try removing a filter or searching for a broader term."
        >
          <UiButton
            v-if="store.activeFiltersCount > 0"
            variant="secondary"
            @click="store.resetFilters(); search(1)"
          >
            Clear all filters
          </UiButton>
        </UiEmptyState>

        <template v-else>
          <ul class="grid gap-4 sm:grid-cols-2">
            <motion.li
              v-for="(job, index) in jobs"
              :key="job.id"
              v-bind="cardMotion(index)"
            >
              <JobCard
                :job="job"
                :show-apply="showApply"
                :applied="appliedJobIds?.has(job.id) ?? false"
                @apply="emit('apply', $event)"
              />
            </motion.li>
          </ul>

          <div class="mt-6">
            <UiPagination
              :links="paginationLinks"
              :meta="paginationMeta"
              :disabled="isListLoading"
              @page-change="search"
            />
          </div>
        </template>
      </section>
    </div>

    <UiSheet v-model:open="filtersOpen" side="left" title="Filter jobs">
      <JobFilterPanel layout="drawer" @search="search(1)" @reset="search(1)" />
    </UiSheet>
  </div>
</template>
