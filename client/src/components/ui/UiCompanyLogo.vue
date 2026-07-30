<script setup lang="ts">
/**
 * Company mark for job cards and listing headers.
 *
 * A logo is optional on every employer profile, so the fallback is a
 * first-class state rather than a broken image: the company initial on a
 * neutral tile, sized identically so cards never reflow when a logo is
 * missing or fails to load.
 */
import { computed, ref, watch } from 'vue'
import { Building2 } from 'lucide-vue-next'

const { name, size = 'md', src } = defineProps<{
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  src?: string | null
}>()

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-9 rounded-control text-support',
  md: 'size-12 rounded-field text-body',
  lg: 'size-16 rounded-card text-section-title',
}

const failed = ref(false)

// A new employer can replace a broken logo; reset so the image is retried.
watch(() => src, () => { failed.value = false })

const showImage = computed(() => Boolean(src) && !failed.value)
const initial = computed(() => (name ?? '').trim().charAt(0).toUpperCase())
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden border border-border bg-surface font-bold text-text-secondary select-none"
    :class="sizeClasses[size]"
    aria-hidden="true"
  >
    <img
      v-if="showImage"
      :src="src ?? undefined"
      alt=""
      class="size-full object-contain"
      @error="failed = true"
    >
    <template v-else-if="initial">{{ initial }}</template>
    <Building2 v-else class="size-1/2 text-text-faint" />
  </span>
</template>
