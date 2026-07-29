<route lang="json">
{
  "meta": {
    "layout": "standalone",
    "requiresAuth": true,
    "role": "admin"
  }
}
</route>

<script setup lang="ts">
import { useAuth } from '../../features/auth/composables/useAuth'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'

const router = useRouter()
const { logout } = useAuth()

const handleLogout = async () => {
  try {
    await logout()
  } catch {
    //
  }
  router.push('/')
}

const navItems = [
  { label: 'Overview', to: '/admin' },
  { label: 'Jobs', to: '/admin/jobs' },
] as const
</script>

<template>
  <main class="min-h-svh bg-slate-50 text-slate-950">
    <div class="mx-auto grid min-h-svh max-w-7xl gap-6 px-4 py-6 md:grid-cols-[16rem_1fr] md:px-6">
      <aside class="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <RouterLink to="/" class="text-lg font-semibold text-slate-950">
            Talent Board
          </RouterLink>

          <nav aria-label="Admin navigation" class="mt-8 grid gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              active-class="bg-violet-50 text-violet-800"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </div>

        <div class="mt-auto pt-8">
          <button @click="handleLogout" class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut class="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <section class="min-w-0">
        <RouterView />
      </section>
    </div>
  </main>
</template>
