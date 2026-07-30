<script setup lang="ts">
/**
 * Heading for a section inside a page. Renders an `<h2>` by default so the
 * document outline stays correct under UiPageHeader's `<h1>`.
 */
const { as = 'h2', description, title } = defineProps<{
  as?: 'h2' | 'h3'
  description?: string
  title: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <component :is="as" class="text-section-title text-text-primary">{{ title }}</component>
      <p v-if="description" class="mt-1 max-w-prose-max text-support text-text-muted">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
