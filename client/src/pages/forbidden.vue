<script setup lang="ts">
/**
 * 403 — signed in, but this role may not do this.
 *
 * Offers no retry and no sign-in prompt: neither would help. The way out is
 * back to the workspace the account actually has.
 */
import { computed } from 'vue'
import { ShieldAlert } from 'lucide-vue-next'
import { UiButton, UiEmptyState } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { homeForRole, ROLE_LABELS } from '@/lib/navigation'

const authStore = useAuthStore()

const roleLabel = computed(() =>
  authStore.role ? ROLE_LABELS[authStore.role].toLowerCase() : 'current',
)
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6">
    <UiEmptyState
      title-as="h1"
      :icon="ShieldAlert"
      title="This area is not available to your account"
      :description="`Your ${roleLabel} account does not have permission to view this page. If you believe this is wrong, contact an administrator.`"
    >
      <UiButton :to="homeForRole(authStore.role)">Go to my workspace</UiButton>
      <UiButton to="/jobs" variant="secondary">Browse jobs</UiButton>
    </UiEmptyState>
  </div>
</template>
