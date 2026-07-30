<script setup lang="ts">
/**
 * The arched tile collage that fills the right half of the landing hero.
 *
 * Columns scroll vertically at slightly different speeds, alternating
 * direction, and loop forever. Each column renders its tile set twice and
 * travels exactly one set's height, so the seam never lands in view.
 *
 * Purely decorative — it carries no data the page does not state in words — so
 * the whole block is hidden from assistive technology, and the loop stops flat
 * for anyone who has asked for reduced motion. Nothing here is labelled as a
 * candidate or a user: these are stock portraits, credited in
 * `public/talent/CREDITS.md`, and presenting them as real people on the
 * product would be a claim the page cannot back.
 *
 * Swapping the set is a matter of replacing the files in `public/talent/`; the
 * pastel behind each tile shows while its image loads.
 */
interface Tile {
  photo: string
  /** Shown until the photo paints. One of the decorative pastel surfaces. */
  tone: string
}

interface Column {
  tiles: readonly Tile[]
  direction: 'up' | 'down'
  /** Seconds for one full loop. Slow and mismatched, so no beat is obvious. */
  speed: number
  /** Negative animation delay — starts the column part-way through its loop,
   *  which is what gives the columns their staggered offsets. */
  offset: number
  /** Narrow screens only have room for three columns. */
  wideOnly?: boolean
}

const columns: readonly Column[] = [
  {
    direction: 'up',
    speed: 46,
    offset: -6,
    tiles: [
      { photo: '/talent/talent-01.webp', tone: 'bg-pastel-rose' },
      { photo: '/talent/talent-02.webp', tone: 'bg-pastel-peach' },
      { photo: '/talent/talent-03.webp', tone: 'bg-pastel-mint' },
    ],
  },
  {
    direction: 'down',
    speed: 38,
    offset: -14,
    tiles: [
      { photo: '/talent/talent-04.webp', tone: 'bg-pastel-sky' },
      { photo: '/talent/talent-05.webp', tone: 'bg-pastel-peach' },
      { photo: '/talent/talent-06.webp', tone: 'bg-pastel-mint' },
    ],
  },
  {
    direction: 'up',
    speed: 54,
    offset: -22,
    tiles: [
      { photo: '/talent/talent-07.webp', tone: 'bg-pastel-peach' },
      { photo: '/talent/talent-08.webp', tone: 'bg-pastel-neutral' },
      { photo: '/talent/talent-09.webp', tone: 'bg-pastel-rose' },
    ],
  },
  {
    direction: 'down',
    speed: 50,
    offset: -30,
    wideOnly: true,
    tiles: [
      { photo: '/talent/talent-10.webp', tone: 'bg-pastel-peach' },
      { photo: '/talent/talent-11.webp', tone: 'bg-pastel-sky' },
      { photo: '/talent/talent-12.webp', tone: 'bg-pastel-neutral' },
    ],
  },
]
</script>

<template>
  <div class="grid h-full grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4" aria-hidden="true">
    <!--
      The track is taller than its column and is left to overflow: the hero
      band's own `overflow-hidden` is what crops it, so the tiles run to the
      band's edges the way the reference does.
    -->
    <div
      v-for="(column, index) in columns"
      :key="index"
      class="relative h-full"
      :class="column.wideOnly ? 'hidden lg:block' : ''"
    >
      <div
        class="absolute inset-x-0 top-0"
        :class="column.direction === 'up' ? 'marquee-up' : 'marquee-down'"
        :style="{
          '--marquee-duration': `${column.speed}s`,
          '--marquee-offset': `${column.offset}s`,
        }"
      >
        <!--
          Two identical passes. The spacing between tiles is the tile's own
          bottom margin rather than a flex gap, so the track is exactly twice
          one pass and a 50% travel loops seamlessly.
        -->
        <template v-for="pass in 2" :key="pass">
          <!--
            The arch: elliptical radii of 50% of the width and 25% of the
            height are, at a 1:2 aspect, both exactly half the tile's width — a
            true stadium with semicircular caps. A plain `rounded-full` would
            scale both radii down proportionally and give an egg instead.
          -->
          <div
            v-for="(tile, row) in column.tiles"
            :key="`${pass}-${row}`"
            class="mb-3 aspect-[1/2] overflow-hidden rounded-[50%_/_25%] sm:mb-4"
            :class="tile.tone"
          >
            <img
              :src="tile.photo"
              alt=""
              class="size-full object-cover"
              decoding="async"
              :loading="pass === 1 ? 'eager' : 'lazy'"
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * An ambient loop, not a UI transition: it has no start and no end state, so
 * it is deliberately outside the token duration scale (which tops out at
 * 320ms for things the user is waiting on). Only `transform` animates.
 */
.marquee-up,
.marquee-down {
  animation-duration: var(--marquee-duration);
  animation-delay: var(--marquee-offset);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.marquee-up {
  animation-name: hero-marquee-up;
}

.marquee-down {
  animation-name: hero-marquee-down;
}

@keyframes hero-marquee-up {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

@keyframes hero-marquee-down {
  from { transform: translateY(-50%); }
  to { transform: translateY(0); }
}

/* Reduced motion gets the same composition, held still. */
@media (prefers-reduced-motion: reduce) {
  .marquee-up,
  .marquee-down {
    animation: none;
    transform: translateY(-25%);
  }
}
</style>
