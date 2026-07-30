<script setup lang="ts">
/**
 * Product mark. Links to the signed-in user's home, or the public landing page
 * for guests, so the logo always means "take me back to my start".
 */
import { computed } from 'vue'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { homeForRole } from '@/lib/navigation'

const { tone = 'light' } = defineProps<{ tone?: 'light' | 'dark' }>()

const authStore = useAuthStore()
const target = computed(() => homeForRole(authStore.role))
</script>

<template>
  <RouterLink
    :to="target"
    class="inline-flex items-center gap-2.5 rounded-control font-bold tracking-tight transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    :class="tone === 'dark' ? 'text-text-inverse' : 'text-text-primary'"
  >
    <div
      class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-black/5 overflow-hidden"
      aria-hidden="true"
    >
      <img
        src="/logo.png"
        alt="Talent Board Logo"
        class="size-full object-contain"
      />
    </div>
    <span class="text-card-title font-bold tracking-tight">Talent Board</span>
  </RouterLink>
</template>
