<script setup lang="ts">
/**
 * The arc carousel under the landing band's headline.
 *
 * Geometry, in one idea: every tile is rotated about the *same* point far
 * below the row (`transform-origin: 50% var(--arc-r)`), so a rotation both
 * slides the tile along a circle and tilts it tangentially. That is what makes
 * the row read as a wheel rather than a fan of tilted rectangles — a 3D
 * `perspective` cannot produce it, because these tiles are not turning away
 * from the viewer, they are travelling around a curve.
 *
 * Motion has two drivers over one piece of state, `position` (the slot sitting
 * at top-centre, as a float):
 *  - it advances by one slot on a timer, and each tile eases to its new angle;
 *  - a pointer drag moves it continuously and snaps to the nearest slot on
 *    release, with the timer suspended until shortly after.
 *
 * The wheel is endless: a tile's angle comes from its offset wrapped into
 * ±half the set, so the tile leaving one end reappears at the other. That
 * reappearance happens at the outermost slots, which are faded out and past
 * the band's crop, so the jump is never visible.
 *
 * Purely decorative — no data, no labels — so the whole block is hidden from
 * assistive technology and there is nothing here to reach by keyboard. The
 * portraits are stock studio shots credited in `public/talent/CREDITS.md`;
 * nothing presents them as real candidates or employers.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from 'motion-v'

interface Tile {
  photo: string
  /** Shown until the photo paints. One of the decorative pastel surfaces. */
  tone: string
}

const tiles: readonly Tile[] = [
  { photo: '/talent/talent-02.webp', tone: 'bg-pastel-lilac' },
  { photo: '/talent/talent-05.webp', tone: 'bg-pastel-peach' },
  { photo: '/talent/talent-08.webp', tone: 'bg-pastel-sky' },
  { photo: '/talent/talent-11.webp', tone: 'bg-pastel-rose' },
  { photo: '/talent/talent-03.webp', tone: 'bg-pastel-mint' },
  { photo: '/talent/talent-06.webp', tone: 'bg-pastel-neutral' },
  { photo: '/talent/talent-09.webp', tone: 'bg-pastel-peach' },
  { photo: '/talent/talent-12.webp', tone: 'bg-pastel-sky' },
  { photo: '/talent/talent-01.webp', tone: 'bg-pastel-lilac' },
]

/** Degrees between two slots. Paired with `--arc-r` so tiles clear each other. */
const SLOT_ANGLE = 13
/** Milliseconds a tile rests before the wheel steps on. */
const STEP_INTERVAL = 2600
/** Milliseconds after a drag ends before the wheel resumes on its own. */
const RESUME_DELAY = 3600

const track = ref<HTMLElement | null>(null)
/** Which slot is at top-centre. Fractional while dragging. */
const position = ref(0)
const isDragging = ref(false)

const prefersReducedMotion = useReducedMotion()

let timer: number | undefined
let resumeTimer: number | undefined
let dragOriginX = 0
let dragOriginPosition = 0
/** Pixels of travel per slot, resolved from `--arc-r` when a drag starts. */
let slotWidth = 1

/** Offset wrapped into ±half the set — the shorter way round the wheel. */
function wrappedOffset(index: number): number {
  const half = tiles.length / 2
  const raw = index - position.value + half

  return ((raw % tiles.length) + tiles.length) % tiles.length - half
}

function tileStyle(index: number) {
  const offset = wrappedOffset(index)
  const distance = Math.abs(offset)

  return {
    transform: `rotate(${offset * SLOT_ANGLE}deg)`,
    /* Fades before the wrap point, so a tile jumping to the far end is
     * already invisible — and on very wide screens the row ends in a vignette
     * rather than a hard last card. */
    opacity: String(Math.min(1, Math.max(0, (2.9 - distance) / 1.0))),
    zIndex: String(10 - Math.round(distance)),
  }
}

function start() {
  if (prefersReducedMotion.value || timer !== undefined) {
    return
  }

  timer = window.setInterval(() => {
    position.value += 1
  }, STEP_INTERVAL)
}

function stop() {
  window.clearInterval(timer)
  timer = undefined
}

function onPointerDown(event: PointerEvent) {
  if (!event.isPrimary || !track.value) {
    return
  }

  stop()
  window.clearTimeout(resumeTimer)

  const radius = Number.parseFloat(getComputedStyle(track.value).getPropertyValue('--arc-r'))

  slotWidth = Math.max(1, radius * ((SLOT_ANGLE * Math.PI) / 180))
  dragOriginX = event.clientX
  dragOriginPosition = position.value
  isDragging.value = true

  ;(event.target as Element).setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  /* Dragging left pulls later slots into view, so the delta is subtracted. */
  position.value = dragOriginPosition - (event.clientX - dragOriginX) / slotWidth
}

function onPointerUp() {
  if (!isDragging.value) {
    return
  }

  isDragging.value = false
  position.value = Math.round(position.value)
  resumeTimer = window.setTimeout(start, RESUME_DELAY)
}

/** Held still for reduced motion — the arc is the point, the travel is not. */
const isAnimated = computed(() => !isDragging.value && !prefersReducedMotion.value)

onMounted(start)

onBeforeUnmount(() => {
  stop()
  window.clearTimeout(resumeTimer)
})
</script>

<template>
  <!--
    `--arc-r` is the wheel's radius and the only thing that changes across
    breakpoints: it is set to roughly one tile width per slot of arc, so the
    tiles keep the same gap whatever size they are.
  -->
  <div
    ref="track"
    class="relative h-52 touch-pan-y select-none overflow-hidden [--arc-r:767px] sm:h-72 sm:[--arc-r:934px] lg:h-96 lg:[--arc-r:1150px]"
    :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    aria-hidden="true"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div
      v-for="(tile, index) in tiles"
      :key="tile.photo"
      class="absolute inset-x-0 top-0 mx-auto w-36 origin-[50%_var(--arc-r)] sm:w-44 lg:w-52"
      :class="isAnimated ? 'arc-tile-eased' : ''"
      :style="tileStyle(index)"
    >
      <div class="aspect-4/5 overflow-hidden rounded-panel shadow-card-hover" :class="tile.tone">
        <img
          :src="tile.photo"
          alt=""
          class="size-full object-cover"
          draggable="false"
          decoding="async"
          loading="lazy"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * One step of the wheel. Longer than any token duration because this is
 * ambient travel with no user waiting on it — the same exemption the hero
 * collage marquee takes. Only `transform` and `opacity` animate.
 */
.arc-tile-eased {
  transition:
    transform 700ms var(--ease-entrance),
    opacity 700ms var(--ease-entrance);
}
</style>
