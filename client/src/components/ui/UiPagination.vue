<script setup lang="ts">
/**
 * Pagination for JSON:API-style paginated collections.
 *
 * Reads page numbers out of the API's own `links` where available so it never
 * disagrees with the server about what the next page is.
 */
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { JsonApiPaginationLinks, JsonApiPaginationMeta } from '../../types/pagination'

const { disabled = false, links, meta } = defineProps<{
  disabled?: boolean
  links: JsonApiPaginationLinks
  meta: JsonApiPaginationMeta
}>()

const emit = defineEmits<{ 'page-change': [page: number] }>()

const currentPage = computed(() => meta.current_page)
const lastPage = computed(() => Math.max(meta.last_page, 1))
const hasMultiplePages = computed(() => lastPage.value > 1)

const summary = computed(() => {
  if (meta.total === 0) {
    return 'No results'
  }

  return `Showing ${meta.from ?? 0}–${meta.to ?? 0} of ${meta.total}`
})

/**
 * A sliding window of at most five numbers, clamped to the real range so the
 * control does not offer pages that do not exist.
 */
const visiblePages = computed(() => {
  const count = Math.min(5, lastPage.value)
  const maxStart = Math.max(lastPage.value - count + 1, 1)
  const start = Math.min(Math.max(currentPage.value - 2, 1), maxStart)

  return Array.from({ length: count }, (_, index) => start + index)
})

function pageFromUrl(url: string | null | undefined, fallback: number): number {
  if (!url) {
    return fallback
  }

  try {
    const page = Number(new URL(url, window.location.origin).searchParams.get('page'))

    return Number.isFinite(page) && page > 0 ? page : fallback
  } catch {
    return fallback
  }
}

function goToPage(page: number) {
  if (disabled || page < 1 || page > lastPage.value || page === currentPage.value) {
    return
  }

  emit('page-change', page)
}

const stepClasses =
  'inline-flex h-10 min-w-10 coarse:h-11 coarse:min-w-11 items-center justify-center gap-1 rounded-field border border-border bg-surface px-3 text-support font-semibold text-text-secondary transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <nav
    v-if="hasMultiplePages"
    class="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    aria-label="Pagination"
  >
    <!-- Announced so a page change is perceivable without watching the list. -->
    <p class="text-support text-text-muted" aria-live="polite">{{ summary }}</p>

    <div class="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        :class="stepClasses"
        :disabled="disabled || !links.prev"
        @click="goToPage(pageFromUrl(links.prev, currentPage - 1))"
      >
        <ChevronLeft class="size-4" aria-hidden="true" />
        <span class="hidden sm:inline">Previous</span>
        <span class="sr-only sm:hidden">Previous page</span>
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        class="inline-flex h-10 min-w-10 coarse:h-11 coarse:min-w-11 items-center justify-center rounded-field border px-3 text-support font-semibold tabular-nums transition-colors duration-[var(--duration-instant)]"
        :class="
          page === currentPage
            ? 'border-accent bg-accent text-text-inverse'
            : 'border-border bg-surface text-text-secondary hover:bg-surface-sunken'
        "
        :aria-label="`Page ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
        :disabled="disabled"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        :class="stepClasses"
        :disabled="disabled || !links.next"
        @click="goToPage(pageFromUrl(links.next, currentPage + 1))"
      >
        <span class="hidden sm:inline">Next</span>
        <span class="sr-only sm:hidden">Next page</span>
        <ChevronRight class="size-4" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>
