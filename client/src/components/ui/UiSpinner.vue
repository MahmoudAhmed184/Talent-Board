<script setup lang="ts">
/**
 * Indeterminate progress indicator.
 *
 * Renders its own live region unless `label` is empty, in which case the caller
 * is responsible for announcing the loading state.
 */
import { Loader2 } from 'lucide-vue-next'

const { label = 'Loading', size = 'md' } = defineProps<{
  label?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
}
</script>

<template>
  <span class="inline-flex items-center gap-2" :role="label ? 'status' : undefined">
    <Loader2 class="animate-spin text-accent" :class="sizeClasses[size]" aria-hidden="true" />
    <span v-if="label" class="sr-only">{{ label }}</span>
  </span>
</template>
