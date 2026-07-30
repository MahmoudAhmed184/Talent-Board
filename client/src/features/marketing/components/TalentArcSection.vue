<script setup lang="ts">
/**
 * Centred value-proposition band.
 *
 * Composition follows the reference direction: stacked headline, one line of
 * supporting copy, pill calls to action, then a travelling arc of portraits,
 * with three supporting columns under it divided by hairlines.
 *
 * The arc itself is `TalentArcCarousel`, which owns the wheel geometry and its
 * motion. It is full-bleed inside this band so the outer tiles are cropped by
 * the viewport, which is what implies the wheel continues past the page.
 */
import { ArrowRight, BadgeCheck, ClipboardList, SlidersHorizontal } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { UiButton } from '@/components/ui'
import { fadeRise, useMotionPreset, useStaggeredPreset } from '@/design/motion'
import TalentArcCarousel from './TalentArcCarousel.vue'

const columns = [
  {
    icon: BadgeCheck,
    title: 'Reviewed before publishing',
    body: 'A moderator approves every listing, so search never returns a role that was never checked.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Filters that narrow fast',
    body: 'Category, location, work type, experience, and salary — combined in one query string you can share.',
  },
  {
    icon: ClipboardList,
    title: 'One resume, every application',
    body: 'Upload a resume once, reuse it for each role, and follow every decision from your dashboard.',
  },
] as const

const copyMotion = useMotionPreset(fadeRise)
const columnMotion = useStaggeredPreset(fadeRise)
</script>

<template>
  <section class="relative overflow-hidden bg-surface-subtle" aria-labelledby="arc-heading">
    <div class="mx-auto max-w-[var(--size-content-max)] px-4 pt-14 sm:px-6 sm:pt-20">
      <motion.div v-bind="copyMotion" class="mx-auto max-w-[var(--size-prose-max)] text-center">
        <h2 id="arc-heading" class="text-display text-text-primary">
          One board for the whole
          <span class="text-accent">hiring conversation</span>
        </h2>

        <p class="mx-auto mt-5 max-w-xl text-body leading-7 text-text-muted">
          Candidates search approved roles and track their applications.
          Employers post once and review every applicant in the same place.
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <UiButton to="/jobs" size="lg" class="rounded-full!">
            Browse open roles
            <template #trailing><ArrowRight class="size-4" aria-hidden="true" /></template>
          </UiButton>

          <UiButton to="/auth/register/employer" size="lg" variant="secondary" class="rounded-full!">
            Post a role
          </UiButton>
        </div>
      </motion.div>
    </div>

    <div class="mt-12 sm:mt-14">
      <TalentArcCarousel />
    </div>

    <!--
      Supporting columns. The hairlines are left borders on every column but
      the first, which keeps them between the columns and never on the edges.
    -->
    <div class="mx-auto max-w-[var(--size-content-max)] px-4 pb-14 sm:px-6 sm:pb-20">
      <ul class="mt-12 grid gap-8 sm:mt-14 md:grid-cols-3 md:gap-0">
        <motion.li
          v-for="(column, index) in columns"
          :key="column.title"
          v-bind="columnMotion(index)"
          class="text-center md:px-8"
          :class="index > 0 ? 'md:border-l md:border-border' : ''"
        >
          <span
            class="mx-auto flex size-10 items-center justify-center rounded-field bg-brand-100 text-accent"
            aria-hidden="true"
          >
            <component :is="column.icon" class="size-5" />
          </span>

          <h3 class="mt-4 text-card-title text-text-primary">{{ column.title }}</h3>
          <p class="mt-2 text-support leading-6 text-text-muted">{{ column.body }}</p>
        </motion.li>
      </ul>
    </div>
  </section>
</template>
