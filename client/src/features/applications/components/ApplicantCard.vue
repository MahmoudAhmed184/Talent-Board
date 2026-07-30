<script setup lang="ts">
/**
 * An application as the employer sees it: who applied, to what, and what is
 * still to decide.
 *
 * The accept/reject controls are only rendered while the application is
 * actually decidable, so a resolved application cannot be re-decided from a
 * stale list.
 */
import { computed } from 'vue'
import { CalendarDays, Mail, Paperclip, Phone } from 'lucide-vue-next'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge.vue'
import { UiAvatar, UiButton } from '@/components/ui'
import { isDecidable } from '@/lib/status'
import { formatRelative } from '@/features/jobs/utils/formatters'
import type { EmployerApplicationItem } from '@/composables/useEmployerApplications'

const { application, showJob = true } = defineProps<{
  application: EmployerApplicationItem
  /** Hidden when the list is already scoped to one job. */
  showJob?: boolean
}>()

const emit = defineEmits<{
  accept: [application: EmployerApplicationItem]
  reject: [application: EmployerApplicationItem]
}>()

const canDecide = computed(() => isDecidable(application.status))
</script>

<template>
  <article class="rounded-card border border-border bg-surface p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <UiAvatar :name="application.candidate.name" />

        <div class="min-w-0">
          <h3 class="text-card-title text-text-primary">
            {{ application.candidate.name || 'Candidate' }}
          </h3>
          <p v-if="showJob && application.job_listing?.title" class="mt-0.5 text-support text-text-muted">
            Applied for {{ application.job_listing.title }}
          </p>
        </div>
      </div>

      <ApplicationStatusBadge :status="application.status" />
    </div>

    <dl class="mt-4 grid gap-2 text-support text-text-secondary sm:grid-cols-2">
      <div v-if="application.contact_email" class="flex items-center gap-2">
        <Mail class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
        <dt class="sr-only">Email</dt>
        <dd class="min-w-0 truncate">
          <a :href="`mailto:${application.contact_email}`" class="rounded-control hover:text-accent hover:underline">
            {{ application.contact_email }}
          </a>
        </dd>
      </div>

      <div v-if="application.contact_phone" class="flex items-center gap-2">
        <Phone class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
        <dt class="sr-only">Phone</dt>
        <dd class="min-w-0 truncate">{{ application.contact_phone }}</dd>
      </div>

      <div v-if="application.resume?.original_name" class="flex items-center gap-2">
        <Paperclip class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
        <dt class="sr-only">Resume</dt>
        <dd class="min-w-0 truncate">{{ application.resume.original_name }}</dd>
      </div>

      <div class="flex items-center gap-2">
        <CalendarDays class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
        <dt class="sr-only">Submitted</dt>
        <dd>Applied {{ formatRelative(application.submitted_at) }}</dd>
      </div>
    </dl>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <UiButton size="sm" variant="secondary" :to="`/employer/applications/${application.id}`">
        Review application
      </UiButton>

      <template v-if="canDecide">
        <UiButton size="sm" @click="emit('accept', application)">Accept</UiButton>
        <UiButton size="sm" variant="danger-ghost" @click="emit('reject', application)">
          Reject
        </UiButton>
      </template>
    </div>
  </article>
</template>
