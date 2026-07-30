<script setup lang="ts">
/**
 * Moderation queue.
 *
 * Two tabs backed by two different endpoints: "Pending" uses
 * `GET /admin/jobs/pending`, "All listings" uses `GET /admin/jobs`. They are
 * separate requests with separate pagination, so each keeps its own state
 * rather than sharing one list that would page inconsistently.
 */
import { computed, onMounted, ref } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'
import { motion } from 'motion-v'
import {
  UiAlert,
  UiButton,
  UiEmptyState,
  UiPageHeader,
  UiPagination,
  UiSkeleton,
  UiTabs,
} from '@/components/ui'
import ModerationQueueItem from '@/features/admin/components/ModerationQueueItem.vue'
import { useAdminJobModeration } from '@/composables/useAdminJobModeration'
import { fadeRise, useStaggeredPreset } from '@/design/motion'

const {
  allJobs,
  allPaginationLinks,
  allPaginationMeta,
  formError,
  isLoading,
  loadAllJobs,
  loadPendingJobs,
  pendingJobs,
  pendingPaginationLinks,
  pendingPaginationMeta,
} = useAdminJobModeration()

const itemMotion = useStaggeredPreset(fadeRise)
const activeTab = ref<'pending' | 'all'>('pending')

const tabs = computed(() => [
  { value: 'pending', label: 'Pending review', count: pendingPaginationMeta.value.total },
  { value: 'all', label: 'All listings', count: allPaginationMeta.value.total },
])

const jobs = computed(() => (activeTab.value === 'pending' ? pendingJobs.value : allJobs.value))
const links = computed(() =>
  activeTab.value === 'pending' ? pendingPaginationLinks.value : allPaginationLinks.value,
)
const meta = computed(() =>
  activeTab.value === 'pending' ? pendingPaginationMeta.value : allPaginationMeta.value,
)

function changePage(page: number) {
  void (activeTab.value === 'pending' ? loadPendingJobs(page) : loadAllJobs(page))
}

async function refresh() {
  await Promise.allSettled([loadPendingJobs(1), loadAllJobs(1)])
}

onMounted(refresh)
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Moderation queue"
      description="Approve or reject listings before candidates can see them."
    />

    <UiTabs v-model="activeTab" :items="tabs" aria-label="Filter listings" />

    <UiAlert v-if="formError" tone="danger" title="Could not load listings">
      {{ formError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="refresh">Try again</UiButton>
      </template>
    </UiAlert>

    <div v-if="isLoading" class="grid gap-3" role="status" aria-busy="true">
      <span class="sr-only">Loading listings</span>
      <UiSkeleton v-for="index in 4" :key="index" class="h-40" rounded="card" />
    </div>

    <UiEmptyState
      v-else-if="jobs.length === 0"
      :icon="ShieldCheck"
      :title="activeTab === 'pending' ? 'The queue is clear' : 'No listings yet'"
      :description="
        activeTab === 'pending'
          ? 'Every submitted listing has been reviewed. New submissions appear here automatically.'
          : 'Once employers start posting, their listings will appear here.'
      "
    />

    <template v-else>
      <ul class="grid gap-3">
        <motion.li v-for="(job, index) in jobs" :key="job.id" v-bind="itemMotion(index)">
          <ModerationQueueItem :job="job" />
        </motion.li>
      </ul>

      <UiPagination :links="links" :meta="meta" :disabled="isLoading" @page-change="changePage" />
    </template>
  </div>
</template>
