<script setup lang="ts">
/**
 * Candidate application history.
 *
 * Status filtering goes through the API (`?status=`) rather than filtering the
 * loaded page in memory, so the counts and pagination stay truthful.
 *
 * Withdrawal is a confirmed, irreversible action: the dialog names the job and
 * states that it cannot be undone, and stays open with the error if it fails.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ClipboardList, Search } from 'lucide-vue-next'
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
import RealtimeStatusIndicator from '@/components/RealtimeStatusIndicator.vue'
import ApplicationCard from '@/features/applications/components/ApplicationCard.vue'
import { useApplicationStatusStream } from '@/features/applications/composables/useApplicationStatusStream'
import { useCandidateApplicationsStore } from '@/features/candidate/stores/useCandidateApplicationsStore'
import { APPLICATION_STATUS_FILTERS } from '@/lib/status'
import { fadeRise, useStaggeredPreset } from '@/design/motion'
import { useToast } from '@/composables/useToast'
import type { CandidateApplication } from '@/features/candidate/types'

const route = useRoute()
const toast = useToast()
const store = useCandidateApplicationsStore()
const itemMotion = useStaggeredPreset(fadeRise)

const activeTab = ref('all')
const cancelTarget = ref<CandidateApplication | null>(null)
const cancelError = ref('')
const listError = ref('')

const tabs = computed(() => [
  { value: 'all', label: 'All' },
  ...APPLICATION_STATUS_FILTERS.map((filter) => ({ value: filter.value, label: filter.label })),
])

/** Set when arriving straight from a successful submission. */
const justAppliedId = computed(() =>
  typeof route.query.applied === 'string' ? Number(route.query.applied) : null,
)

const { reconnect, state: realtimeState } = useApplicationStatusStream(() => {
  void load(store.currentPage)
})

async function load(page = 1) {
  listError.value = ''

  try {
    await store.loadPage(page)
  } catch {
    listError.value = 'Your applications could not be loaded.'
  }
}

async function changeTab(value: string) {
  activeTab.value = value
  listError.value = ''

  try {
    await store.setFilterAndLoad(value === 'all' ? '' : value)
  } catch {
    listError.value = 'That filter could not be applied.'
  }
}

async function confirmCancel() {
  const target = cancelTarget.value

  if (!target) {
    return
  }

  cancelError.value = ''

  try {
    await store.cancelApplication(target.id)
    cancelTarget.value = null
    toast.success(`Your application for ${target.job_listing?.title ?? 'this role'} was withdrawn.`, {
      title: 'Application withdrawn',
    })
  } catch {
    cancelError.value =
      'The application could not be withdrawn. It may already have been decided.'
  }
}

async function refresh() {
  await Promise.allSettled([load(store.currentPage), reconnect()])
}

onMounted(() => load(1))
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="My applications"
      description="Every role you have applied to, with its current status."
    >
      <template #actions>
        <RealtimeStatusIndicator :state="realtimeState" @refresh="refresh" />
        <UiButton to="/candidate/jobs" variant="secondary">
          <template #icon><Search class="size-4" aria-hidden="true" /></template>
          Find more jobs
        </UiButton>
      </template>
    </UiPageHeader>

    <UiAlert v-if="justAppliedId" tone="success" title="Application submitted">
      Your application is on its way. You will see the employer's decision here.
    </UiAlert>

    <UiTabs
      v-model="activeTab"
      :items="tabs"
      aria-label="Filter applications by status"
      @update:model-value="changeTab"
    />

    <UiAlert v-if="listError" tone="danger" title="Could not load applications">
      {{ listError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="load(1)">Try again</UiButton>
      </template>
    </UiAlert>

    <div v-if="store.isFetching" class="grid gap-3" role="status" aria-busy="true">
      <span class="sr-only">Loading your applications</span>
      <UiSkeleton v-for="index in 4" :key="index" class="h-44" rounded="card" />
    </div>

    <UiEmptyState
      v-else-if="store.applications.length === 0"
      :icon="ClipboardList"
      :title="activeTab === 'all' ? 'No applications yet' : 'Nothing with this status'"
      :description="
        activeTab === 'all'
          ? 'Apply to a role and it will appear here with its current status.'
          : 'Try a different status filter to see your other applications.'
      "
    >
      <UiButton v-if="activeTab === 'all'" to="/candidate/jobs">Browse open roles</UiButton>
      <UiButton v-else variant="secondary" @click="changeTab('all')">Show all applications</UiButton>
    </UiEmptyState>

    <template v-else>
      <ul class="grid gap-3">
        <motion.li
          v-for="(application, index) in store.applications"
          :key="application.id"
          v-bind="itemMotion(index)"
        >
          <ApplicationCard
            :application="application"
            :cancelling="store.isCancelling && cancelTarget?.id === application.id"
            @cancel="cancelTarget = $event"
          />
        </motion.li>
      </ul>

      <UiPagination
        :links="store.links"
        :meta="store.meta"
        :disabled="store.isFetching"
        @page-change="load"
      />
    </template>

    <UiConfirmationDialog
      :open="cancelTarget !== null"
      title="Withdraw this application?"
      :consequence="
        cancelTarget
          ? `Your application for “${cancelTarget.job_listing?.title ?? 'this role'}” will be withdrawn. You cannot undo this, though you can apply again while the listing is open.`
          : undefined
      "
      confirm-label="Withdraw application"
      :loading="store.isCancelling"
      :error="cancelError"
      @confirm="confirmCancel"
      @cancel="cancelTarget = null"
      @update:open="(value) => { if (!value) cancelTarget = null }"
    />
  </div>
</template>
