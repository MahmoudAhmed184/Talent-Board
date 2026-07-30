<script setup lang="ts">
/**
 * One listing awaiting moderation.
 *
 * Surfaces the facts an admin actually decides on — employer, category,
 * location, how long it has been waiting — rather than a truncated description.
 * Wait time is prominent because it is the queue's fairness signal.
 */
import { computed } from 'vue'
import { Building2, Clock, MapPin, Tag } from 'lucide-vue-next'
import { UiButton } from '@/components/ui'
import JobStatusBadge from '@/features/jobs/components/JobStatusBadge.vue'
import { formatRelative } from '@/features/jobs/utils/formatters'
import type { AdminJobListing } from '@/stores/useAdminJobsStore'

const { job } = defineProps<{ job: AdminJobListing }>()

const waitingSince = computed(() => job.updated_at ?? job.published_at ?? null)
</script>

<template>
  <article class="rounded-card border border-border bg-surface p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-card-title text-text-primary">
          <RouterLink
            :to="`/admin/jobs/${job.id}`"
            class="rounded-control hover:text-accent hover:underline"
          >
            {{ job.title }}
          </RouterLink>
        </h3>

        <dl class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-meta text-text-muted">
          <div class="flex items-center gap-1.5">
            <Building2 class="size-3.5" aria-hidden="true" />
            <dt class="sr-only">Employer</dt>
            <dd>{{ job.employer?.company_name || job.employer?.name || 'Unknown employer' }}</dd>
          </div>

          <div v-if="job.category" class="flex items-center gap-1.5">
            <Tag class="size-3.5" aria-hidden="true" />
            <dt class="sr-only">Category</dt>
            <dd>{{ job.category }}</dd>
          </div>

          <div v-if="job.location" class="flex items-center gap-1.5">
            <MapPin class="size-3.5" aria-hidden="true" />
            <dt class="sr-only">Location</dt>
            <dd>{{ job.location }}</dd>
          </div>

          <div v-if="waitingSince" class="flex items-center gap-1.5">
            <Clock class="size-3.5" aria-hidden="true" />
            <dt class="sr-only">Waiting since</dt>
            <dd>Submitted {{ formatRelative(waitingSince) }}</dd>
          </div>
        </dl>
      </div>

      <JobStatusBadge :approval-status="job.approval_status" />
    </div>

    <p
      v-if="job.approval_status === 'rejected' && job.rejected_reason"
      class="mt-3 rounded-control border border-danger-border bg-danger-bg px-3 py-2 text-support text-danger-fg"
    >
      <span class="font-semibold">Rejection reason:</span> {{ job.rejected_reason }}
    </p>

    <div class="mt-5 flex flex-wrap gap-2">
      <UiButton size="sm" variant="secondary" :to="`/admin/jobs/${job.id}`">
        Review listing
      </UiButton>
      <slot name="actions" />
    </div>
  </article>
</template>
