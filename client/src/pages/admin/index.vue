<script setup lang="ts">
/**
 * Admin overview.
 *
 * The moderation queue is the job, so it leads. Platform totals come from
 * `GET /admin/activity` and are shown as counts only — there is no trend or
 * chart, because the endpoint returns no historical series and inventing one
 * would be fiction.
 */
import { computed, onMounted } from 'vue'
import { Briefcase, ClipboardList, ShieldCheck, Users } from 'lucide-vue-next'
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
import ModerationQueueItem from '@/features/admin/components/ModerationQueueItem.vue'
import { useAdminJobModeration } from '@/composables/useAdminJobModeration'

const {
  activity,
  formError,
  isLoading,
  isRefreshingActivity,
  loadActivity,
  loadPendingJobs,
  pendingJobs,
} = useAdminJobModeration()

const totals = computed(() => activity.value?.totals ?? null)
const nextInQueue = computed(() => pendingJobs.value.slice(0, 3))

async function refresh() {
  await Promise.allSettled([loadPendingJobs(1), loadActivity()])
}

onMounted(refresh)
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Moderation overview"
      description="Review pending listings and keep an eye on platform activity."
    >
      <template #actions>
        <UiButton to="/admin/jobs">
          <template #icon><ShieldCheck class="size-4" aria-hidden="true" /></template>
          Open moderation queue
        </UiButton>
      </template>
    </UiPageHeader>

    <UiAlert v-if="formError" tone="danger" title="Something could not be loaded">
      {{ formError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="refresh">Try again</UiButton>
      </template>
    </UiAlert>

    <section aria-labelledby="platform-totals-heading">
      <h2 id="platform-totals-heading" class="sr-only">Platform totals</h2>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UiStatCard
          label="Awaiting review"
          :value="totals?.jobs_pending ?? 0"
          :icon="ShieldCheck"
          tone="warning"
          hint="Listings needing a decision"
          :loading="isRefreshingActivity"
          to="/admin/jobs"
        />
        <UiStatCard
          label="Total listings"
          :value="totals?.jobs ?? 0"
          :icon="Briefcase"
          tone="info"
          :loading="isRefreshingActivity"
        />
        <UiStatCard
          label="Registered users"
          :value="totals?.users ?? 0"
          :icon="Users"
          tone="neutral"
          :loading="isRefreshingActivity"
        />
        <UiStatCard
          label="Applications"
          :value="totals?.applications ?? 0"
          :icon="ClipboardList"
          tone="neutral"
          :loading="isRefreshingActivity"
        />
      </div>
    </section>

    <section aria-labelledby="queue-preview-heading">
      <UiSectionHeader
        title="Next in the queue"
        description="The listings that have been waiting longest."
      >
        <template #actions>
          <UiButton to="/admin/jobs" variant="ghost" size="sm">View the full queue</UiButton>
        </template>
      </UiSectionHeader>

      <div v-if="isLoading" class="mt-4 grid gap-3" role="status" aria-busy="true">
        <span class="sr-only">Loading the moderation queue</span>
        <UiSkeleton v-for="index in 3" :key="index" class="h-40" rounded="card" />
      </div>

      <div v-else-if="nextInQueue.length === 0" class="mt-4">
        <UiEmptyState
          :icon="ShieldCheck"
          title="The queue is clear"
          description="Every submitted listing has been reviewed. New submissions will appear here."
        />
      </div>

      <ul v-else class="mt-4 grid gap-3">
        <li v-for="job in nextInQueue" :key="job.id">
          <ModerationQueueItem :job="job" />
        </li>
      </ul>
    </section>

    <UiCard as="section" tone="subtle">
      <UiSectionHeader
        as="h3"
        title="What moderation controls"
        description="Approving a listing publishes it to every candidate immediately. Rejecting keeps it private and sends your reason to the employer."
      />
    </UiCard>
  </div>
</template>
