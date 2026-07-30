<script setup lang="ts">
/**
 * Supplementary hint on hover *and* keyboard focus.
 *
 * Tooltips may only ever repeat or expand on something already visible — never
 * carry the only copy of an instruction, since touch users cannot hover.
 * TooltipProvider is mounted once in App.vue.
 */
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui'

const { side = 'top', text } = defineProps<{
  side?: 'top' | 'right' | 'bottom' | 'left'
  text: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <TooltipRoot v-model:open="open">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>

    <TooltipPortal>
      <TooltipContent
        :side="side"
        :side-offset="6"
        class="max-w-64 rounded-control bg-ink-950 px-2.5 py-1.5 text-meta font-medium text-text-inverse shadow-popover data-[state=delayed-open]:animate-popover-in data-[state=instant-open]:animate-popover-in data-[state=closed]:animate-popover-out"
        :style="{ zIndex: 'var(--z-dropdown)' }"
      >
        {{ text }}
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>
