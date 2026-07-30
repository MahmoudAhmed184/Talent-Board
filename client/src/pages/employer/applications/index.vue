<script setup lang="ts">
/**
 * Applications to this employer's listings.
 *
 * Status filtering is server-side (`?status=`). Grouping is by job, but only
 * within the loaded page: `GET /employer/applications` accepts no job filter,
 * so a "filter by job" control would silently lie across page boundaries. The
 * grouping headers say what they are — a view of what is on screen.
 *
 * Accept and reject are confirmed, and the decision note is optional on accept
 * and encouraged on reject.
 */
import { computed, onMounted, ref } from 'vue'
import { Users } from 'lucide-vue-next'
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
  UiTextarea,
} from '@/components/ui'
import RealtimeStatusIndicator from '@/components/RealtimeStatusIndicator.vue'
import ApplicantCard from '@/features/applications/components/ApplicantCard.vue'
import { useApplicationStatusStream } from '@/features/applications/composables/useApplicationStatusStream'
import { useEmployerApplications, type EmployerApplicationItem } from '@/composables/useEmployerApplications'
import { APPLICATION_STATUS_FILTERS } from '@/lib/status'
import { fadeRise, useStaggeredPreset } from '@/design/motion'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const itemMotion = useStaggeredPreset(fadeRise)
const {
  applyStatusUpdate,
  formError,
  isLoading,
  isUpdatingStatus,
  list,
  loadList,
  paginationLinks,
  paginationMeta,
  updateDecision,
} = useEmployerApplications()

const activeTab = ref('all')
const decision = ref<{ application: EmployerApplicationItem; type: 'accepted' | 'rejected' } | null>(null)
const decisionNote = ref('')
const decisionError = ref('')

const tabs = computed(() => [
  { value: 'all', label: 'All' },
  ...APPLICATION_STATUS_FILTERS.map((filter) => ({ value: filter.value, label: filter.label })),
])

/** Groups the loaded page by job so an employer reviewing one role reads it together. */
const grouped = computed(() => {
  const groups = new Map<string, { title: string; items: EmployerApplicationItem[] }>()

  for (const application of list.value) {
    const key = String(application.job_listing_id ?? 'unknown')
    const title = application.job_listing?.title ?? 'Unknown listing'

    if (!groups.has(key)) {
      groups.set(key, { title, items: [] })
    }

    groups.get(key)!.items.push(application)
  }

  return [...groups.entries()].map(([key, value]) => ({ key, ...value }))
})

const { reconnect, state: realtimeState } = useApplicationStatusStream((payload) => {
  applyStatusUpdate(payload)
})

async function load(page = 1) {
  await loadList(page, activeTab.value === 'all' ? undefined : activeTab.value)
}

async function changeTab(value: string) {
  activeTab.value = value
  await load(1)
}

function openDecision(application: EmployerApplicationItem, type: 'accepted' | 'rejected') {
  decision.value = { application, type }
  decisionNote.value = ''
  decisionError.value = ''
}

async function confirmDecision() {
  const current = decision.value

  if (!current) {
    return
  }

  decisionError.value = ''

  const ok = await updateDecision(current.application.id, current.type, decisionNote.value)

  if (!ok) {
    decisionError.value = formError.value ?? 'The decision could not be saved.'
    return
  }

  const name = current.application.candidate.name ?? 'The candidate'
  toast.success(
    current.type === 'accepted' ? `${name} has been accepted.` : `${name} has been rejected.`,
    { title: 'Decision recorded' },
  )
  decision.value = null
}

async function refresh() {
  await Promise.allSettled([load(paginationMeta.value.current_page), reconnect()])
}

onMounted(() => load(1))
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Applications"
      description="Everyone who has applied to your listings."
    >
      <template #actions>
        <RealtimeStatusIndicator :state="realtimeState" @refresh="refresh" />
      </template>
    </UiPageHeader>

    <UiTabs v-model="activeTab" :items="tabs" aria-label="Filter applications by status" @update:model-value="changeTab" />

    <UiAlert v-if="formError && !decision" tone="danger" title="Could not load applications">
      {{ formError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="load(1)">Try again</UiButton>
      </template>
    </UiAlert>

    <div v-if="isLoading" class="grid gap-3" role="status" aria-busy="true">
      <span class="sr-only">Loading applications</span>
      <UiSkeleton v-for="index in 3" :key="index" class="h-48" rounded="card" />
    </div>

    <UiEmptyState
      v-else-if="list.length === 0"
      :icon="Users"
      :title="activeTab === 'all' ? 'No applications yet' : 'Nothing with this status'"
      :description="
        activeTab === 'all'
          ? 'When a candidate applies to one of your published listings, they will appear here.'
          : 'Try a different status to see your other applications.'
      "
    >
      <UiButton v-if="activeTab === 'all'" to="/employer/jobs">View your listings</UiButton>
      <UiButton v-else variant="secondary" @click="changeTab('all')">Show all</UiButton>
    </UiEmptyState>

    <template v-else>
      <section v-for="group in grouped" :key="group.key" :aria-labelledby="`group-${group.key}`">
        <h2 :id="`group-${group.key}`" class="text-section-title text-text-primary">
          {{ group.title }}
          <span class="text-support font-normal text-text-muted">
            ({{ group.items.length }} on this page)
          </span>
        </h2>

        <ul class="mt-4 grid gap-3">
          <motion.li
            v-for="(application, index) in group.items"
            :key="application.id"
            v-bind="itemMotion(index)"
          >
            <ApplicantCard
              :application="application"
              :show-job="false"
              @accept="openDecision($event, 'accepted')"
              @reject="openDecision($event, 'rejected')"
            />
          </motion.li>
        </ul>
      </section>

      <UiPagination
        :links="paginationLinks"
        :meta="paginationMeta"
        :disabled="isLoading"
        @page-change="load"
      />
    </template>

    <UiConfirmationDialog
      :open="decision !== null"
      :title="decision?.type === 'accepted' ? 'Accept this candidate?' : 'Reject this candidate?'"
      :consequence="
        decision
          ? decision.type === 'accepted'
            ? `${decision.application.candidate.name ?? 'This candidate'} will see that their application was accepted.`
            : `${decision.application.candidate.name ?? 'This candidate'} will see that they were not selected. This cannot be undone.`
          : undefined
      "
      :confirm-label="decision?.type === 'accepted' ? 'Accept candidate' : 'Reject candidate'"
      :confirm-variant="decision?.type === 'accepted' ? 'primary' : 'danger'"
      :loading="isUpdatingStatus"
      :error="decisionError"
      @confirm="confirmDecision"
      @cancel="decision = null"
      @update:open="(value) => { if (!value) decision = null }"
    >
      <UiTextarea
        v-model="decisionNote"
        label="Note for your records"
        optional
        :rows="3"
        :maxlength="500"
        hint="Stored with the decision."
      />
    </UiConfirmationDialog>
  </div>
</template>
