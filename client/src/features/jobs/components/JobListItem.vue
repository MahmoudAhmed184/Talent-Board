<script setup lang="ts">
/**
 * Dense single-row representation of a listing, for employer and admin lists
 * where moderation status matters more than visual appeal.
 *
 * Uses the same stretched-title-link pattern as JobCard so the row is
 * activatable without becoming an unlabelled clickable container.
 */
import { computed } from 'vue'
import { UiCompanyLogo } from '@/components/ui'
import { formatRelative } from '../utils/formatters'
import JobMetadata from './JobMetadata.vue'
import JobStatusBadge from './JobStatusBadge.vue'

const { companyName, job, to } = defineProps<{
  companyName?: string | null
  job: {
    id: number
    title: string
    approval_status: string
    location?: string | null
    category?: string | null
    work_type?: string | null
    experience_level?: string | null
    salary_min?: number | null
    salary_max?: number | null
    expires_at?: string | null
    updated_at?: string | null
    created_at?: string | null
  }
  /** Destination for the title link. */
  to: string
}>()

const lastActivity = computed(() => job.updated_at ?? job.created_at ?? null)
</script>

<template>
  <article
    class="group relative flex flex-col gap-3 rounded-card border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-[var(--duration-control)] hover:border-border-strong hover:shadow-raised sm:flex-row sm:items-start sm:gap-4"
  >
    <UiCompanyLogo :name="companyName" size="sm" class="hidden sm:block" />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="min-w-0 text-card-title text-text-primary">
          <RouterLink :to="to" class="rounded-control after:absolute after:inset-0 after:rounded-card group-hover:underline">
            {{ job.title }}
          </RouterLink>
        </h3>
        <JobStatusBadge
          :approval-status="job.approval_status"
          :expires-at="job.expires_at"
          size="sm"
        />
      </div>

      <p v-if="job.category" class="mt-0.5 text-meta text-text-muted">{{ job.category }}</p>

      <div class="mt-3">
        <JobMetadata
          compact
          :location="job.location"
          :work-type="job.work_type"
          :experience-level="job.experience_level"
          :salary-min="job.salary_min"
          :salary-max="job.salary_max"
        />
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
      <p v-if="lastActivity" class="text-meta text-text-muted">
        Updated {{ formatRelative(lastActivity) }}
      </p>
      <!-- Actions sit above the stretched title link. -->
      <div v-if="$slots.actions" class="relative z-10 flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>
