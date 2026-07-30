<script setup lang="ts">
/**
 * An icon-only control.
 *
 * `label` is required and becomes the accessible name — an icon button without
 * one is unusable with a screen reader, so the type system makes it impossible
 * to forget.
 */
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { iconButtonClasses, type ButtonVariant, type ControlSize } from './variants'

const {
  disabled = false,
  href,
  label,
  loading = false,
  size = 'md',
  to,
  type = 'button',
  variant = 'ghost',
} = defineProps<{
  disabled?: boolean
  href?: string
  /** Accessible name for the control. Never rendered visually. */
  label: string
  loading?: boolean
  size?: ControlSize
  to?: RouteLocationRaw
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
}>()

const isInert = computed(() => disabled || loading)
const tag = computed(() => (to ? RouterLink : href ? 'a' : 'button'))

const attrs = computed(() => {
  if (!to && !href) {
    return { type, disabled: isInert.value }
  }

  return isInert.value ? { role: 'link', 'aria-disabled': true } : to ? { to } : { href }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    :aria-label="label"
    :aria-busy="loading || undefined"
    :class="iconButtonClasses(variant, size)"
  >
    <Loader2 v-if="loading" class="size-4 animate-spin" aria-hidden="true" />
    <slot v-else />
  </component>
</template>
