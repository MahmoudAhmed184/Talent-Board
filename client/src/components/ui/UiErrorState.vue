<script setup lang="ts">
/**
 * Failure surface for a collection or detail view that could not load.
 *
 * Distinct from UiEmptyState: this one asserts, names what failed, and always
 * offers a retry. Permission failures use `variant="forbidden"` so a 403 never
 * reads as a server error the user could fix by retrying.
 */
import { computed } from 'vue'
import { AlertOctagon, Lock, WifiOff } from 'lucide-vue-next'
import UiButton from './UiButton.vue'

const {
  description,
  retryLabel = 'Try again',
  title,
  variant = 'error',
} = defineProps<{
  description?: string
  retryLabel?: string
  title?: string
  variant?: 'error' | 'forbidden' | 'offline'
}>()

const emit = defineEmits<{ retry: [] }>()

const presets = {
  error: {
    icon: AlertOctagon,
    title: 'Something went wrong',
    description: 'We could not load this content. The problem is usually temporary.',
  },
  forbidden: {
    icon: Lock,
    title: 'You do not have access to this',
    description: 'Your account role does not permit viewing this content.',
  },
  offline: {
    icon: WifiOff,
    title: 'No connection',
    description: 'Check your network connection and try again.',
  },
} as const

const preset = computed(() => presets[variant])
/** Retrying a 403 just fails again, so no retry is offered for it. */
const canRetry = computed(() => variant !== 'forbidden')
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-card border border-danger-border bg-danger-bg/40 px-6 py-12 text-center"
    role="alert"
  >
    <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-danger-bg">
      <component :is="preset.icon" class="size-6 text-danger-fg" aria-hidden="true" />
    </span>

    <p class="text-card-title text-text-primary">{{ title ?? preset.title }}</p>
    <p class="mt-2 max-w-prose-max text-support text-text-secondary">
      {{ description ?? preset.description }}
    </p>

    <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
      <UiButton v-if="canRetry" variant="secondary" @click="emit('retry')">
        {{ retryLabel }}
      </UiButton>
      <slot />
    </div>
  </div>
</template>
