<script setup lang="ts">
/**
 * Odometer counter — the digits roll into place when the value changes.
 *
 * A Vue port of React Bits' `Counter`, rebuilt on `motion-v` (already the
 * project's animation layer) rather than adding `motion/react`, and trimmed to
 * whole numbers, which is all a headline count needs. The mechanic is the
 * original's: ten stacked digits per place, each held in position by a spring.
 *
 * The values it shows come from the API, so the roll doubles as the loading
 * story — it starts at zero and counts up the moment the real figure lands.
 *
 * Reduced motion gets the number, plainly. A rolling counter is decoration on
 * top of a value that is perfectly readable standing still.
 */
import { computed } from 'vue'
import { useReducedMotion } from 'motion-v'
import HeroCounterDigit from './HeroCounterDigit.vue'

const { fontSize = 34, gap = 0, value } = defineProps<{
  /** Digit height in pixels. The window has to be sized in px to offset by it. */
  fontSize?: number
  /** Space between wheels, in pixels. */
  gap?: number
  value: number
}>()

/** Place values, most significant first: 1204 → [1000, 100, 10, 1]. */
const places = computed(() => {
  const digits = Math.max(1, Math.trunc(Math.abs(value)).toString().length)

  return Array.from({ length: digits }, (_, index) => 10 ** (digits - index - 1))
})

const prefersReduced = useReducedMotion()
</script>

<template>
  <span v-if="prefersReduced" class="tabular-nums">{{ Math.trunc(value) }}</span>

  <span
    v-else
    class="inline-flex leading-none"
    :style="{ fontSize: `${fontSize}px`, gap: `${gap}px` }"
  >
    <HeroCounterDigit
      v-for="place in places"
      :key="place"
      :place="place"
      :value="value"
      :height="fontSize"
    />
  </span>
</template>
