<script setup lang="ts">
/**
 * Signed-in account menu.
 *
 * Sign-out clears the local session even when the API call fails, so a user
 * whose token has already expired is never trapped in a signed-in-looking UI.
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, LogOut, User } from 'lucide-vue-next'
import { UiAvatar, UiDropdownMenu, UiMenuItem } from '@/components/ui'
import { useAuth } from '@/features/auth/composables/useAuth'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { homeForRole, ROLE_LABELS } from '@/lib/navigation'

const { tone = 'light' } = defineProps<{ tone?: 'light' | 'dark' }>()

const router = useRouter()
const authStore = useAuthStore()
const { logout } = useAuth()

const open = ref(false)
const signingOut = ref(false)

const roleLabel = computed(() => (authStore.role ? ROLE_LABELS[authStore.role] : ''))
const profilePath = computed(() =>
  authStore.role === 'candidate'
    ? '/candidate/profile'
    : authStore.role === 'employer'
      ? '/employer/company'
      : null,
)

async function handleLogout() {
  signingOut.value = true

  try {
    await logout()
  } catch {
    // `logout()` clears the local session in its own `finally`, so an API
    // failure must not stop us from leaving the authenticated area.
  } finally {
    signingOut.value = false
    open.value = false
    await router.push('/')
  }
}
</script>

<template>
  <UiDropdownMenu v-model:open="open">
    <template #trigger>
      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-field px-2 transition-colors duration-[var(--duration-control)]"
        :class="tone === 'dark' ? 'hover:bg-ink-800' : 'hover:bg-surface-sunken'"
      >
        <UiAvatar :name="authStore.user?.name" size="sm" />

        <span class="hidden min-w-0 text-left sm:block">
          <span
            class="block truncate text-support font-semibold"
            :class="tone === 'dark' ? 'text-text-inverse' : 'text-text-primary'"
          >
            {{ authStore.user?.name }}
          </span>
          <span
            class="block truncate text-meta"
            :class="tone === 'dark' ? 'text-text-inverse-muted' : 'text-text-muted'"
          >
            {{ roleLabel }}
          </span>
        </span>

        <ChevronDown
          class="size-4 shrink-0"
          :class="tone === 'dark' ? 'text-text-inverse-muted' : 'text-text-faint'"
          aria-hidden="true"
        />
        <span class="sr-only">Open account menu</span>
      </button>
    </template>

    <div class="border-b border-border px-2.5 pb-2 pt-1">
      <p class="truncate text-support font-semibold text-text-primary">{{ authStore.user?.name }}</p>
      <p class="truncate text-meta text-text-muted">{{ authStore.user?.email }}</p>
    </div>

    <div class="pt-1.5">
      <UiMenuItem :to="homeForRole(authStore.role)" @select="open = false">
        <template #icon><User class="size-4" aria-hidden="true" /></template>
        My workspace
      </UiMenuItem>

      <UiMenuItem v-if="profilePath" :to="profilePath" @select="open = false">
        <template #icon><User class="size-4" aria-hidden="true" /></template>
        {{ authStore.role === 'employer' ? 'Company profile' : 'My profile' }}
      </UiMenuItem>

      <UiMenuItem tone="danger" :disabled="signingOut" @select="handleLogout">
        <template #icon><LogOut class="size-4" aria-hidden="true" /></template>
        {{ signingOut ? 'Signing out…' : 'Sign out' }}
      </UiMenuItem>
    </div>
  </UiDropdownMenu>
</template>
