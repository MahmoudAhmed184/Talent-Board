<script setup lang="ts">
/**
 * Inline message anchored to the content it concerns.
 *
 * Important errors — failed submissions, permission problems, validation
 * summaries — belong here rather than in a toast, because a toast disappears
 * and cannot be re-read. Toasts are for confirmations only.
 */
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-vue-next'
import type { Tone } from '../../lib/status'
import { TONE_SURFACE } from '../../lib/tone'

const { title, tone = 'info' } = defineProps<{
  title?: string
  tone?: Extract<Tone, 'info' | 'success' | 'warning' | 'danger'>
}>()

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const

/**
 * Errors interrupt; everything else waits its turn. `assertive` on a danger
 * alert is what makes a failed save audible without the user hunting for it.
 */
const live = computed(() => (tone === 'danger' ? 'assertive' : 'polite'))
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-card border p-4"
    :class="TONE_SURFACE[tone]"
    :role="tone === 'danger' ? 'alert' : 'status'"
    :aria-live="live"
  >
    <component :is="icons[tone]" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />

    <div class="min-w-0 flex-1">
      <p v-if="title" class="text-support font-semibold">{{ title }}</p>
      <div class="text-support" :class="title ? 'mt-1' : ''">
        <slot />
      </div>
      <div v-if="$slots.actions" class="mt-3 flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
