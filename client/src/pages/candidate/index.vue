<script setup lang="ts">
/**
 * Candidate dashboard.
 *
 * Answers "what happened to my applications?" first, then "what still needs
 * doing on my profile?". The counters are derived from the loaded page of
 * applications, and the card says so — an unqualified "3 accepted" that only
 * counted the first page would be a lie.
 */
import { computed, onMounted } from 'vue'
import { CheckCircle2, ClipboardList, Clock, Search, XCircle } from 'lucide-vue-next'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiEmptyState,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
  UiStatCard,
} from '@/components/ui'
import RealtimeStatusIndicator from '@/components/RealtimeStatusIndicator.vue'
import ApplicationCard from '@/features/applications/components/ApplicationCard.vue'
import { useApplicationStatusStream } from '@/features/applications/composables/useApplicationStatusStream'
import ProfileCompletion from '@/features/candidate/components/ProfileCompletion.vue'
import { useCandidateApplicationsStore } from '@/features/candidate/stores/useCandidateApplicationsStore'
import { useCandidateProfileStore } from '@/features/candidate/stores/useCandidateProfileStore'
import { useResumes } from '@/features/candidate/composables/useResumes'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'

const authStore = useAuthStore()
const applicationsStore = useCandidateApplicationsStore()
const profileStore = useCandidateProfileStore()
const { fetchResumes, resumes } = useResumes()

const loadError = computed(() => null)

const applications = computed(() => applicationsStore.applications ?? [])
const recent = computed(() => applications.value.slice(0, 3))

/** Counts describe the loaded page only; the label below says so. */
const counts = computed(() => {
  const list = applications.value

  return {
    total: applicationsStore.meta?.total ?? list.length,
    inReview: list.filter((a) => ['submitted', 'under_review'].includes(a.status)).length,
    accepted: list.filter((a) => a.status === 'accepted').length,
    rejected: list.filter((a) => a.status === 'rejected').length,
  }
})

const { reconnect, state: realtimeState } = useApplicationStatusStream(() => {
  void applicationsStore.loadPage(applicationsStore.currentPage)
})

/**
 * Manual fallback when live updates are unavailable: retry the socket *and*
 * refetch, so the button fixes both the data and the connection.
 */
async function refresh() {
  await Promise.allSettled([applicationsStore.loadPage(1), reconnect()])
}

onMounted(async () => {
  await Promise.allSettled([
    applicationsStore.loadPage(1),
    profileStore.loadProfile(),
    fetchResumes(),
  ])
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      :title="`Welcome back, ${authStore.user?.name ?? 'there'}`"
      description="Track where every application stands and keep your profile ready to send."
    >
      <template #actions>
        <RealtimeStatusIndicator :state="realtimeState" @refresh="refresh" />
        <UiButton to="/candidate/jobs">
          <template #icon><Search class="size-4" aria-hidden="true" /></template>
          Find jobs
        </UiButton>
      </template>
    </UiPageHeader>

    <UiAlert v-if="loadError" tone="danger" title="Dashboard could not load">
      {{ loadError }}
    </UiAlert>

    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="sr-only">Application summary</h2>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UiStatCard
          label="Total applications"
          :value="counts.total"
          :icon="ClipboardList"
          tone="info"
          :loading="applicationsStore.isFetching"
          to="/candidate/applications"
        />
        <UiStatCard
          label="Awaiting a decision"
          :value="counts.inReview"
          :icon="Clock"
          tone="warning"
          hint="On this page"
          :loading="applicationsStore.isFetching"
        />
        <UiStatCard
          label="Accepted"
          :value="counts.accepted"
          :icon="CheckCircle2"
          tone="success"
          hint="On this page"
          :loading="applicationsStore.isFetching"
        />
        <UiStatCard
          label="Not selected"
          :value="counts.rejected"
          :icon="XCircle"
          tone="danger"
          hint="On this page"
          :loading="applicationsStore.isFetching"
        />
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="recent-heading" class="min-w-0">
        <UiSectionHeader
          title="Recent applications"
          description="Your three most recent submissions."
        >
          <template #actions>
            <UiButton to="/candidate/applications" variant="ghost" size="sm">View all</UiButton>
          </template>
        </UiSectionHeader>

        <div v-if="applicationsStore.isFetching" class="mt-4 grid gap-3" role="status" aria-busy="true">
          <span class="sr-only">Loading your applications</span>
          <UiSkeleton v-for="index in 3" :key="index" class="h-44" rounded="card" />
        </div>

        <div v-else-if="recent.length === 0" class="mt-4">
          <UiEmptyState
            :icon="ClipboardList"
            title="You have not applied to anything yet"
            description="When you apply to a role, it will appear here with its current status."
          >
            <UiButton to="/candidate/jobs">Browse open roles</UiButton>
          </UiEmptyState>
        </div>

        <ul v-else class="mt-4 grid gap-3">
          <li v-for="application in recent" :key="application.id">
            <ApplicationCard :application="application" />
          </li>
        </ul>
      </section>

      <aside class="grid gap-4">
        <ProfileCompletion :profile="profileStore.profile" :resume-count="resumes.length" />

        <UiCard>
          <h2 class="text-card-title text-text-primary">How decisions reach you</h2>
          <p class="mt-2 text-support leading-6 text-text-muted">
            Employers accept or reject applications from their own workspace. This
            page updates as soon as a decision is recorded — there is no email to
            wait for.
          </p>
        </UiCard>
      </aside>
    </div>
  </div>
</template>
