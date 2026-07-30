<script setup lang="ts">
/**
 * Modal dialog.
 *
 * reka-ui owns focus trapping, focus restoration to the trigger, scroll
 * locking, Escape, outside-click, and the aria-modal wiring.
 *
 * Enter/exit are CSS animations keyed off reka-ui's `data-state` attribute
 * rather than motion-v: reka-ui holds a closing overlay in the DOM until its
 * CSS animation ends, which is what actually gets it unmounted. Driving
 * presence through AnimatePresence left closed dialogs mounted permanently.
 * The keyframes use the shared duration and easing tokens, so the motion
 * language is unchanged — only who owns presence.
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
  dismissible = true,
  size = 'md',
  title,
} = defineProps<{
  /** Supporting line under the title. Wired to `aria-describedby`. */
  description?: string
  /** Set false for dialogs the user must resolve with an explicit choice. */
  dismissible?: boolean
  size?: 'sm' | 'md' | 'lg'
  title: string
}>()

const open = defineModel<boolean>('open', { default: false })

const sizeClasses = computed(
  () => ({ sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' })[size],
)

/** Blocks Escape / outside-click while the dialog is non-dismissible. */
function guard(event: Event) {
  if (!dismissible) {
    event.preventDefault()
  }
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-ink-950/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
        :style="{ zIndex: 'var(--z-dialog-backdrop)' }"
      />

      <DialogContent
        class="fixed left-1/2 top-1/2 grid max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-panel border border-border bg-surface shadow-overlay data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
        :class="sizeClasses"
        :style="{ zIndex: 'var(--z-dialog)' }"
        @escape-key-down="guard"
        @pointer-down-outside="guard"
        @interact-outside="guard"
      >
        <div class="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div class="min-w-0">
            <DialogTitle class="text-section-title text-text-primary">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-1.5 text-support text-text-muted">
              {{ description }}
            </DialogDescription>
          </div>

          <DialogClose
            v-if="dismissible"
            class="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary"
          >
            <X class="size-5" aria-hidden="true" />
            <span class="sr-only">Close dialog</span>
          </DialogClose>
        </div>

        <div class="overflow-y-auto p-5 sm:p-6">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="flex flex-col-reverse gap-2 border-t border-border bg-surface-subtle p-5 sm:flex-row sm:justify-end sm:p-6"
        >
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
