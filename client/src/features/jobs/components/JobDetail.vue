<script setup lang="ts">
/**
 * The body of a public job listing.
 *
 * Long-form sections are constrained to a readable measure and rendered with
 * `whitespace-pre-line`, because employers paste plain text with their own line
 * breaks and the API stores it verbatim — there is no rich-text contract to
 * honour, and rendering it as HTML would be an injection risk.
 *
 * The apply panel is sticky on desktop so the primary action stays reachable
 * through a long description without the page hiding it behind a scroll.
 */
import { computed } from 'vue'
import { CalendarClock } from 'lucide-vue-next'
import { UiAlert, UiCard } from '@/components/ui'
import type { PublicJobDetail } from '@/composables/usePublicJobs'
import { formatDeadline, formatPostedDate } from '../utils/formatters'
import CompanySummary from './CompanySummary.vue'
import JobMetadata from './JobMetadata.vue'
import SalaryDisplay from './SalaryDisplay.vue'

const { job } = defineProps<{ job: PublicJobDetail }>()

const deadline = computed(() => formatDeadline(job.expires_at))

const sections = computed(() =>
  [
    { key: 'description', title: 'About this role', body: job.description },
    { key: 'responsibilities', title: 'Responsibilities', body: job.responsibilities },
    { key: 'qualifications', title: 'Requirements and qualifications', body: job.qualifications },
  ].filter((section) => Boolean(section.body?.trim())),
)
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
    <div class="grid min-w-0 gap-6">
      <UiCard>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <p v-if="job.category" class="text-meta font-semibold uppercase tracking-wider text-accent">
              {{ job.category }}
            </p>
            <h1 class="mt-1.5 text-page-title text-text-primary">{{ job.title }}</h1>

            <div class="mt-3">
              <CompanySummary
                :name="job.employer?.company_name"
                :logo-url="job.employer?.logo?.path"
              />
            </div>
          </div>

          <p class="shrink-0 text-meta text-text-muted">
            Posted {{ formatPostedDate(job.published_at) }}
          </p>
        </div>

        <div class="mt-5">
          <JobMetadata
            show-deadline
            :location="job.location"
            :work-type="job.work_type"
            :experience-level="job.experience_level"
            :salary-min="job.salary_min"
            :salary-max="job.salary_max"
            :expires-at="job.expires_at"
          />
        </div>

        <UiAlert v-if="deadline.passed" tone="warning" title="Applications have closed" class="mt-5">
          The deadline for this role has passed, so it is no longer accepting
          applications.
        </UiAlert>
      </UiCard>

      <UiCard v-for="section in sections" :key="section.key" as="section">
        <h2 class="text-section-title text-text-primary">{{ section.title }}</h2>
        <p class="mt-3 max-w-[var(--size-prose-max)] whitespace-pre-line text-body leading-7 text-text-secondary">
          {{ section.body }}
        </p>
      </UiCard>
    </div>

    <aside class="grid gap-4 lg:sticky lg:top-6">
      <!-- Apply panel supplied by the page, which owns role and auth logic. -->
      <slot name="apply" />

      <SalaryDisplay :min="job.salary_min" :max="job.salary_max" />

      <div
        v-if="job.expires_at"
        class="flex items-start gap-3 rounded-card border border-border bg-surface p-4"
      >
        <CalendarClock
          class="mt-0.5 size-5 shrink-0"
          :class="deadline.urgent ? 'text-warning-fg' : 'text-text-faint'"
          aria-hidden="true"
        />
        <div>
          <p class="text-support font-semibold text-text-primary">Application deadline</p>
          <p class="mt-0.5 text-support" :class="deadline.urgent ? 'text-warning-fg' : 'text-text-muted'">
            {{ deadline.label }}
          </p>
        </div>
      </div>

      <CompanySummary
        variant="panel"
        :name="job.employer?.company_name"
        :logo-url="job.employer?.logo?.path"
      />
    </aside>
  </div>
</template>
