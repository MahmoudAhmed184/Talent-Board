<script setup lang="ts">
/**
 * Create a job listing.
 *
 * On success the employer lands on the new listing's own page, where the
 * pending-moderation state is explained — rather than back on a list where a
 * newly created listing would look like it silently failed to publish.
 */
import { UiAlert, UiBreadcrumbs, UiPageHeader } from '@/components/ui'
import { useRouter } from 'vue-router'
import JobForm from '@/features/employer/components/JobForm.vue'
import type { EmployerJobPayload } from '@/composables/useEmployerJobForm'
import { useEmployerJobsStore } from '@/stores/useEmployerJobsStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const jobsStore = useEmployerJobsStore()
const toast = useToast()

async function submitJob(payload: EmployerJobPayload): Promise<void> {
  // Errors propagate to JobForm, which maps 422s onto fields and shows
  // anything else at form level. Nothing is swallowed here.
  const created = await jobsStore.createJob(payload)

  toast.success('Your listing has been sent for review.', { title: 'Listing submitted' })
  await router.push(`/employer/jobs/${created.id}`)
}
</script>

<template>
  <div class="grid gap-6">
    <UiBreadcrumbs
      :items="[{ label: 'Job listings', to: '/employer/jobs' }, { label: 'Post a job' }]"
    />

    <UiPageHeader
      title="Post a job"
      description="Describe the role. An administrator reviews it before candidates can see it."
    />

    <UiAlert tone="info" title="Listings are reviewed before publication">
      Your listing will show as “Pending review” until an administrator approves
      it. You can keep editing it in the meantime.
    </UiAlert>

    <JobForm mode="create" :submit-handler="submitJob" />
  </div>
</template>
