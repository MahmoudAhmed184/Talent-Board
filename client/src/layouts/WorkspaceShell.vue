<script setup lang="ts">
/**
 * The authenticated workspace frame shared by candidates, employers, and admins.
 *
 * One shell for all three roles: the navigation contents differ (see
 * `src/lib/navigation.ts`) but the structure, landmarks, focus order, and
 * responsive behaviour are identical, which is what makes the three
 * workspaces feel like one product.
 *
 * Layout: a persistent sidebar from `lg` up; below that the same navigation
 * moves into a drawer reached from the header, so no destination is
 * unreachable on a phone.
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import AccountMenu from '@/components/AccountMenu.vue'
import AppLogo from '@/components/AppLogo.vue'
import PageTransition from '@/components/PageTransition.vue'
import RoleNavigation from '@/components/RoleNavigation.vue'
import { UiSheet } from '@/components/ui'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { navigationForRole, ROLE_LABELS } from '@/lib/navigation'

const route = useRoute()
const authStore = useAuthStore()

const drawerOpen = ref(false)
const items = computed(() => navigationForRole(authStore.role))
const workspaceLabel = computed(() =>
  authStore.role ? `${ROLE_LABELS[authStore.role]} workspace` : 'Workspace',
)

// Navigating from the drawer should close it; watching the route also covers
// browser back/forward, which a click handler alone would miss.
watch(() => route.path, () => { drawerOpen.value = false })
</script>

<template>
  <div class="min-h-svh bg-canvas">
    <a href="#workspace-main" class="sr-only-focusable absolute left-4 top-4 rounded-field bg-surface px-4 py-2 text-support font-semibold text-accent shadow-overlay" :style="{ zIndex: 'var(--z-skip-link)' }">
      Skip to main content
    </a>

    <div class="mx-auto flex w-full max-w-[var(--size-shell-max)]">
      <!-- Persistent sidebar, large screens only. -->
      <aside
        class="sticky top-0 hidden h-svh w-[var(--size-sidebar)] shrink-0 flex-col border-r border-border bg-surface lg:flex"
        :aria-label="workspaceLabel"
      >
        <div class="flex h-16 items-center px-5">
          <AppLogo />
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Workspace">
          <RoleNavigation :items="items" />
        </nav>

        <div class="border-t border-border p-3">
          <AccountMenu />
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6"
          :style="{ zIndex: 'var(--z-sticky)' }"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="flex size-11 items-center justify-center rounded-field text-text-secondary transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken lg:hidden"
              @click="drawerOpen = true"
            >
              <Menu class="size-5" aria-hidden="true" />
              <span class="sr-only">Open navigation menu</span>
            </button>

            <div class="lg:hidden">
              <AppLogo />
            </div>

            <p class="hidden text-support font-semibold text-text-muted lg:block">
              {{ workspaceLabel }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <slot name="header-actions" />
            <div class="lg:hidden">
              <AccountMenu />
            </div>
          </div>
        </header>

        <main id="workspace-main" class="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <PageTransition />
        </main>
      </div>
    </div>

    <UiSheet v-model:open="drawerOpen" side="left" title="Navigation">
      <nav aria-label="Workspace">
        <RoleNavigation :items="items" @navigate="drawerOpen = false" />
      </nav>
    </UiSheet>
  </div>
</template>
