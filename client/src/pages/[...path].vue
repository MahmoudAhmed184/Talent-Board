<script setup lang="ts">
/**
 * 404 catch-all.
 *
 * Offers search rather than a dead end — on a job board, a missing URL is
 * usually a listing that expired or was never approved, and the useful next
 * step is finding a similar role.
 */
import { FileQuestion } from 'lucide-vue-next'
import { UiButton, UiEmptyState } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { homeForRole } from '@/lib/navigation'

const authStore = useAuthStore()
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6">
    <UiEmptyState
      title-as="h1"
      :icon="FileQuestion"
      title="We could not find that page"
      description="The link may be outdated, or the listing it pointed to is no longer published."
    >
      <UiButton to="/jobs">Browse jobs</UiButton>
      <UiButton
        v-if="authStore.isAuthenticated"
        :to="homeForRole(authStore.role)"
        variant="secondary"
      >
        My workspace
      </UiButton>
      <UiButton v-else to="/" variant="secondary">Go home</UiButton>
    </UiEmptyState>
  </div>
</template>
