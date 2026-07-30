<script setup lang="ts">
/**
 * Route-level transition wrapper.
 *
 * Deliberately has no exit animation and no `AnimatePresence`. Keying the
 * wrapper on the route path remounts it per navigation, which replays the
 * enter variant — that is the entire effect we want.
 *
 * An earlier version used `AnimatePresence mode="wait"` so the outgoing page
 * would finish leaving first. It rendered the first page and then left `<main>`
 * empty on every subsequent navigation: the incoming child is gated on the
 * outgoing child's exit completing, and that never resolved here. A page
 * transition must never be able to withhold the page, so the exit is gone
 * rather than reinstated with a longer timeout.
 *
 * Reduced-motion users get the opacity-only variant from the shared preset.
 */
import { motion } from 'motion-v'
import { pageTransition, useMotionPreset } from '@/design/motion'

const preset = useMotionPreset(pageTransition)
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <motion.div
      :key="route.path"
      :initial="preset.initial"
      :animate="preset.animate"
    >
      <component :is="Component" />
    </motion.div>
  </RouterView>
</template>
