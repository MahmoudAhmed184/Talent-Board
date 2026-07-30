<script setup lang="ts">
/**
 * Anchored panel holding arbitrary content — a filter group, a summary, a form
 * fragment. Unlike UiDropdownMenu it uses dialog semantics, so interactive
 * content inside behaves normally.
 */
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

const { align = 'start', label, width = 'auto' } = defineProps<{
  align?: 'start' | 'center' | 'end'
  /** Accessible name for the panel itself. */
  label: string
  width?: 'auto' | 'trigger' | 'wide'
}>()

const open = defineModel<boolean>('open', { default: false })

const widthClasses: Record<'auto' | 'trigger' | 'wide', string> = {
  auto: 'min-w-56',
  trigger: 'w-[var(--reka-popover-trigger-width)]',
  wide: 'w-[min(24rem,calc(100vw-2rem))]',
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        :align="align"
        :side-offset="6"
        :collision-padding="12"
        :aria-label="label"
        class="rounded-card border border-border bg-surface p-4 shadow-popover data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out"
        :class="widthClasses[width]"
        :style="{ zIndex: 'var(--z-dropdown)' }"
      >
        <slot :close="() => (open = false)" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
