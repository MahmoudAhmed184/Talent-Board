<script setup lang="ts">
/**
 * Person avatar with an initials fallback.
 *
 * The initials are decorative — the accompanying name is always rendered
 * nearby — so the whole element is hidden from assistive technology unless an
 * explicit `label` is provided.
 */
import { computed } from 'vue'

const { label, name, size = 'md', src } = defineProps<{
  /** Accessible name. Omit when the person's name is already adjacent. */
  label?: string
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  src?: string | null
}>()

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-8 text-meta',
  md: 'size-10 text-support',
  lg: 'size-14 text-body',
}

const initials = computed(() => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-900 select-none"
    :class="sizeClasses[size]"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
  >
    <img v-if="src" :src="src" alt="" class="size-full object-cover">
    <template v-else>{{ initials }}</template>
  </span>
</template>
