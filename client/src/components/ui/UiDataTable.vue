<script setup lang="ts" generic="TRow extends { id: number | string }">
/**
 * Tabular collection with a real mobile representation.
 *
 * Below `md` the same rows render as stacked cards built from the same column
 * definitions — a desktop table is never horizontally squeezed onto a phone.
 * Each column is rendered through a `cell-<key>` slot, so pages compose cells
 * from domain components rather than passing formatted strings.
 */
import UiSkeleton from './UiSkeleton.vue'

export interface DataTableColumn<T> {
  key: string
  header: string
  /** Hides the column on the desktop table but keeps it in the mobile card. */
  desktopHidden?: boolean
  /** Hides the row from the mobile card, e.g. redundant action columns. */
  mobileHidden?: boolean
  align?: 'start' | 'end'
  /** Reads a plain value when no `cell-<key>` slot is supplied. */
  value?: (row: T) => string | number | null | undefined
}

const {
  caption,
  columns,
  loading = false,
  loadingRows = 4,
  rows,
} = defineProps<{
  /** Describes the table for screen readers. Visually hidden. */
  caption: string
  columns: readonly DataTableColumn<TRow>[]
  loading?: boolean
  loadingRows?: number
  rows: readonly TRow[]
}>()
</script>

<template>
  <div>
    <!-- Desktop: a real table, with real semantics. -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full border-collapse text-left">
        <caption class="sr-only">{{ caption }}</caption>

        <thead>
          <tr class="border-b border-border">
            <th
              v-for="column in columns.filter((c) => !c.desktopHidden)"
              :key="column.key"
              scope="col"
              class="whitespace-nowrap px-3 py-3 text-meta font-semibold uppercase tracking-wide text-text-muted first:pl-0 last:pr-0"
              :class="column.align === 'end' ? 'text-right' : 'text-left'"
            >
              {{ column.header }}
            </th>
          </tr>
        </thead>

        <tbody v-if="loading" aria-hidden="true">
          <tr v-for="index in loadingRows" :key="index" class="border-b border-border last:border-0">
            <td
              v-for="column in columns.filter((c) => !c.desktopHidden)"
              :key="column.key"
              class="px-3 py-4 first:pl-0 last:pr-0"
            >
              <UiSkeleton class="h-5 w-full max-w-40" />
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-b border-border transition-colors duration-[var(--duration-instant)] last:border-0 hover:bg-surface-subtle"
          >
            <td
              v-for="column in columns.filter((c) => !c.desktopHidden)"
              :key="column.key"
              class="px-3 py-4 align-middle text-support text-text-secondary first:pl-0 last:pr-0"
              :class="column.align === 'end' ? 'text-right' : 'text-left'"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                {{ column.value?.(row) ?? '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile: the same data as a stacked definition list per row. -->
    <div class="grid gap-3 md:hidden">
      <template v-if="loading">
        <UiSkeleton v-for="index in loadingRows" :key="index" class="h-32" rounded="card" />
      </template>

      <div
        v-for="row in loading ? [] : rows"
        :key="row.id"
        class="rounded-card border border-border bg-surface p-4"
      >
        <dl class="grid gap-2.5">
          <div
            v-for="column in columns.filter((c) => !c.mobileHidden)"
            :key="column.key"
            class="grid grid-cols-[minmax(6rem,auto)_1fr] items-baseline gap-3"
          >
            <dt class="text-meta font-semibold uppercase tracking-wide text-text-muted">
              {{ column.header }}
            </dt>
            <dd class="min-w-0 text-support text-text-secondary">
              <slot :name="`cell-${column.key}`" :row="row">
                {{ column.value?.(row) ?? '—' }}
              </slot>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
