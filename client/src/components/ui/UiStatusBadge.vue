<script setup lang="ts">
/**
 * Renders a status descriptor from `src/lib/status.ts`.
 *
 * Always pairs the tone with the descriptor's own label and icon, so the state
 * is never carried by colour alone — it survives greyscale, colour-blindness,
 * and screen readers.
 */
import type { StatusDescriptor } from '../../lib/status'
import { TONE_SURFACE } from '../../lib/tone'

const { showIcon = true, size = 'md', status } = defineProps<{
  showIcon?: boolean
  size?: 'sm' | 'md'
  status: StatusDescriptor<string>
}>()
</script>

<template>
  <span
    class="inline-flex max-w-full items-center gap-1.5 rounded-pill border font-semibold"
    :class="[
      size === 'sm' ? 'h-5 px-2 text-[0.6875rem]' : 'h-6 px-2.5 text-meta',
      TONE_SURFACE[status.tone],
    ]"
  >
    <component
      :is="status.icon"
      v-if="showIcon"
      class="size-3.5 shrink-0"
      aria-hidden="true"
    />
    <span class="truncate">{{ status.label }}</span>
  </span>
</template>
