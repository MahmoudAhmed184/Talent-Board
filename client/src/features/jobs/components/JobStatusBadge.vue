<script setup lang="ts">
/**
 * Moderation status for a listing.
 *
 * Earns its place over a bare UiStatusBadge by folding in the derived expiry
 * state: an approved listing past its deadline reads "Expired", not
 * "Published". Every surface that shows a listing status uses this, so the
 * derivation cannot be applied inconsistently.
 */
import { computed } from 'vue'
import { UiStatusBadge } from '@/components/ui'
import { jobDisplayStatus } from '@/lib/status'

const { approvalStatus, expiresAt, size = 'md' } = defineProps<{
  approvalStatus: string
  expiresAt?: string | null
  size?: 'sm' | 'md'
}>()

const status = computed(() => jobDisplayStatus(approvalStatus, expiresAt))
</script>

<template>
  <UiStatusBadge :status="status" :size="size" />
</template>
