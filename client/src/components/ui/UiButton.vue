<script setup lang="ts">
/**
 * The single button in the system.
 *
 * Renders a `<button>`, or a `RouterLink`/`<a>` when `to`/`href` is supplied,
 * so that a control which navigates is still a link for keyboard and
 * middle-click users while looking identical to its button siblings.
 */
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { buttonClasses, type ButtonVariant, type ControlSize } from './variants'

const {
  block = false,
  disabled = false,
  href,
  loading = false,
  loadingLabel = 'Working',
  size = 'md',
  to,
  type = 'button',
  variant = 'primary',
} = defineProps<{
  block?: boolean
  disabled?: boolean
  /** External link target. Mutually exclusive with `to`. */
  href?: string
  /** Blocks interaction and swaps the leading icon for a spinner. */
  loading?: boolean
  /** Announced to assistive technology while `loading` is true. */
  loadingLabel?: string
  size?: ControlSize
  /** In-app route target. Mutually exclusive with `href`. */
  to?: RouteLocationRaw
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
}>()

const isInert = computed(() => disabled || loading)
const classes = computed(() => buttonClasses(variant, size, block))

const tag = computed(() => {
  if (to) {
    return RouterLink
  }

  return href ? 'a' : 'button'
})

/**
 * Links have no `disabled`, so an inert link is downgraded to a plain span-like
 * anchor without an href and marked `aria-disabled`.
 */
const linkAttrs = computed(() => {
  if (!to && !href) {
    return { type, disabled: isInert.value }
  }

  if (isInert.value) {
    return { role: 'link', 'aria-disabled': true }
  }

  return to ? { to } : { href }
})
</script>

<template>
  <component :is="tag" v-bind="linkAttrs" :class="classes" :aria-busy="loading || undefined">
    <Loader2 v-if="loading" class="size-4 shrink-0 animate-spin" aria-hidden="true" />
    <slot v-else name="icon" />

    <span class="min-w-0 truncate">
      <slot />
    </span>

    <slot name="trailing" />

    <span v-if="loading" class="sr-only">{{ loadingLabel }}</span>
  </component>
</template>
