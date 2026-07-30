<script setup lang="ts">
/**
 * The top of every page: eyebrow, `<h1>`, supporting line, and one primary
 * action slot.
 *
 * Every route renders exactly one of these, which is what guarantees a single
 * `<h1>` and a predictable place for the page's main action.
 */
const { description, eyebrow, title } = defineProps<{
  description?: string
  /** Short context label above the title, e.g. the section name. */
  eyebrow?: string
  title: string
}>()
</script>

<template>
  <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div class="min-w-0">
      <slot name="breadcrumbs" />

      <p
        v-if="eyebrow"
        class="text-meta font-semibold uppercase tracking-wider text-accent"
        :class="$slots.breadcrumbs ? 'mt-3' : ''"
      >
        {{ eyebrow }}
      </p>

      <h1 class="mt-1 text-page-title text-text-primary">{{ title }}</h1>

      <p v-if="description" class="mt-2 max-w-prose-max text-support text-text-muted">
        {{ description }}
      </p>

      <slot name="meta" />
    </div>

    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>
