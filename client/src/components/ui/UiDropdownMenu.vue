<script setup lang="ts">
/**
 * Menu of actions anchored to a trigger.
 *
 * Only for *actions*. A list of navigation links belongs in real `<a>`
 * elements, and a set of choices bound to a value belongs in UiSelect —
 * a menu reports `role="menuitem"`, which is wrong for both.
 *
 * Presence and animation are handled by reka-ui + CSS; see UiDialog for why.
 */
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'

const { align = 'end', label } = defineProps<{
  align?: 'start' | 'center' | 'end'
  /** Accessible name for the trigger when it renders as an icon button. */
  label?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child :aria-label="label">
      <slot name="trigger" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        :align="align"
        :side-offset="6"
        :collision-padding="12"
        class="min-w-52 overflow-hidden rounded-card border border-border bg-surface p-1.5 shadow-popover data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out"
        :style="{ zIndex: 'var(--z-dropdown)' }"
      >
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
