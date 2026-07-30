<script setup lang="ts">
/**
 * Employer's own job listings, in every moderation state.
 *
 * Status is always visible — an employer's first question about a listing is
 * "is it live?", and a pending listing looking identical to a published one is
 * the fastest way to a support ticket.
 *
 * Deleting is confirmed and states that submitted applications are retained.
 */
import { computed, onMounted, ref } from 'vue'
import { ListChecks, PlusCircle } from 'lucide-vue-next'
import { motion } from 'motion-v'
import {
  UiAlert,
  UiButton,
  UiConfirmationDialog,
  UiEmptyState,
  UiPageHeader,
  UiPagination,
  UiSkeleton,
  UiTabs,
} from '@/components/ui'
import JobListItem from '@/features/jobs/components/JobListItem.vue'
import { useEmployerJobsStore, type EmployerJob } from '@/stores/useEmployerJobsStore'
import { JOB_STATUS_FILTERS } from '@/lib/status'
import { fadeRise, useStaggeredPreset } from '@/design/motion'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const store = useEmployerJobsStore()
const itemMotion = useStaggeredPreset(fadeRise)

const activeTab = ref('all')
const deleteTarget = ref<EmployerJob | null>(null)
const deleteError = ref('')

const tabs = computed(() => [
  { value: 'all', label: 'All', count: store.jobs.length },
  ...JOB_STATUS_FILTERS.map((filter) => ({
    value: filter.value,
    label: filter.label,
    count: store.jobs.filter((job) => job.approval_status === filter.value).length,
  })),
])

/**
 * Filtered in memory: `GET /employer/jobs` takes no status parameter, so the
 * tab counts and this list describe the loaded page only.
 */
const visibleJobs = computed(() =>
  activeTab.value === 'all'
    ? store.jobs
    : store.jobs.filter((job) => job.approval_status === activeTab.value),
)

async function confirmDelete() {
  const target = deleteTarget.value

  if (!target) {
    return
  }

  deleteError.value = ''

  try {
    await store.deleteJob(target.id)
    deleteTarget.value = null
    toast.success(`“${target.title}” was removed.`, { title: 'Listing deleted' })
  } catch {
    deleteError.value = 'That listing could not be deleted. Please try again.'
  }
}

onMounted(() => {
  void store.fetchJobs(1)
})
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Job listings"
      description="Every role you have posted, with its current moderation status."
    >
      <template #actions>
        <UiButton to="/employer/jobs/create">
          <template #icon><PlusCircle class="size-4" aria-hidden="true" /></template>
          Post a job
        </UiButton>
      </template>
    </UiPageHeader>

    <UiAlert v-if="store.formError" tone="danger" title="Could not load your listings">
      {{ store.formError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="store.fetchJobs(1)">Try again</UiButton>
      </template>
    </UiAlert>

    <UiTabs v-model="activeTab" :items="tabs" aria-label="Filter listings by status" />

    <div v-if="store.isLoading" class="grid gap-3" role="status" aria-busy="true">
      <span class="sr-only">Loading your listings</span>
      <UiSkeleton v-for="index in 4" :key="index" class="h-32" rounded="card" />
    </div>

    <UiEmptyState
      v-else-if="visibleJobs.length === 0"
      :icon="ListChecks"
      :title="activeTab === 'all' ? 'No listings yet' : 'Nothing with this status'"
      :description="
        activeTab === 'all'
          ? 'Post a role and an administrator will review it before candidates can see it.'
          : 'Try a different status to see your other listings.'
      "
    >
      <UiButton v-if="activeTab === 'all'" to="/employer/jobs/create">Post a job</UiButton>
      <UiButton v-else variant="secondary" @click="activeTab = 'all'">Show all listings</UiButton>
    </UiEmptyState>

    <template v-else>
      <ul class="grid gap-3">
        <motion.li v-for="(job, index) in visibleJobs" :key="job.id" v-bind="itemMotion(index)">
          <JobListItem :job="job" :to="`/employer/jobs/${job.id}`">
            <template #actions>
              <UiButton size="sm" variant="secondary" :to="`/employer/jobs/${job.id}/edit`">
                Edit
              </UiButton>
              <UiButton
                size="sm"
                variant="danger-ghost"
                :disabled="store.isDeleting"
                @click="deleteTarget = job"
              >
                Delete
              </UiButton>
            </template>
          </JobListItem>
        </motion.li>
      </ul>

      <UiPagination
        :links="store.paginationLinks"
        :meta="store.paginationMeta"
        :disabled="store.isLoading"
        @page-change="store.fetchJobs"
      />
    </template>

    <UiConfirmationDialog
      :open="deleteTarget !== null"
      title="Delete this listing?"
      :consequence="
        deleteTarget
          ? `“${deleteTarget.title}” will be removed and will no longer be visible to candidates. Applications already submitted to it are kept.`
          : undefined
      "
      confirm-label="Delete listing"
      :loading="store.isDeleting"
      :error="deleteError"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
      @update:open="(value) => { if (!value) deleteTarget = null }"
    />
  </div>
</template>
