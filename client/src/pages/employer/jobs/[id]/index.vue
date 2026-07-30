<script setup lang="ts">
/**
 * Employer view of one of their own listings.
 *
 * Leads with moderation status and what it means, because that is the question
 * an employer opens this page to answer. A rejected listing shows the admin's
 * reason prominently — it is the only route by which that feedback reaches them.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Pencil, Users } from 'lucide-vue-next'
import {
  UiAlert,
  UiBreadcrumbs,
  UiButton,
  UiCard,
  UiDescriptionList,
  UiErrorState,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
} from '@/components/ui'
import JobStatusBadge from '@/features/jobs/components/JobStatusBadge.vue'
import JobMetadata from '@/features/jobs/components/JobMetadata.vue'
import { useEmployerJobsStore } from '@/stores/useEmployerJobsStore'
import { jobDisplayStatus } from '@/lib/status'
import { formatDate } from '@/features/jobs/utils/formatters'

const route = useRoute()
const jobsStore = useEmployerJobsStore()

const loading = ref(true)
const jobId = computed(() => String(route.params.id))
const job = computed(() => jobsStore.currentJob)

const status = computed(() =>
  job.value ? jobDisplayStatus(job.value.approval_status, job.value.expires_at) : null,
)

const details = computed(() => {
  const item = job.value

  if (!item) {
    return []
  }

  return [
    { term: 'Category', value: item.category || 'Not set' },
    { term: 'Location', value: item.location || 'Not set' },
    { term: 'Created', value: formatDate(item.created_at) },
    { term: 'Last updated', value: formatDate(item.updated_at) },
    { term: 'Published', value: item.published_at ? formatDate(item.published_at) : 'Not published' },
    { term: 'Deadline', value: item.expires_at ? formatDate(item.expires_at) : 'No deadline' },
  ]
})

const sections = computed(() =>
  [
    { key: 'description', title: 'Description', body: job.value?.description },
    { key: 'responsibilities', title: 'Responsibilities', body: job.value?.responsibilities },
    { key: 'qualifications', title: 'Requirements', body: job.value?.qualifications },
  ].filter((section) => Boolean(section.body?.trim())),
)

async function load() {
  loading.value = true

  try {
    await jobsStore.fetchJob(jobId.value)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6">
    <UiBreadcrumbs
      :items="[{ label: 'Job listings', to: '/employer/jobs' }, { label: job?.title ?? 'Listing' }]"
    />

    <div v-if="loading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading listing</span>
      <UiSkeleton class="h-32" rounded="card" />
      <UiSkeleton class="h-64" rounded="card" />
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
      <UiPageHeader :title="job.title">
        <template #meta>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <JobStatusBadge
              :approval-status="job.approval_status"
              :expires-at="job.expires_at"
            />
          </div>
        </template>

        <template #actions>
          <UiButton variant="secondary" to="/employer/applications">
            <template #icon><Users class="size-4" aria-hidden="true" /></template>
            View applicants
          </UiButton>
          <UiButton :to="`/employer/jobs/${jobId}/edit`">
            <template #icon><Pencil class="size-4" aria-hidden="true" /></template>
            Edit listing
          </UiButton>
        </template>
      </UiPageHeader>

      <UiAlert
        v-if="status"
        :tone="
          status.tone === 'success' ? 'success' : status.tone === 'danger' ? 'danger' : 'warning'
        "
        :title="status.label"
      >
        {{ status.description }}
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div class="grid min-w-0 gap-6">
          <UiCard as="section">
            <UiSectionHeader title="At a glance" />
            <div class="mt-4">
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
          </UiCard>

          <UiCard v-for="section in sections" :key="section.key" as="section">
            <UiSectionHeader as="h3" :title="section.title" />
            <p class="mt-3 whitespace-pre-line text-support leading-6 text-text-secondary">
              {{ section.body }}
            </p>
          </UiCard>
        </div>

        <UiCard as="section">
          <UiSectionHeader as="h3" title="Listing details" />
          <div class="mt-4">
            <UiDescriptionList :items="details" :columns="1" />
          </div>
        </UiCard>
      </div>
    </template>
  </div>
</template>
