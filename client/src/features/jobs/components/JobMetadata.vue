<script setup lang="ts">
/**
 * The compact metadata row shared by job cards, list items, and detail pages —
 * location, work type, experience level, salary, deadline.
 *
 * Rendered as a `<ul>` because it is a list of facts; each pill carries its own
 * icon plus visible text, so nothing depends on the icon being understood.
 */
import { computed } from 'vue'
import { Banknote, CalendarClock, Briefcase, MapPin, TrendingUp } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'
import { experienceLevelLabel, workTypeLabel } from '@/lib/status'
import { formatDeadline, formatSalaryRange } from '../utils/formatters'

const {
  compact = false,
  experienceLevel,
  expiresAt,
  location,
  salaryMax,
  salaryMin,
  showDeadline = false,
  workType,
} = defineProps<{
  /** Uses abbreviated salary figures and tighter spacing, for dense cards. */
  compact?: boolean
  experienceLevel?: string | null
  expiresAt?: string | null
  location?: string | null
  salaryMax?: number | null
  salaryMin?: number | null
  showDeadline?: boolean
  workType?: string | null
}>()

interface MetaPill {
  key: string
  icon: LucideIcon
  /** Names the fact for screen readers, since the icon is decorative. */
  term: string
  label: string
  urgent?: boolean
}

const deadline = computed(() => formatDeadline(expiresAt))

const pills = computed<MetaPill[]>(() => {
  const items: MetaPill[] = [
    { key: 'location', icon: MapPin, term: 'Location', label: location || 'Location not set' },
    { key: 'work-type', icon: Briefcase, term: 'Work type', label: workTypeLabel(workType) },
  ]

  if (experienceLevel) {
    items.push({
      key: 'experience',
      icon: TrendingUp,
      term: 'Experience level',
      label: experienceLevelLabel(experienceLevel),
    })
  }

  items.push({
    key: 'salary',
    icon: Banknote,
    term: 'Salary',
    label: formatSalaryRange(salaryMin, salaryMax, compact),
  })

  if (showDeadline && expiresAt) {
    items.push({
      key: 'deadline',
      icon: CalendarClock,
      term: 'Application deadline',
      label: deadline.value.label,
      urgent: deadline.value.urgent,
    })
  }

  return items
})
</script>

<template>
  <ul class="flex flex-wrap items-center gap-1.5">
    <li
      v-for="pill in pills"
      :key="pill.key"
      class="inline-flex max-w-full items-center gap-1.5 rounded-control border px-2 py-1 text-meta font-medium"
      :class="
        pill.urgent
          ? 'border-warning-border bg-warning-bg text-warning-fg'
          : 'border-border bg-surface-subtle text-text-secondary'
      "
    >
      <component :is="pill.icon" class="size-3.5 shrink-0 text-text-faint" aria-hidden="true" />
      <span class="sr-only">{{ pill.term }}:</span>
      <span class="truncate">{{ pill.label }}</span>
    </li>
  </ul>
</template>
