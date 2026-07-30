<script setup lang="ts">
/**
 * Honest indicator of the Reverb connection backing live status updates.
 *
 * Deliberately reports three distinct states rather than showing a permanent
 * green dot: claiming "live" while the socket is down would teach users to
 * trust a stale screen. When live updates are unavailable the component says
 * so and points at the refresh action instead.
 */
import { computed } from 'vue'
import { RefreshCw, Wifi, WifiOff } from 'lucide-vue-next'
import { UiTooltip } from '@/components/ui'

export type RealtimeState = 'connected' | 'connecting' | 'unavailable'

const { state } = defineProps<{ state: RealtimeState }>()

const emit = defineEmits<{ refresh: [] }>()

const presentation = computed(
  () =>
    ({
      connected: {
        icon: Wifi,
        label: 'Live',
        tooltip: 'Status changes appear here automatically.',
        dot: 'bg-success-fg',
        text: 'text-text-muted',
      },
      connecting: {
        icon: RefreshCw,
        label: 'Connecting',
        tooltip: 'Trying to establish the live connection.',
        dot: 'bg-warning-fg',
        text: 'text-text-muted',
      },
      unavailable: {
        icon: WifiOff,
        label: 'Not live',
        tooltip: 'Live updates are unavailable. Refresh to see the latest statuses.',
        dot: 'bg-border-strong',
        text: 'text-text-muted',
      },
    })[state],
)
</script>

<template>
  <div class="flex items-center gap-2">
    <UiTooltip :text="presentation.tooltip">
      <span
        class="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-2.5 py-1 text-meta font-medium"
        :class="presentation.text"
      >
        <span class="relative flex size-2" aria-hidden="true">
          <span
            v-if="state === 'connected'"
            class="absolute inline-flex size-full animate-ping rounded-full bg-success-fg opacity-60 motion-reduce:animate-none"
          />
          <span class="relative inline-flex size-2 rounded-full" :class="presentation.dot" />
        </span>
        {{ presentation.label }}
      </span>
    </UiTooltip>

    <button
      v-if="state === 'unavailable'"
      type="button"
      class="inline-flex items-center gap-1 rounded-control px-2 py-1 text-meta font-semibold text-accent transition-colors duration-[var(--duration-instant)] hover:bg-brand-50 hover:underline"
      @click="emit('refresh')"
    >
      <RefreshCw class="size-3.5" aria-hidden="true" />
      Refresh
    </button>
  </div>
</template>
