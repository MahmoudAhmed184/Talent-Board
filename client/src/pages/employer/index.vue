<script setup lang="ts">
/**
 * Employer overview.
 *
 * Operational, not analytical: what needs a decision, what is waiting on
 * moderation, and what is live. Deliberately no charts or hiring metrics —
 * employer analytics is documented future work (FW-01).
 */
import { computed, onMounted } from 'vue'
import { CheckCircle2, Clock, ListChecks, PlusCircle, Users } from 'lucide-vue-next'
import {
  UiAlert,
  UiButton,
  UiEmptyState,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
  UiStatCard,
} from '@/components/ui'
import RealtimeStatusIndicator from '@/components/RealtimeStatusIndicator.vue'
import ApplicantCard from '@/features/applications/components/ApplicantCard.vue'
import { useApplicationStatusStream } from '@/features/applications/composables/useApplicationStatusStream'
import JobListItem from '@/features/jobs/components/JobListItem.vue'
import { useEmployerApplications } from '@/composables/useEmployerApplications'
import { useEmployerJobsStore } from '@/stores/useEmployerJobsStore'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { isDecidable } from '@/lib/status'

const authStore = useAuthStore()
const jobsStore = useEmployerJobsStore()
const {
  applyStatusUpdate,
  formError: applicationsError,
  isLoading: applicationsLoading,
  list: applications,
  loadList,
} = useEmployerApplications()

const jobs = computed(() => jobsStore.jobs)
const pendingCount = computed(() => jobs.value.filter((j) => j.approval_status === 'pending').length)
const publishedCount = computed(
  () => jobs.value.filter((j) => j.approval_status === 'approved').length,
)
const awaitingDecision = computed(() => applications.value.filter((a) => isDecidable(a.status)))
const recentJobs = computed(() => jobs.value.slice(0, 3))

const { reconnect, state: realtimeState } = useApplicationStatusStream((payload) => {
  applyStatusUpdate(payload)
})

async function refresh() {
  await Promise.allSettled([jobsStore.fetchJobs(1), loadList(1), reconnect()])
}

onMounted(async () => {
  await Promise.allSettled([jobsStore.fetchJobs(1), loadList(1)])
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      :title="`Welcome back, ${authStore.user?.name ?? 'there'}`"
      description="Everything waiting on you, in one place."
    >
      <template #actions>
        <RealtimeStatusIndicator :state="realtimeState" @refresh="refresh" />
        <UiButton to="/employer/jobs/create">
          <template #icon><PlusCircle class="size-4" aria-hidden="true" /></template>
          Post a job
        </UiButton>
      </template>
    </UiPageHeader>

    <section aria-labelledby="employer-stats-heading">
      <h2 id="employer-stats-heading" class="sr-only">Summary</h2>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UiStatCard
          label="Applications to review"
          :value="awaitingDecision.length"
          :icon="Users"
          tone="warning"
          hint="Submitted or under review"
          :loading="applicationsLoading"
          to="/employer/applications"
        />
        <UiStatCard
          label="Awaiting moderation"
          :value="pendingCount"
          :icon="Clock"
          tone="info"
          hint="Not visible to candidates yet"
          :loading="jobsStore.isLoading"
          to="/employer/jobs"
        />
        <UiStatCard
          label="Published listings"
          :value="publishedCount"
          :icon="CheckCircle2"
          tone="success"
          :loading="jobsStore.isLoading"
          to="/employer/jobs"
        />
      </div>
    </section>

    <div class="grid gap-8 xl:grid-cols-2 xl:items-start">
      <section aria-labelledby="to-review-heading" class="min-w-0">
        <UiSectionHeader
          title="Waiting on your decision"
          description="Candidates who have applied and not yet had an answer."
        >
          <template #actions>
            <UiButton to="/employer/applications" variant="ghost" size="sm">View all</UiButton>
          </template>
        </UiSectionHeader>

        <UiAlert
          v-if="applicationsError"
          tone="danger"
          class="mt-4"
          title="Could not load applications"
        >
          {{ applicationsError }}
        </UiAlert>

        <div v-else-if="applicationsLoading" class="mt-4 grid gap-3" role="status" aria-busy="true">
          <span class="sr-only">Loading applications</span>
          <UiSkeleton v-for="index in 2" :key="index" class="h-48" rounded="card" />
        </div>

        <div v-else-if="awaitingDecision.length === 0" class="mt-4">
          <UiEmptyState
            :icon="Users"
            title="Nothing waiting on you"
            description="New applications to your listings will appear here."
          />
        </div>

        <ul v-else class="mt-4 grid gap-3">
          <li v-for="application in awaitingDecision.slice(0, 3)" :key="application.id">
            <ApplicantCard :application="application" />
          </li>
        </ul>
      </section>

      <section aria-labelledby="recent-jobs-heading" class="min-w-0">
        <UiSectionHeader
          title="Your listings"
          description="Most recently updated first."
        >
          <template #actions>
            <UiButton to="/employer/jobs" variant="ghost" size="sm">View all</UiButton>
          </template>
        </UiSectionHeader>

        <div v-if="jobsStore.isLoading" class="mt-4 grid gap-3" role="status" aria-busy="true">
          <span class="sr-only">Loading your listings</span>
          <UiSkeleton v-for="index in 3" :key="index" class="h-32" rounded="card" />
        </div>

        <div v-else-if="recentJobs.length === 0" class="mt-4">
          <UiEmptyState
            :icon="ListChecks"
            title="No listings yet"
            description="Post a role and an administrator will review it before it goes live."
          >
            <UiButton to="/employer/jobs/create">Post a job</UiButton>
          </UiEmptyState>
        </div>

        <ul v-else class="mt-4 grid gap-3">
          <li v-for="job in recentJobs" :key="job.id">
            <JobListItem :job="job" :to="`/employer/jobs/${job.id}`" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
