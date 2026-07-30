<script setup lang="ts">
/**
 * Prominent salary figure for job detail pages.
 *
 * When no range is published this says so plainly rather than hiding the
 * block — a missing salary is information a candidate acts on.
 */
import { computed } from 'vue'
import { formatSalaryRange } from '../utils/formatters'

const { max, min } = defineProps<{
  max?: number | null
  min?: number | null
}>()

const hasRange = computed(() => Boolean(min || max))
const label = computed(() => formatSalaryRange(min, max))
</script>

<template>
  <div class="rounded-card border border-border bg-surface-subtle p-4">
    <p class="text-meta font-semibold uppercase tracking-wide text-text-muted">
      Salary range
    </p>
    <p
      class="mt-1 text-card-title tabular-nums"
      :class="hasRange ? 'text-text-primary' : 'text-text-muted'"
    >
      {{ label }}
    </p>
    <p v-if="!hasRange" class="mt-1 text-meta text-text-muted">
      This employer has not published a salary range.
    </p>
  </div>
</template>
