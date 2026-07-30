<script setup lang="ts">
/**
 * Key/value pairs for detail pages.
 *
 * Used by job details, applicant details, and moderation records so the same
 * information reads identically wherever it appears. Renders a real `<dl>`,
 * and stacks to a single column on small screens.
 */
export interface DescriptionItem {
  term: string
  /**
   * Slot suffix for rich content: `value-<key>`.
   *
   * Required for a custom slot because Vue's dynamic argument syntax cannot
   * express spaces or quotes — `#[`value-Contact email`]` is a parse error, so
   * slots are keyed off a slug rather than the human-readable term.
   */
  key?: string
  /** Plain value, rendered when no `value-<key>` slot is supplied. */
  value?: string | number | null
}

const { columns = 2, items } = defineProps<{
  columns?: 1 | 2 | 3
  items: readonly DescriptionItem[]
}>()

const columnClass: Record<1 | 2 | 3, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}
</script>

<template>
  <dl class="grid grid-cols-1 gap-x-6 gap-y-4" :class="columnClass[columns]">
    <div v-for="item in items" :key="item.term" class="min-w-0">
      <dt class="text-meta font-semibold uppercase tracking-wide text-text-muted">
        {{ item.term }}
      </dt>
      <dd class="mt-1 text-support text-text-primary">
        <slot :name="`value-${item.key ?? item.term}`" :item="item">
          {{ item.value ?? 'Not specified' }}
        </slot>
      </dd>
    </div>
  </dl>
</template>
