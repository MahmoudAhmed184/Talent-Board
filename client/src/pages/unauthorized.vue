<script setup lang="ts">
/**
 * 401 — the user is not signed in (or their session expired).
 *
 * Distinct from `/forbidden`: here signing in fixes the problem, so the primary
 * action is sign-in with a redirect back to where they were headed.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LogIn } from 'lucide-vue-next'
import { UiButton, UiEmptyState } from '@/components/ui'

const route = useRoute()

const redirect = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : null,
)
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6">
    <UiEmptyState
      title-as="h1"
      :icon="LogIn"
      title="You need to sign in"
      description="Your session has ended, or this page requires an account. Sign in to continue where you left off."
    >
      <UiButton :to="{ path: '/auth/login', query: redirect ? { redirect } : {} }">
        Sign in
      </UiButton>
      <UiButton to="/jobs" variant="secondary">Browse jobs</UiButton>
    </UiEmptyState>
  </div>
</template>
