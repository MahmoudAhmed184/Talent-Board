<script setup lang="ts">
/**
 * A single headline number.
 *
 * `to` turns the whole card into a link — the label and value stay inside the
 * anchor so the accessible name is the full "12 pending listings", not "12".
 */
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import type { LucideIcon } from 'lucide-vue-next'
import type { Tone } from '../../lib/status'
import { TONE_TEXT } from '../../lib/tone'

const { hint, icon, label, loading = false, to, tone = 'neutral', value } = defineProps<{
  /** Supporting line under the value. */
  hint?: string
  icon?: LucideIcon
  label: string
  loading?: boolean
  to?: RouteLocationRaw
  tone?: Tone
  value: number | string
}>()
</script>

<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to"
    class="block rounded-card border border-border bg-surface p-5"
    :class="
      to
        ? 'transition-[transform,box-shadow,border-color] duration-[var(--duration-control)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover motion-reduce:hover:translate-y-0'
        : ''
    "
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-support font-medium text-text-muted">{{ label }}</p>

        <p
          v-if="loading"
          class="mt-2 h-9 w-16 animate-pulse rounded-control bg-surface-sunken motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p v-else class="mt-2 text-page-title tabular-nums text-text-primary">{{ value }}</p>

        <p v-if="hint" class="mt-1 text-meta text-text-muted">{{ hint }}</p>
      </div>

      <span
        v-if="icon"
        class="flex size-10 shrink-0 items-center justify-center rounded-field bg-surface-sunken"
      >
        <component :is="icon" class="size-5" :class="TONE_TEXT[tone]" aria-hidden="true" />
      </span>
    </div>
  </component>
</template>
