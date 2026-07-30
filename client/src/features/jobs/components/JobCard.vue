<script setup lang="ts">
/**
 * The primary job listing card used across public discovery and candidate search.
 *
 * Accessibility notes that drive the markup:
 *  - The card is an `<article>`, not a clickable `<div>`. The title holds the
 *    only link, stretched over the whole card with a pseudo-element, so the
 *    card has exactly one entry in the tab order and a meaningful accessible
 *    name ("Senior Vue Engineer") rather than "link".
 *  - The Apply control sits above that overlay (`relative z-10`) so it stays
 *    separately reachable instead of being swallowed by the title link.
 *  - The pastel surface is decorative and derived from the job id, so a listing
 *    keeps its colour between renders. It never encodes status.
 */
import { computed } from 'vue'
import { Check, Send } from 'lucide-vue-next'
import { UiButton } from '@/components/ui'
import { pastelForId } from '@/lib/tone'
import type { PublicJobSummary } from '@/composables/usePublicJobs'
import { descriptionSnippet, formatPostedDate } from '../utils/formatters'
import CompanySummary from './CompanySummary.vue'
import JobMetadata from './JobMetadata.vue'

const {
  applied = false,
  applying = false,
  job,
  showApply = false,
} = defineProps<{
  applied?: boolean
  applying?: boolean
  job: PublicJobSummary
  /** Only candidates see the inline apply control. */
  showApply?: boolean
}>()

const emit = defineEmits<{ apply: [job: PublicJobSummary] }>()

const surface = computed(() => pastelForId(job.id))
const logoUrl = computed(() => job.employer?.logo?.path ?? null)
</script>

<template>
  <article
    class="group relative flex h-full flex-col gap-4 rounded-card border border-ink-950/10 p-5 transition-[transform,box-shadow] duration-[var(--duration-control)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:shadow-card-hover motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0"
    :class="surface"
  >
    <div class="flex items-start justify-between gap-3">
      <CompanySummary :name="job.employer?.company_name" :logo-url="logoUrl" />
      <p class="shrink-0 text-meta text-ink-800">{{ formatPostedDate(job.published_at) }}</p>
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="text-card-title text-ink-950">
        <!--
          `after:absolute after:inset-0` is what makes the whole card
          activatable without turning it into a div with a click handler.
        -->
        <RouterLink
          :to="`/jobs/${job.id}`"
          class="rounded-control after:absolute after:inset-0 after:rounded-card group-hover:underline"
        >
          {{ job.title }}
        </RouterLink>
      </h3>

      <p v-if="job.category" class="mt-1 text-meta font-medium text-ink-800">
        {{ job.category }}
      </p>

      <p class="mt-2 line-clamp-2 text-support leading-6 text-ink-800">
        {{ descriptionSnippet(job.description, 140) }}
      </p>
    </div>

    <JobMetadata
      compact
      :location="job.location"
      :work-type="job.work_type"
      :experience-level="job.experience_level"
      :salary-min="job.salary_min"
      :salary-max="job.salary_max"
    />

    <div v-if="showApply" class="relative z-10 flex justify-end">
      <UiButton
        v-if="applied"
        size="sm"
        variant="secondary"
        disabled
        :aria-label="`Already applied to ${job.title}`"
      >
        <template #icon><Check class="size-4" aria-hidden="true" /></template>
        Applied
      </UiButton>
      <UiButton
        v-else
        size="sm"
        :loading="applying"
        :aria-label="`Apply to ${job.title}`"
        @click="emit('apply', job)"
      >
        <template #icon><Send class="size-4" aria-hidden="true" /></template>
        Apply
      </UiButton>
    </div>
  </article>
</template>
