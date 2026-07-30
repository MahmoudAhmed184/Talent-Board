<script setup lang="ts">
/**
 * "Nothing here yet" surface.
 *
 * An empty state must say what would fill it and offer the action that does —
 * "No results" on its own is a dead end.
 */
import { computed } from 'vue'
import type { LucideIcon } from 'lucide-vue-next'
import { Inbox } from 'lucide-vue-next'

const { description, icon, title, titleAs = 'p' } = defineProps<{
  description?: string
  icon?: LucideIcon
  title: string
  /**
   * Element used for the title.
   *
   * Defaults to `p` because an empty state usually sits *inside* a section that
   * already owns a heading, and a second heading there would corrupt the
   * outline. Pages where the empty state *is* the page — 404, 403, 401 — pass
   * `h1` so the page still has one.
   */
  titleAs?: 'p' | 'h1' | 'h2' | 'h3'
}>()

/*
 * Resolved here rather than as a prop default. Vue treats a function-valued
 * default as a *factory* and invokes it — and a Lucide icon is a functional
 * component, so `icon = Inbox` called the icon's render function with no props
 * and threw. Component-valued props must never carry an inline default.
 */
const resolvedIcon = computed<LucideIcon>(() => icon ?? Inbox)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface px-6 py-12 text-center"
  >
    <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-sunken">
      <component :is="resolvedIcon" class="size-6 text-text-muted" aria-hidden="true" />
    </span>

    <component :is="titleAs" class="text-card-title text-text-primary">{{ title }}</component>
    <p v-if="description" class="mt-2 max-w-prose-max text-support text-text-muted">
      {{ description }}
    </p>

    <div v-if="$slots.default" class="mt-6 flex flex-wrap items-center justify-center gap-3">
      <slot />
    </div>
  </div>
</template>
