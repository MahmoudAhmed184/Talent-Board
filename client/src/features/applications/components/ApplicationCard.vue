<script setup lang="ts">
/**
 * A candidate's own application, as shown in their history.
 *
 * Leads with the job title (what the candidate is tracking) and carries the
 * status as a labelled badge plus a plain-language line, so the outcome is
 * legible without decoding a colour.
 */
import { computed } from 'vue'
import { Building2, CalendarDays, FileText } from 'lucide-vue-next'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge.vue'
import { UiButton } from '@/components/ui'
import { applicationStatus, isCancellable } from '@/lib/status'
import { formatRelative } from '@/features/jobs/utils/formatters'
import type { CandidateApplication } from '@/features/candidate/types'

const { application, cancelling = false } = defineProps<{
  application: CandidateApplication
  cancelling?: boolean
}>()

const emit = defineEmits<{ cancel: [application: CandidateApplication] }>()

const descriptor = computed(() => applicationStatus(application.status))
const canCancel = computed(() => isCancellable(application.status))
const jobId = computed(() => application.job_listing?.id ?? application.job_listing_id)
</script>

<template>
  <article class="rounded-card border border-border bg-surface p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-card-title text-text-primary">
          <RouterLink
            v-if="jobId"
            :to="`/jobs/${jobId}`"
            class="rounded-control hover:text-accent hover:underline"
          >
            {{ application.job_listing?.title || 'Job listing' }}
          </RouterLink>
          <template v-else>{{ application.job_listing?.title || 'Job listing' }}</template>
        </h3>

        <p class="mt-1 flex items-center gap-1.5 text-support text-text-muted">
          <Building2 class="size-4 shrink-0" aria-hidden="true" />
          {{ application.job_listing?.employer?.company_name || 'Hiring company' }}
        </p>
      </div>

      <ApplicationStatusBadge :status="application.status" />
    </div>

    <p class="mt-3 text-support text-text-secondary">{{ descriptor.description }}</p>

    <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-meta text-text-muted">
      <div class="flex items-center gap-1.5">
        <CalendarDays class="size-3.5" aria-hidden="true" />
        <dt class="sr-only">Submitted</dt>
        <dd>Applied {{ formatRelative(application.submitted_at) }}</dd>
      </div>

      <div class="flex items-center gap-1.5">
        <FileText class="size-3.5" aria-hidden="true" />
        <dt class="sr-only">Submission method</dt>
        <dd>
          {{
            application.submission_mode === 'resume'
              ? application.resume?.original_name || 'Resume attached'
              : 'Contact details forwarded'
          }}
        </dd>
      </div>
    </dl>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <UiButton
        v-if="jobId"
        size="sm"
        variant="secondary"
        :to="`/candidate/applications/${application.id}`"
      >
        View details
      </UiButton>

      <UiButton
        v-if="canCancel"
        size="sm"
        variant="danger-ghost"
        :loading="cancelling"
        @click="emit('cancel', application)"
      >
        Withdraw application
      </UiButton>
    </div>
  </article>
</template>
