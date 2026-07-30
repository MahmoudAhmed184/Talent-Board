<script setup lang="ts">
/**
 * Edge-anchored panel. Used for the mobile filter drawer and mobile navigation.
 *
 * Shares reka-ui's dialog machinery with UiDialog — same focus trap, focus
 * restoration, and scroll lock — and the same CSS-driven presence, so a
 * drawer is never a second-class overlay. See UiDialog for why presence is
 * CSS rather than motion-v.
 */
import { computed } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { X } from 'lucide-vue-next'

const {
  description,
  side = 'right',
  title,
} = defineProps<{
  description?: string
  side?: 'left' | 'right' | 'bottom'
  title: string
}>()

const open = defineModel<boolean>('open', { default: false })

const positionClasses = computed(
  () =>
    ({
      left: 'inset-y-0 left-0 h-svh w-[min(22rem,calc(100vw-3rem))] rounded-r-panel border-r data-[state=open]:animate-sheet-left-in data-[state=closed]:animate-sheet-left-out',
      right:
        'inset-y-0 right-0 h-svh w-[min(22rem,calc(100vw-3rem))] rounded-l-panel border-l data-[state=open]:animate-sheet-right-in data-[state=closed]:animate-sheet-right-out',
      bottom:
        'inset-x-0 bottom-0 max-h-[85svh] rounded-t-panel border-t data-[state=open]:animate-sheet-bottom-in data-[state=closed]:animate-sheet-bottom-out',
    })[side],
)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-ink-950/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
        :style="{ zIndex: 'var(--z-drawer-backdrop)' }"
      />

      <DialogContent
        class="fixed grid grid-rows-[auto_minmax(0,1fr)_auto] border-border bg-surface shadow-overlay"
        :class="positionClasses"
        :style="{ zIndex: 'var(--z-drawer)' }"
      >
        <div class="flex items-start justify-between gap-4 border-b border-border p-5">
          <div class="min-w-0">
            <DialogTitle class="text-section-title text-text-primary">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-support text-text-muted">
              {{ description }}
            </DialogDescription>
          </div>

          <DialogClose
            class="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary"
          >
            <X class="size-5" aria-hidden="true" />
            <span class="sr-only">Close</span>
          </DialogClose>
        </div>

        <div class="overflow-y-auto p-5">
          <slot :close="() => (open = false)" />
        </div>

        <div
          v-if="$slots.footer"
          class="flex flex-wrap gap-2 border-t border-border bg-surface-subtle p-5"
        >
          <slot name="footer" :close="() => (open = false)" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
