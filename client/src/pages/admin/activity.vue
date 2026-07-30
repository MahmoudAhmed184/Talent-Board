<script setup lang="ts">
/**
 * Platform activity summary.
 *
 * Renders exactly what `GET /admin/activity` returns: totals plus the most
 * recent users, jobs, and applications. No trends, no charts — the endpoint
 * has no time series behind it, and drawing one would be inventing data.
 */
import { computed, onMounted } from 'vue'
import { Briefcase, ClipboardList, Users } from 'lucide-vue-next'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiDataTable,
  UiEmptyState,
  UiPageHeader,
  UiSectionHeader,
  UiStatCard,
  type DataTableColumn,
} from '@/components/ui'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge.vue'
import JobStatusBadge from '@/features/jobs/components/JobStatusBadge.vue'
import { useAdminJobModeration } from '@/composables/useAdminJobModeration'
import { formatRelative } from '@/features/jobs/utils/formatters'

const { activity, formError, isRefreshingActivity, loadActivity } = useAdminJobModeration()

const totals = computed(() => activity.value?.totals ?? null)

/** The API returns these without ids, so an index-based key is synthesised. */
const recentUsers = computed(() =>
  (activity.value?.recent_users ?? []).map((user) => ({ ...user, id: user.id })),
)
const recentJobs = computed(() => activity.value?.recent_jobs ?? [])
const recentApplications = computed(() => activity.value?.recent_applications ?? [])

const userColumns: DataTableColumn<(typeof recentUsers.value)[number]>[] = [
  { key: 'name', header: 'Name', value: (row) => row.name },
  { key: 'email', header: 'Email', value: (row) => row.email },
  { key: 'role', header: 'Role', value: (row) => row.role },
  { key: 'created_at', header: 'Registered', value: (row) => formatRelative(row.created_at) },
]

const jobColumns: DataTableColumn<(typeof recentJobs.value)[number]>[] = [
  { key: 'title', header: 'Listing', value: (row) => row.title },
  { key: 'employer', header: 'Employer', value: (row) => row.employer?.name ?? 'Unknown' },
  { key: 'approval_status', header: 'Status' },
  { key: 'created_at', header: 'Created', value: (row) => formatRelative(row.created_at) },
]

const applicationColumns: DataTableColumn<(typeof recentApplications.value)[number]>[] = [
  { key: 'candidate', header: 'Candidate', value: (row) => row.candidate?.name ?? 'Unknown' },
  { key: 'job', header: 'Listing', value: (row) => row.job_listing?.title ?? 'Unknown' },
  { key: 'status', header: 'Status' },
  { key: 'submitted_at', header: 'Submitted', value: (row) => formatRelative(row.submitted_at) },
]

onMounted(() => {
  void loadActivity()
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Platform activity"
      description="Totals and the most recent records across the board."
    >
      <template #actions>
        <UiButton variant="secondary" :loading="isRefreshingActivity" @click="loadActivity">
          Refresh
        </UiButton>
      </template>
    </UiPageHeader>

    <UiAlert v-if="formError" tone="danger" title="Activity could not be loaded">
      {{ formError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="loadActivity">Try again</UiButton>
      </template>
    </UiAlert>

    <section aria-labelledby="totals-heading">
      <h2 id="totals-heading" class="sr-only">Totals</h2>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UiStatCard
          label="Candidates"
          :value="totals?.candidates ?? 0"
          :icon="Users"
          :loading="isRefreshingActivity"
        />
        <UiStatCard
          label="Employers"
          :value="totals?.employers ?? 0"
          :icon="Users"
          :loading="isRefreshingActivity"
        />
        <UiStatCard
          label="Listings"
          :value="totals?.jobs ?? 0"
          :icon="Briefcase"
          hint="All moderation states"
          :loading="isRefreshingActivity"
        />
        <UiStatCard
          label="Applications"
          :value="totals?.applications ?? 0"
          :icon="ClipboardList"
          :loading="isRefreshingActivity"
        />
      </div>
    </section>

    <UiCard as="section">
      <UiSectionHeader title="Recent registrations" />
      <div class="mt-4">
        <UiEmptyState
          v-if="!isRefreshingActivity && recentUsers.length === 0"
          :icon="Users"
          title="No registrations yet"
        />
        <UiDataTable
          v-else
          caption="Most recently registered users"
          :columns="userColumns"
          :rows="recentUsers"
          :loading="isRefreshingActivity"
        />
      </div>
    </UiCard>

    <UiCard as="section">
      <UiSectionHeader title="Recent listings" />
      <div class="mt-4">
        <UiEmptyState
          v-if="!isRefreshingActivity && recentJobs.length === 0"
          :icon="Briefcase"
          title="No listings yet"
        />
        <UiDataTable
          v-else
          caption="Most recently created job listings"
          :columns="jobColumns"
          :rows="recentJobs"
          :loading="isRefreshingActivity"
        >
          <template #cell-approval_status="{ row }">
            <JobStatusBadge :approval-status="row.approval_status" size="sm" />
          </template>
        </UiDataTable>
      </div>
    </UiCard>

    <UiCard as="section">
      <UiSectionHeader title="Recent applications" />
      <div class="mt-4">
        <UiEmptyState
          v-if="!isRefreshingActivity && recentApplications.length === 0"
          :icon="ClipboardList"
          title="No applications yet"
        />
        <UiDataTable
          v-else
          caption="Most recently submitted applications"
          :columns="applicationColumns"
          :rows="recentApplications"
          :loading="isRefreshingActivity"
        >
          <template #cell-status="{ row }">
            <ApplicationStatusBadge :status="row.status" size="sm" />
          </template>
        </UiDataTable>
      </div>
    </UiCard>
  </div>
</template>
