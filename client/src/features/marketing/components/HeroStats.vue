<script setup lang="ts">
/**
 * The hero's headline figures.
 *
 * Every number here is a real count from `GET /api/v1/stats` — open roles uses
 * the same query the public board runs, so a visitor who reads "N open roles"
 * and then browses finds the same N. Nothing is rounded up or invented.
 *
 * The row stays hidden until the figures arrive rather than counting up from
 * placeholder zeros, which would read as data that is simply small.
 *
 * The face pile is decoration, not evidence: the same stock portraits as the
 * collage, hidden from assistive technology, and never labelled as the people
 * the counts refer to.
 */
import { motion } from 'motion-v'
import { fadeRise, useMotionPreset } from '@/design/motion'
import HeroCounter from './HeroCounter.vue'

const { candidates, openRoles, recruiters } = defineProps<{
  candidates: number
  openRoles: number
  recruiters: number
}>()

const rowMotion = useMotionPreset(fadeRise)

const facePile = [
  '/talent/talent-04.webp',
  '/talent/talent-02.webp',
  '/talent/talent-11.webp',
  '/talent/talent-08.webp',
  '/talent/talent-03.webp',
]
</script>

<template>
  <motion.div v-bind="rowMotion" class="flex flex-wrap items-center gap-x-10 gap-y-6">
    <div class="flex items-center -space-x-3" aria-hidden="true">
      <img
        v-for="face in facePile"
        :key="face"
        :src="face"
        alt=""
        loading="lazy"
        decoding="async"
        class="size-10 rounded-full object-cover ring-2 ring-surface-subtle"
      >
    </div>

    <!-- `flex-col-reverse` keeps the term before its value in the markup while
         showing the number on top, where the eye lands first. -->
    <dl class="flex flex-wrap items-start gap-x-8 gap-y-4 sm:gap-x-10">
      <div
        v-for="stat in [
          { label: 'Candidates', value: candidates },
          { label: 'Recruiters', value: recruiters },
          { label: 'Open roles', value: openRoles },
        ]"
        :key="stat.label"
        class="flex flex-col-reverse"
      >
        <dt class="mt-1 text-support text-text-muted">{{ stat.label }}</dt>
        <dd class="font-bold tracking-tight text-text-primary">
          <HeroCounter :value="stat.value" :font-size="34" />
        </dd>
      </div>
    </dl>
  </motion.div>
</template>
