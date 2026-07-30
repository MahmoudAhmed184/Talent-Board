<script setup lang="ts">
/**
 * Public shell: landing page, job discovery, and job details.
 *
 * The navigation is light, on the same surface as the pages beneath it, so the
 * header and the content read as one block rather than two stacked bands.
 *
 * On the landing page it goes further: the header paints nothing and lies over
 * the hero, so the hero's tile collage scrolls behind the navigation. Every
 * other public page keeps it in flow with a hairline rule, because there the
 * content below starts with real text that must not run under it.
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import AccountMenu from '@/components/AccountMenu.vue'
import AppLogo from '@/components/AppLogo.vue'
import PageTransition from '@/components/PageTransition.vue'
import { UiButton } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { homeForRole } from '@/lib/navigation'

const route = useRoute()
const authStore = useAuthStore()

const mobileNavOpen = ref(false)
const workspacePath = computed(() => homeForRole(authStore.role))

/** The one route whose first section is designed to run under the header. */
const overlaysHero = computed(() => route.path === '/')

const publicLinks = [
  { label: 'Browse jobs', to: '/jobs' },
] as const

watch(() => route.path, () => { mobileNavOpen.value = false })
</script>

<template>
  <!-- Positioned, so the landing page's overlaying header anchors to the
       shell rather than to the document. -->
  <div class="relative min-h-svh bg-canvas">
    <a
      href="#main"
      class="sr-only-focusable absolute left-4 top-4 rounded-field bg-surface px-4 py-2 text-support font-semibold text-accent shadow-overlay"
      :style="{ zIndex: 'var(--z-skip-link)' }"
    >
      Skip to main content
    </a>

    <!--
      Session restoration indicator. Without it the header flickers between the
      signed-out and signed-in states on every hard refresh.
    -->
    <div
      v-if="authStore.isSessionLoading"
      class="h-0.5 w-full overflow-hidden bg-ink-800"
      role="status"
      aria-label="Restoring your session"
    >
      <div class="h-full w-1/3 animate-pulse bg-brand-600 motion-reduce:animate-none" />
    </div>

    <header
      :class="overlaysHero
        ? 'absolute inset-x-0 top-0 bg-transparent'
        : 'relative border-b border-border bg-surface-subtle'"
      :style="{ zIndex: 'var(--z-sticky)' }"
    >
      <div class="mx-auto flex h-16 max-w-[var(--size-content-max)] items-center justify-between gap-4 px-4 sm:px-6">
        <div class="flex min-w-0 items-center gap-8">
          <AppLogo />

          <nav class="hidden items-center gap-1 md:flex" aria-label="Main">
            <RouterLink
              v-for="link in publicLinks"
              :key="link.to"
              :to="link.to"
              class="rounded-field px-3 py-2 text-support font-medium text-text-muted transition-colors duration-[var(--duration-control)] hover:bg-surface-sunken hover:text-text-primary"
              active-class="text-text-primary"
            >
              {{ link.label }}
            </RouterLink>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <UiButton :to="workspacePath" size="sm" variant="secondary" class="hidden sm:inline-flex">
              My workspace
            </UiButton>
            <AccountMenu />
          </template>

          <template v-else-if="!authStore.isSessionLoading">
            <RouterLink
              to="/auth/login"
              class="hidden rounded-field px-3 py-2 text-support font-medium text-text-muted transition-colors duration-[var(--duration-control)] hover:text-text-primary sm:block"
            >
              Sign in
            </RouterLink>
            <UiButton to="/auth/register" size="sm">Create account</UiButton>
          </template>

          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-field text-text-muted transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary md:hidden"
            :aria-expanded="mobileNavOpen"
            aria-controls="public-mobile-nav"
            @click="mobileNavOpen = !mobileNavOpen"
          >
            <component :is="mobileNavOpen ? X : Menu" class="size-5" aria-hidden="true" />
            <span class="sr-only">{{ mobileNavOpen ? 'Close menu' : 'Open menu' }}</span>
          </button>
        </div>
      </div>

      <nav
        v-show="mobileNavOpen"
        id="public-mobile-nav"
        class="border-t border-border bg-surface-subtle px-4 pb-4 pt-2 md:hidden"
        aria-label="Main"
      >
        <RouterLink
          v-for="link in publicLinks"
          :key="link.to"
          :to="link.to"
          class="block rounded-field px-3 py-3 text-support font-medium text-text-muted hover:bg-surface-sunken hover:text-text-primary"
        >
          {{ link.label }}
        </RouterLink>

        <RouterLink
          v-if="!authStore.isAuthenticated && !authStore.isSessionLoading"
          to="/auth/login"
          class="block rounded-field px-3 py-3 text-support font-medium text-text-muted hover:bg-surface-sunken hover:text-text-primary"
        >
          Sign in
        </RouterLink>

        <RouterLink
          v-if="authStore.isAuthenticated"
          :to="workspacePath"
          class="block rounded-field px-3 py-3 text-support font-medium text-text-muted hover:bg-surface-sunken hover:text-text-primary"
        >
          My workspace
        </RouterLink>
      </nav>
    </header>

    <main id="main">
      <PageTransition />
    </main>

    <footer class="border-t border-border bg-surface">
      <div
        class="mx-auto flex max-w-[var(--size-content-max)] flex-col gap-3 px-4 py-8 text-support text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p>Talent Board — approved openings from verified employers.</p>
        <nav aria-label="Footer">
          <RouterLink to="/jobs" class="rounded-control hover:text-accent hover:underline">
            Browse jobs
          </RouterLink>
        </nav>
      </div>
    </footer>
  </div>
</template>
