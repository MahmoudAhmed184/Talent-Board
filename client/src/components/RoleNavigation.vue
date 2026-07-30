<script setup lang="ts">
/**
 * The navigation list for an authenticated workspace.
 *
 * Rendered by every role shell, in the desktop sidebar and inside the mobile
 * drawer, so the two can never disagree. The active item is marked with
 * `aria-current="page"` as well as colour, and the sliding indicator is a
 * shared-layout element rather than a per-item transition.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { useReducedMotion } from '@/design/motion'
import { isNavItemActive, type NavItem } from '@/lib/navigation'

const { items } = defineProps<{ items: readonly NavItem[] }>()

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const prefersReduced = useReducedMotion()

const activeTo = computed(
  () => items.find((item) => isNavItemActive(item, route.path))?.to ?? null,
)
</script>

<template>
  <ul class="grid gap-1">
    <li v-for="item in items" :key="item.to">
      <RouterLink
        :to="item.to"
        class="group relative flex items-center gap-3 rounded-field px-3 py-2.5 text-support font-medium transition-colors duration-[var(--duration-control)]"
        :class="
          activeTo === item.to
            ? 'text-accent'
            : 'text-text-muted hover:bg-surface-sunken hover:text-text-primary'
        "
        :aria-current="activeTo === item.to ? 'page' : undefined"
        @click="emit('navigate')"
      >
        <!--
          One element shared across items via `layoutId`, so the highlight
          slides between destinations instead of fading in place.
        -->
        <motion.span
          v-if="activeTo === item.to"
          :layout-id="prefersReduced ? undefined : 'role-nav-active'"
          class="absolute inset-0 rounded-field bg-brand-50"
          aria-hidden="true"
        />

        <component
          :is="item.icon"
          class="relative size-5 shrink-0"
          :class="activeTo === item.to ? 'text-accent' : 'text-text-faint group-hover:text-text-muted'"
          aria-hidden="true"
        />
        <span class="relative min-w-0 truncate">{{ item.label }}</span>
      </RouterLink>
    </li>
  </ul>
</template>
