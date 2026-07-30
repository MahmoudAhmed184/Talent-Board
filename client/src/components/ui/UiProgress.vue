<script setup lang="ts">
/**
 * Determinate progress bar, used for file uploads.
 *
 * The percentage is rendered as text as well as width, because a bar alone is
 * not perceivable to a screen-reader user mid-upload.
 */
import { computed, useId } from 'vue'

const { label, showValue = true, tone = 'accent', value } = defineProps<{
  label: string
  showValue?: boolean
  tone?: 'accent' | 'success' | 'danger'
  /** 0–100. Clamped. */
  value: number
}>()

const labelId = useId()
const clamped = computed(() => Math.min(100, Math.max(0, Math.round(value))))

const toneClasses: Record<'accent' | 'success' | 'danger', string> = {
  accent: 'bg-accent',
  success: 'bg-success-fg',
  danger: 'bg-danger-fg',
}
</script>

<template>
  <div class="grid gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <span :id="labelId" class="text-meta font-medium text-text-secondary">{{ label }}</span>
      <span v-if="showValue" class="text-meta tabular-nums text-text-muted">{{ clamped }}%</span>
    </div>

    <div
      role="progressbar"
      :aria-labelledby="labelId"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      class="h-2 overflow-hidden rounded-pill bg-surface-sunken"
    >
      <div
        class="h-full rounded-pill transition-[width] duration-[var(--duration-element)] ease-[var(--ease-standard)]"
        :class="toneClasses[tone]"
        :style="{ width: `${clamped}%` }"
      />
    </div>
  </div>
</template>
