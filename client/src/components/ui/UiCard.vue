<script setup lang="ts">
/**
 * The standard content surface.
 *
 * Borders do the separating; `interactive` adds a restrained 2px lift for
 * cards that are themselves a link or button. The lift is transform-only so it
 * never triggers layout.
 */
import { computed } from 'vue'
import { CARD_PADDING, type CardPadding } from './variants'

const {
  as = 'div',
  interactive = false,
  padding = 'md',
  tone = 'surface',
} = defineProps<{
  as?: string
  /** Adds hover/focus elevation. Only for cards that are actually activatable. */
  interactive?: boolean
  padding?: CardPadding
  tone?: 'surface' | 'subtle' | 'sunken'
}>()

const toneClasses: Record<'surface' | 'subtle' | 'sunken', string> = {
  surface: 'bg-surface',
  subtle: 'bg-surface-subtle',
  sunken: 'bg-surface-sunken',
}

const interactiveClasses = computed(() =>
  interactive
    ? 'transition-[transform,box-shadow,border-color] duration-[var(--duration-control)] ease-[var(--ease-standard)] ' +
      'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover ' +
      'focus-within:-translate-y-0.5 focus-within:shadow-card-hover ' +
      'motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0'
    : '',
)
</script>

<template>
  <component
    :is="as"
    class="rounded-card border border-border"
    :class="[toneClasses[tone], CARD_PADDING[padding], interactiveClasses]"
  >
    <slot />
  </component>
</template>
