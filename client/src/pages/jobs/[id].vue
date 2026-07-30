<script setup lang="ts">
/**
 * Public job detail page.
 *
 * The apply panel is role-aware: guests are sent to sign in with a redirect
 * back here, candidates get the apply dialog, and employers/admins see a
 * neutral note rather than a control that would fail on submit.
 */
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Check, LogIn } from 'lucide-vue-next'
import {
  UiAlert,
  UiBreadcrumbs,
  UiButton,
  UiCard,
  UiErrorState,
  UiSkeleton,
} from '@/components/ui'
import { usePublicJobs } from '@/composables/usePublicJobs'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useCandidateApplicationsStore } from '@/features/candidate/stores/useCandidateApplicationsStore'
import { useJobApplication } from '@/features/applications/composables/useJobApplication'
import ApplyDialog from '@/features/applications/components/ApplyDialog.vue'
import JobDetail from '@/features/jobs/components/JobDetail.vue'
import { formatDeadline } from '@/features/jobs/utils/formatters'

const route = useRoute()
const authStore = useAuthStore()
const applicationsStore = useCandidateApplicationsStore()
const { formError, isDetailLoading, loadJob, selectedJob } = usePublicJobs()

// Destructured so each ref is a top-level binding and unwraps in the template;
// nested refs on a plain object would need `.value` everywhere.
const {
  activeJob,
  dialogOpen,
  loadingContext,
  openFor,
  profile: profileStore,
  resumes,
  submit: submitApplication,
  submitError,
  submitting,
} = useJobApplication()

const jobId = computed(() => String(route.params.id))
const isCandidate = computed(() => authStore.role === 'candidate')
const hasApplied = computed(() => applicationsStore.isJobApplied(selectedJob.value?.id))
const isClosed = computed(() => formatDeadline(selectedJob.value?.expires_at).passed)

const crumbs = computed(() => [
  { label: 'Jobs', to: '/jobs' },
  { label: selectedJob.value?.title ?? 'Job listing' },
])

async function load() {
  await loadJob(jobId.value)

  // Needed to show "Applied" instead of an apply button on a job the candidate
  // has already applied to.
  if (isCandidate.value && applicationsStore.appliedJobIds.size === 0) {
    await applicationsStore.fetchAppliedJobIds().catch(() => undefined)
  }
}

onMounted(load)
watch(jobId, load)
</script>

<template>
  <div class="mx-auto grid max-w-[var(--size-content-max)] gap-6 px-4 py-8 sm:px-6">
    <UiBreadcrumbs :items="crumbs" />

    <!-- Loading -->
    <div v-if="isDetailLoading" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" role="status" aria-busy="true">
      <span class="sr-only">Loading job listing</span>
      <div class="grid gap-6">
        <UiSkeleton class="h-56" rounded="card" />
        <UiSkeleton class="h-72" rounded="card" />
      </div>
      <UiSkeleton class="h-64" rounded="card" />
    </div>

    <!-- Failed or not publicly visible -->
    <UiErrorState
      v-else-if="formError || !selectedJob"
      title="This listing is not available"
      description="It may have been removed, or it may no longer be approved for public viewing."
      @retry="load"
    >
      <UiButton to="/jobs" variant="secondary">Back to all jobs</UiButton>
    </UiErrorState>

    <JobDetail v-else :job="selectedJob">
      <template #apply>
        <UiCard>
          <!-- Candidate -->
          <template v-if="isCandidate">
            <UiAlert v-if="hasApplied" tone="success" title="Application submitted">
              You have already applied to this role.
              <template #actions>
                <UiButton size="sm" variant="secondary" to="/candidate/applications">
                  Track your applications
                </UiButton>
              </template>
            </UiAlert>

            <template v-else-if="isClosed">
              <h2 class="text-card-title text-text-primary">Applications closed</h2>
              <p class="mt-2 text-support text-text-muted">
                The deadline for this role has passed.
              </p>
            </template>

            <template v-else>
              <h2 class="text-card-title text-text-primary">Interested in this role?</h2>
              <p class="mt-2 text-support text-text-muted">
                Apply with a resume you have already uploaded.
              </p>
              <UiButton
                block
                size="lg"
                class="mt-4"
                @click="openFor(selectedJob)"
              >
                <template #icon><Check class="size-4" aria-hidden="true" /></template>
                Apply now
              </UiButton>
            </template>
          </template>

          <!-- Guest -->
          <template v-else-if="!authStore.isAuthenticated && !authStore.isSessionLoading">
            <h2 class="text-card-title text-text-primary">Sign in to apply</h2>
            <p class="mt-2 text-support text-text-muted">
              You need a candidate account to send an application.
            </p>
            <UiButton
              block
              size="lg"
              class="mt-4"
              :to="{ path: '/auth/login', query: { redirect: route.fullPath } }"
            >
              <template #icon><LogIn class="size-4" aria-hidden="true" /></template>
              Sign in
            </UiButton>
            <UiButton block variant="secondary" class="mt-2" to="/auth/register/candidate">
              Create a candidate account
            </UiButton>
          </template>

          <!-- Employer or admin: applying is not their action to take. -->
          <template v-else-if="authStore.isAuthenticated">
            <h2 class="text-card-title text-text-primary">Viewing as {{ authStore.role }}</h2>
            <p class="mt-2 text-support text-text-muted">
              Only candidate accounts can apply to listings.
            </p>
          </template>
        </UiCard>
      </template>
    </JobDetail>

    <ApplyDialog
      v-if="activeJob"
      v-model:open="dialogOpen"
      :job-title="activeJob.title"
      :resumes="resumes"
      :profile="profileStore.profile"
      :loading-resumes="loadingContext"
      :submitting="submitting"
      :error="submitError"
      @submit="submitApplication"
    />
  </div>
</template>
