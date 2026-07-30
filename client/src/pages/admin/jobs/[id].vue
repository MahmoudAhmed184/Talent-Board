<script setup lang="ts">
/**
 * Moderation detail for a single listing.
 *
 * There is no `GET /admin/jobs/{id}`, so the record comes from the moderation
 * collections, which are fetched on a cold load. The full listing body is read
 * from the public endpoint when the listing is already approved; a pending
 * listing is not publicly visible, so only the moderation fields are shown and
 * the page says so rather than rendering blank sections.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Building2, Tag } from 'lucide-vue-next'
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
import ModerationDecisionPanel from '@/features/admin/components/ModerationDecisionPanel.vue'
import JobStatusBadge from '@/features/jobs/components/JobStatusBadge.vue'
import { useAdminJobModeration } from '@/composables/useAdminJobModeration'
import { usePublicJobs } from '@/composables/usePublicJobs'
import { formatDate } from '@/features/jobs/utils/formatters'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const {
  allJobs,
  approveJob,
  formError,
  isUpdating,
  loadAllJobs,
  loadPendingJobs,
  pendingJobs,
  rejectJob,
} = useAdminJobModeration()
const { loadJob, selectedJob } = usePublicJobs()

const loading = ref(true)
const decisionError = ref('')

const jobId = computed(() => Number(route.params.id))
const job = computed(
  () =>
    pendingJobs.value.find((item) => item.id === jobId.value) ??
    allJobs.value.find((item) => item.id === jobId.value) ??
    null,
)

/** Only approved listings are readable through the public endpoint. */
const publicBody = computed(() =>
  selectedJob.value && selectedJob.value.id === jobId.value ? selectedJob.value : null,
)

const details = computed(() => {
  const item = job.value

  if (!item) {
    return []
  }

  return [
    { term: 'Employer', value: item.employer?.company_name || item.employer?.name || 'Unknown' },
    { term: 'Category', value: item.category || 'Not set' },
    { term: 'Location', value: item.location || 'Not set' },
    { term: 'Published', value: item.published_at ? formatDate(item.published_at) : 'Not published' },
    { term: 'Last updated', value: item.updated_at ? formatDate(item.updated_at) : 'Unknown' },
  ]
})

async function load() {
  loading.value = true

  try {
    if (pendingJobs.value.length === 0 && allJobs.value.length === 0) {
      await Promise.allSettled([loadPendingJobs(1), loadAllJobs(1)])
    }

    if (job.value?.approval_status === 'approved') {
      await loadJob(jobId.value)
    }
  } finally {
    loading.value = false
  }
}

async function handleApprove() {
  decisionError.value = ''

  if (await approveJob(jobId.value)) {
    toast.success('The listing is now published.', { title: 'Listing approved' })
    await router.push('/admin/jobs')
    return
  }

  decisionError.value = formError.value ?? 'The listing could not be approved.'
}

async function handleReject(reason: string) {
  decisionError.value = ''

  if (await rejectJob(jobId.value, reason)) {
    toast.success('The employer will see your reason.', { title: 'Listing rejected' })
    await router.push('/admin/jobs')
    return
  }

  decisionError.value = formError.value ?? 'The listing could not be rejected.'
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6">
    <UiBreadcrumbs
      :items="[
        { label: 'Moderation queue', to: '/admin/jobs' },
        { label: job?.title ?? 'Listing' },
      ]"
    />

    <div v-if="loading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading listing</span>
      <UiSkeleton class="h-32" rounded="card" />
      <UiSkeleton class="h-64" rounded="card" />
    </div>

    <UiErrorState
      v-else-if="!job"
      title="This listing could not be found"
      description="It may already have been moderated, or the link may be out of date."
      @retry="load"
    >
      <UiButton to="/admin/jobs" variant="secondary">Back to the queue</UiButton>
    </UiErrorState>

    <template v-else>
      <UiPageHeader eyebrow="Moderation" :title="job.title">
        <template #meta>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <JobStatusBadge :approval-status="job.approval_status" />
            <span class="flex items-center gap-1.5 text-support text-text-muted">
              <Building2 class="size-4" aria-hidden="true" />
              {{ job.employer?.company_name || job.employer?.name || 'Unknown employer' }}
            </span>
            <span v-if="job.category" class="flex items-center gap-1.5 text-support text-text-muted">
              <Tag class="size-4" aria-hidden="true" />
              {{ job.category }}
            </span>
          </div>
        </template>
      </UiPageHeader>

      <UiAlert
        v-if="job.approval_status === 'rejected' && job.rejected_reason"
        tone="danger"
        title="Previously rejected"
      >
        {{ job.rejected_reason }}
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div class="grid min-w-0 gap-6">
          <UiCard v-if="publicBody" as="section">
            <UiSectionHeader title="Listing content" />
            <div class="mt-4 grid gap-5">
              <div v-if="publicBody.description">
                <h3 class="text-support font-semibold text-text-primary">Description</h3>
                <p class="mt-2 whitespace-pre-line text-support leading-6 text-text-secondary">
                  {{ publicBody.description }}
                </p>
              </div>
              <div v-if="publicBody.responsibilities">
                <h3 class="text-support font-semibold text-text-primary">Responsibilities</h3>
                <p class="mt-2 whitespace-pre-line text-support leading-6 text-text-secondary">
                  {{ publicBody.responsibilities }}
                </p>
              </div>
              <div v-if="publicBody.qualifications">
                <h3 class="text-support font-semibold text-text-primary">Requirements</h3>
                <p class="mt-2 whitespace-pre-line text-support leading-6 text-text-secondary">
                  {{ publicBody.qualifications }}
                </p>
              </div>
            </div>
          </UiCard>

          <UiAlert v-else tone="info" title="Full listing text is not available here">
            The public listing endpoint only serves approved listings, so the
            description cannot be loaded for one that is still pending. Moderate
            using the details below, or ask the employer to revise and resubmit.
          </UiAlert>

          <UiCard as="section">
            <UiSectionHeader title="Listing details" />
            <div class="mt-4">
              <UiDescriptionList :items="details" />
            </div>
          </UiCard>
        </div>

        <UiCard as="section">
          <UiSectionHeader as="h3" title="Decision" />
          <div class="mt-4">
            <ModerationDecisionPanel
              :job-title="job.title"
              :busy="isUpdating"
              :error="decisionError"
              @approve="handleApprove"
              @reject="handleReject"
            />
          </div>
        </UiCard>
      </div>
    </template>
  </div>
</template>
