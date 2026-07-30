<script setup lang="ts">
/**
 * One row inside UiDropdownMenu. Kept separate so every menu row gets the same
 * height, padding, and destructive treatment.
 */
import { DropdownMenuItem } from 'reka-ui'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const { disabled = false, tone = 'default', to } = defineProps<{
  disabled?: boolean
  tone?: 'default' | 'danger'
  /** Renders the row as a router link while keeping menu keyboard semantics. */
  to?: RouteLocationRaw
}>()

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    class="flex h-10 cursor-pointer select-none items-center gap-2.5 rounded-control px-2.5 text-support font-medium outline-none transition-colors duration-[var(--duration-instant)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    :class="
      tone === 'danger'
        ? 'text-danger-fg data-[highlighted]:bg-danger-bg'
        : 'text-text-secondary data-[highlighted]:bg-surface-sunken data-[highlighted]:text-text-primary'
    "
    @select="emit('select')"
  >
    <component :is="to ? RouterLink : 'span'" :to="to" class="flex w-full items-center gap-2.5">
      <slot name="icon" />
      <span class="min-w-0 flex-1 truncate"><slot /></span>
    </component>
  </DropdownMenuItem>
</template>
