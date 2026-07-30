<script setup lang="ts">
/**
 * Edit an owned job listing.
 *
 * The form is only rendered once the listing has loaded, so `initialValues`
 * are never applied to an already-dirty form.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  UiAlert,
  UiBreadcrumbs,
  UiButton,
  UiErrorState,
  UiPageHeader,
  UiSkeleton,
} from '@/components/ui'
import JobForm from '@/features/employer/components/JobForm.vue'
import {
  toEmployerJobFormData,
  useEmployerJobsStore,
} from '@/stores/useEmployerJobsStore'
import type { EmployerJobPayload } from '@/composables/useEmployerJobForm'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const jobsStore = useEmployerJobsStore()
const toast = useToast()

const loading = ref(true)
const jobId = computed(() => String(route.params.id))
const job = computed(() => jobsStore.currentJob)
const initialValues = computed(() => (job.value ? toEmployerJobFormData(job.value) : {}))

async function load() {
  loading.value = true

  try {
    await jobsStore.fetchJob(jobId.value)
  } finally {
    loading.value = false
  }
}

async function submitJob(payload: EmployerJobPayload): Promise<void> {
  await jobsStore.updateJob(jobId.value, payload)

  toast.success('Your changes have been saved.', { title: 'Listing updated' })
  await router.push(`/employer/jobs/${jobId.value}`)
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6">
    <UiBreadcrumbs
      :items="[
        { label: 'Job listings', to: '/employer/jobs' },
        { label: job?.title ?? 'Listing', to: `/employer/jobs/${jobId}` },
        { label: 'Edit' },
      ]"
    />

    <div v-if="loading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading listing</span>
      <UiSkeleton class="h-24" rounded="card" />
      <UiSkeleton class="h-96" rounded="card" />
    </div>

    <UiErrorState
      v-else-if="!job"
      title="This listing could not be loaded"
      description="It may have been deleted, or it may not belong to your account."
      @retry="load"
    >
      <UiButton to="/employer/jobs" variant="secondary">Back to listings</UiButton>
    </UiErrorState>

    <template v-else>
      <UiPageHeader eyebrow="Edit listing" :title="job.title" />

      <UiAlert v-if="jobsStore.formError" tone="danger" title="Your changes were not saved">
        {{ jobsStore.formError }}
      </UiAlert>

      <JobForm
        mode="edit"
        :initial-values="initialValues"
        :was-approved="job.approval_status === 'approved'"
        :cancel-to="`/employer/jobs/${jobId}`"
        :submit-handler="submitJob"
      />
    </template>
  </div>
</template>
