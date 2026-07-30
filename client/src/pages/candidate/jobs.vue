<script setup lang="ts">
/**
 * Candidate job search.
 *
 * The same discovery surface as the public `/jobs`, plus the inline apply
 * control and the applied-set lookup that turns already-applied cards into a
 * disabled "Applied" state.
 */
import { onMounted } from 'vue'
import { UiPageHeader } from '@/components/ui'
import ApplyDialog from '@/features/applications/components/ApplyDialog.vue'
import { useJobApplication } from '@/features/applications/composables/useJobApplication'
import JobDiscovery from '@/features/jobs/components/JobDiscovery.vue'
import { useCandidateApplicationsStore } from '@/features/candidate/stores/useCandidateApplicationsStore'

const applicationsStore = useCandidateApplicationsStore()

const {
  activeJob,
  dialogOpen,
  loadingContext,
  openFor,
  profile: profileStore,
  resumes,
  submit,
  submitError,
  submitting,
} = useJobApplication()

onMounted(() => {
  void applicationsStore.fetchAppliedJobIds().catch(() => undefined)
})
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Find jobs"
      description="Search approved openings and apply without leaving this page."
    />

    <JobDiscovery
      show-apply
      :applied-job-ids="applicationsStore.appliedJobIds"
      @apply="openFor"
    />

    <ApplyDialog
      v-if="activeJob"
      v-model:open="dialogOpen"
      :job-title="activeJob.title"
      :resumes="resumes"
      :profile="profileStore.profile"
      :loading-resumes="loadingContext"
      :submitting="submitting"
      :error="submitError"
      @submit="submit"
    />
  </div>
</template>
