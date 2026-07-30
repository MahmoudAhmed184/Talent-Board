<script setup lang="ts">
/**
 * Application status badge.
 *
 * Delegates to the centralised descriptor map so the label, tone, and icon for
 * a given status are defined exactly once — see `src/lib/status.ts`. Unknown
 * values coming from a newer API degrade to a neutral "Unknown" badge rather
 * than rendering a raw enum string.
 */
import { computed } from 'vue'
import UiStatusBadge from './ui/UiStatusBadge.vue'
import { applicationStatus } from '../lib/status'

const { size = 'md', status } = defineProps<{
  size?: 'sm' | 'md'
  status: string
}>()

const descriptor = computed(() => applicationStatus(status))
</script>

<template>
  <UiStatusBadge :status="descriptor" :size="size" />
</template>
