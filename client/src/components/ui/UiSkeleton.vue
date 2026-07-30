<script setup lang="ts">
/**
 * Loading placeholder.
 *
 * Skeletons are decorative: the surrounding container owns the `role="status"`
 * and the "Loading …" text, so screen readers hear one announcement instead of
 * one per shimmer block.
 */
const { rounded = 'field' } = defineProps<{
  rounded?: 'control' | 'field' | 'card' | 'pill' | 'full'
}>()

const roundedClasses: Record<string, string> = {
  control: 'rounded-control',
  field: 'rounded-field',
  card: 'rounded-card',
  pill: 'rounded-pill',
  full: 'rounded-full',
}
</script>

<template>
  <div
    class="animate-pulse bg-surface-sunken motion-reduce:animate-none"
    :class="roundedClasses[rounded]"
    aria-hidden="true"
  />
</template>
