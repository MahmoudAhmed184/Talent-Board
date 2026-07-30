<script setup lang="ts">
/**
 * Transient confirmations, rendered once at the app root.
 *
 * Toasts are for *confirming* something the user just did. Anything the user
 * must read, act on, or re-read — validation failures, permission errors,
 * failed saves — belongs in a UiAlert next to the content instead, because a
 * toast is gone in five seconds and cannot be recovered.
 */
import { AnimatePresence, motion } from 'motion-v'
import { AlertTriangle, CheckCircle2, X } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'
import { fadeRise, useMotionPreset } from '../../design/motion'

const { removeToast, toasts } = useToast()
const item = useMotionPreset(fadeRise)
</script>

<template>
  <Teleport to="body">
    <!--
      `aria-live` lives on the always-present container, not on each toast:
      a live region added at the same time as its content is not announced.
    -->
    <div
      class="pointer-events-none fixed right-4 top-4 grid w-[min(24rem,calc(100vw-2rem))] gap-2"
      :style="{ zIndex: 'var(--z-toast)' }"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence>
        <motion.div
          v-for="toast in toasts"
          :key="toast.id"
          layout
          class="pointer-events-auto flex items-start gap-3 rounded-card border bg-surface p-4 shadow-popover"
          :class="toast.type === 'success' ? 'border-success-border' : 'border-danger-border'"
          v-bind="item"
        >
          <component
            :is="toast.type === 'success' ? CheckCircle2 : AlertTriangle"
            class="mt-0.5 size-5 shrink-0"
            :class="toast.type === 'success' ? 'text-success-fg' : 'text-danger-fg'"
            aria-hidden="true"
          />

          <div class="min-w-0 flex-1">
            <p v-if="toast.title" class="text-support font-semibold text-text-primary">
              {{ toast.title }}
            </p>
            <p class="text-support text-text-secondary">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            class="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary"
            @click="removeToast(toast.id)"
          >
            <X class="size-4" aria-hidden="true" />
            <span class="sr-only">Dismiss notification</span>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
