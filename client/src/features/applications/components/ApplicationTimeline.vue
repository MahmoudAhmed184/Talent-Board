<script setup lang="ts">
/**
 * Chronological record of what has happened to an application.
 *
 * The API exposes a submission timestamp and a decision timestamp rather than
 * a full event log, so this renders the states it can actually evidence and
 * says plainly when it is waiting — it never fabricates intermediate steps.
 *
 * The current step is marked with `aria-current` and its own text, so progress
 * is not conveyed by the filled dot alone.
 */
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { applicationStatus } from '@/lib/status'
import { TONE_RAIL, TONE_TEXT } from '@/lib/tone'
import { formatRelative } from '@/features/jobs/utils/formatters'

const { decidedAt, decisionNote, status, submittedAt } = defineProps<{
  decidedAt?: string | null
  decisionNote?: string | null
  status: string
  submittedAt?: string | null
}>()

interface TimelineStep {
  key: string
  title: string
  timestamp?: string | null
  note?: string | null
  tone: ReturnType<typeof applicationStatus>['tone']
  icon: ReturnType<typeof applicationStatus>['icon']
  /** The step the application is sitting at right now. */
  current: boolean
  pending?: boolean
}

const steps = computed<TimelineStep[]>(() => {
  const submitted = applicationStatus('submitted')
  const current = applicationStatus(status)
  const isResolved = ['accepted', 'rejected', 'cancelled'].includes(status)

  const items: TimelineStep[] = [
    {
      key: 'submitted',
      title: 'Application submitted',
      timestamp: submittedAt,
      tone: submitted.tone,
      icon: submitted.icon,
      current: status === 'submitted',
    },
  ]

  if (status === 'under_review') {
    items.push({
      key: 'under_review',
      title: current.label,
      note: current.description,
      tone: current.tone,
      icon: current.icon,
      current: true,
    })
  }

  if (isResolved) {
    items.push({
      key: status,
      title: current.label,
      timestamp: decidedAt,
      note: decisionNote || current.description,
      tone: current.tone,
      icon: current.icon,
      current: true,
    })
  } else {
    // An honest "nothing has happened yet" beats inventing a step.
    items.push({
      key: 'awaiting-decision',
      title: 'Awaiting employer decision',
      note: 'You will see the outcome here as soon as the employer responds.',
      tone: 'neutral',
      icon: Clock,
      current: false,
      pending: true,
    })
  }

  return items
})
</script>

<template>
  <ol class="grid gap-0">
    <li v-for="(step, index) in steps" :key="step.key" class="grid grid-cols-[auto_1fr] gap-x-4">
      <!-- Marker column: dot plus the rail connecting it to the next step. -->
      <div class="flex flex-col items-center">
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-surface"
          :class="[
            step.pending ? 'border-dashed border-border-strong' : 'border-current',
            TONE_TEXT[step.tone],
          ]"
        >
          <component :is="step.icon" class="size-4" aria-hidden="true" />
        </span>
        <span
          v-if="index < steps.length - 1"
          class="w-0.5 flex-1"
          :class="step.pending ? 'bg-border' : TONE_RAIL[step.tone]"
          aria-hidden="true"
        />
      </div>

      <div class="pb-6 last:pb-0" :aria-current="step.current ? 'step' : undefined">
        <p class="text-support font-semibold text-text-primary">
          {{ step.title }}
          <span v-if="step.current" class="sr-only">(current status)</span>
        </p>
        <p v-if="step.timestamp" class="mt-0.5 text-meta text-text-muted">
          {{ formatRelative(step.timestamp) }}
        </p>
        <p v-if="step.note" class="mt-1.5 text-support text-text-secondary">{{ step.note }}</p>
      </div>
    </li>
  </ol>
</template>
