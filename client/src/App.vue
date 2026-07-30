<script setup lang="ts">
/**
 * Application root.
 *
 * Chooses between the public shell and a route-provided standalone shell — the
 * auth pages and the three role workspaces each bring their own frame via
 * their `_parent.vue`.
 *
 * The toast host and tooltip provider mount once here rather than per shell,
 * so a toast raised while navigating between shells is not unmounted mid-flight.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TooltipProvider } from 'reka-ui'
import AppLayout from './layouts/AppLayout.vue'
import { UiToaster } from './components/ui'

const route = useRoute()
const usesStandaloneLayout = computed(() => route.meta.layout === 'standalone')
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <UiToaster />

    <RouterView v-if="usesStandaloneLayout" />
    <AppLayout v-else />
  </TooltipProvider>
</template>
