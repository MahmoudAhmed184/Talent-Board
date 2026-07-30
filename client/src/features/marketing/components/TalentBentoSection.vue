<script setup lang="ts">
/**
 * Capability bento.
 *
 * Follows the reference's asymmetric rhythm: a wide tile beside a narrow one,
 * then the mirror of that pair. Two tiles carry a portrait anchored to their
 * trailing edge; two are flat colour. Copy sits at the bottom of every tile so
 * the baseline is shared across the grid regardless of tile width.
 *
 * Cards state what the product does — nothing here is a metric or a claim the
 * app cannot demonstrate. The portraits are decorative stock shots (credited
 * in `public/talent/CREDITS.md`) and are dropped below `sm`, where the tile is
 * only wide enough for the text.
 */
import { motion } from 'motion-v'
import { fadeRise, useMotionPreset, useStaggeredPreset } from '@/design/motion'

interface Capability {
  title: string
  body: string
  /** Tailwind classes for the tile surface and its text colour pair. */
  surface: string
  bodyTone: string
  /** Two of the four tiles are double width, alternating side to side. */
  wide: boolean
  /** Decorative portrait pinned to the tile's trailing edge. */
  photo?: string
}

const capabilities: readonly Capability[] = [
  {
    title: 'Search that reflects what is actually open',
    body: 'Listings enter search only after a moderator approves them, and leave it the moment they are closed or expired.',
    surface: 'bg-surface-inverse text-text-inverse',
    bodyTone: 'text-text-inverse-muted',
    wide: true,
    photo: '/talent/talent-04.webp',
  },
  {
    title: 'Apply with a saved resume',
    body: 'Upload once, then send it with any role in a couple of clicks.',
    surface: 'bg-pastel-neutral text-text-primary',
    bodyTone: 'text-text-muted',
    wide: false,
  },
  {
    title: 'Post a role in one form',
    body: 'Draft, submit for review, and edit later without losing applicants.',
    surface: 'bg-pastel-peach text-text-primary',
    bodyTone: 'text-text-secondary',
    wide: false,
  },
  {
    title: 'Every application, one status trail',
    body: 'Candidates see each decision as it lands; employers move applicants through the same stages from their dashboard.',
    surface: 'bg-brand-800 text-text-inverse',
    bodyTone: 'text-brand-100',
    wide: true,
    photo: '/talent/talent-07.webp',
  },
]

const headingMotion = useMotionPreset(fadeRise)
const cardMotion = useStaggeredPreset(fadeRise)
</script>

<template>
  <section aria-labelledby="capabilities-heading">
    <motion.div v-bind="headingMotion" class="mx-auto max-w-[var(--size-prose-max)] text-center">
      <h2 id="capabilities-heading" class="text-page-title text-text-primary">
        Everything a hire needs, from search to decision
      </h2>

      <p class="mx-auto mt-4 max-w-xl text-support leading-6 text-text-muted">
        The same four surfaces carry a role end to end — no spreadsheets in
        between, and no email thread to lose track of.
      </p>
    </motion.div>

    <!--
      Two rows of three columns. The wide tiles alternate sides, which is what
      keeps the grid from reading as a plain two-column list.
    -->
    <ul class="mt-10 grid gap-4 md:grid-cols-3">
      <motion.li
        v-for="(capability, index) in capabilities"
        :key="capability.title"
        v-bind="cardMotion(index)"
        class="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-panel p-6 sm:min-h-64 lg:min-h-72"
        :class="[capability.surface, capability.wide ? 'md:col-span-2' : '']"
      >
        <!--
          The portrait is a background element, so it sits under the copy and
          takes the tile's full height. Text is capped short of it rather than
          scrimmed — the copy never crosses the image. Its leading edge is
          masked into the tile colour so the photo joins the surface instead of
          butting against it with a hard seam.
        -->
        <img
          v-if="capability.photo"
          :src="capability.photo"
          alt=""
          class="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover object-top [mask-image:linear-gradient(to_right,transparent,black_35%)] sm:block lg:w-1/3"
          decoding="async"
          loading="lazy"
          aria-hidden="true"
        >

        <div class="relative" :class="capability.photo ? 'sm:max-w-[58%] lg:max-w-[62%]' : ''">
          <h3 class="text-card-title">{{ capability.title }}</h3>
          <p class="mt-2 text-support leading-6" :class="capability.bodyTone">
            {{ capability.body }}
          </p>
        </div>
      </motion.li>
    </ul>
  </section>
</template>
