<script setup lang="ts">
/**
 * Shows what is still missing before the candidate can apply comfortably.
 *
 * Each incomplete item is a link to the exact place that fixes it — a progress
 * bar that only scolds is not worth the space. Hidden entirely once complete,
 * rather than lingering as a permanent 100% badge.
 */
import { computed } from 'vue'
import { Check, ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { UiCard, UiProgress } from '@/components/ui'
import type { CandidateProfile } from '../types'

const { profile, resumeCount = 0 } = defineProps<{
  profile: CandidateProfile | null
  resumeCount?: number
}>()

interface CompletionItem {
  key: string
  label: string
  done: boolean
  to: string
}

const items = computed<CompletionItem[]>(() => [
  {
    key: 'summary',
    label: 'Add a short professional summary',
    done: Boolean(profile?.summary?.trim()),
    to: '/candidate/profile',
  },
  {
    key: 'contact',
    label: 'Add a contact phone number',
    done: Boolean(profile?.phone?.trim()),
    to: '/candidate/profile',
  },
  {
    key: 'location',
    label: 'Set your location',
    done: Boolean(profile?.location_text?.trim()),
    to: '/candidate/profile',
  },
  {
    key: 'skills',
    label: 'List at least three skills',
    done: (profile?.skills?.length ?? 0) >= 3,
    to: '/candidate/profile',
  },
  {
    key: 'resume',
    label: 'Upload a resume',
    done: resumeCount > 0,
    to: '/candidate/resumes',
  },
])

const completed = computed(() => items.value.filter((item) => item.done).length)
const percentage = computed(() => Math.round((completed.value / items.value.length) * 100))
const remaining = computed(() => items.value.filter((item) => !item.done))
</script>

<template>
  <UiCard v-if="remaining.length > 0">
    <h2 class="text-card-title text-text-primary">Finish setting up your profile</h2>
    <p class="mt-1 text-support text-text-muted">
      Employers see this information when you apply.
    </p>

    <div class="mt-4">
      <UiProgress
        :value="percentage"
        :label="`${completed} of ${items.length} steps complete`"
      />
    </div>

    <ul class="mt-4 grid gap-1">
      <li v-for="item in remaining" :key="item.key">
        <RouterLink
          :to="item.to"
          class="group flex items-center justify-between gap-3 rounded-control px-2 py-2 text-support text-text-secondary transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary"
        >
          <span class="flex min-w-0 items-center gap-2.5">
            <span
              class="size-4 shrink-0 rounded-full border-2 border-border-strong"
              aria-hidden="true"
            />
            <span class="truncate">{{ item.label }}</span>
          </span>
          <ChevronRight class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
        </RouterLink>
      </li>
    </ul>

    <p v-if="completed > 0" class="mt-3 flex items-center gap-1.5 text-meta text-success-fg">
      <Check class="size-3.5" aria-hidden="true" />
      {{ completed }} already done
    </p>
  </UiCard>
</template>
