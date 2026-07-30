<script setup lang="ts">
/**
 * Compact label. Tone is decorative here — if the badge communicates a state,
 * use UiStatusBadge instead so an icon and a real label come with it.
 */
import { computed } from 'vue'
import type { Tone } from '../../lib/status'
import { TONE_SURFACE } from '../../lib/tone'

const { size = 'md', tone = 'neutral' } = defineProps<{
  size?: 'sm' | 'md'
  tone?: Tone
}>()

const sizeClasses = computed(() =>
  size === 'sm' ? 'h-5 px-2 text-[0.6875rem]' : 'h-6 px-2.5 text-meta',
)
</script>

<template>
  <span
    class="inline-flex max-w-full items-center gap-1.5 rounded-pill border font-semibold"
    :class="[sizeClasses, TONE_SURFACE[tone]]"
  >
    <slot name="icon" />
    <span class="truncate"><slot /></span>
  </span>
</template>
