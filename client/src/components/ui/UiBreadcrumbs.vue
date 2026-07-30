<script setup lang="ts">
/**
 * Trail of ancestor pages.
 *
 * The final crumb is the current page: it is rendered as plain text with
 * `aria-current="page"` rather than a link to nowhere.
 */
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

export interface Crumb {
  label: string
  to?: RouteLocationRaw
}

const { items } = defineProps<{ items: readonly Crumb[] }>()
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-1 text-meta text-text-muted">
      <li v-for="(item, index) in items" :key="index" class="flex items-center gap-1">
        <ChevronRight v-if="index > 0" class="size-3.5 shrink-0 text-text-faint" aria-hidden="true" />

        <RouterLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="rounded-control px-1 py-0.5 font-medium transition-colors duration-[var(--duration-instant)] hover:text-accent hover:underline"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="px-1 py-0.5 font-medium text-text-secondary" aria-current="page">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
