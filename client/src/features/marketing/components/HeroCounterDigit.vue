<script setup lang="ts">
/**
 * One wheel of the odometer counter. See `HeroCounter.vue` for the whole.
 *
 * All ten digits are stacked in the same box and each is offset by a spring so
 * that the one matching this place value sits at rest in the window. Offsets
 * greater than half a turn are rewound the other way, so a 9→0 carry rolls
 * forward one step instead of spinning back through eight digits.
 */
import { computed, onMounted, watch } from 'vue'
import { motion, useSpring, useTransform } from 'motion-v'

const { height, place, value } = defineProps<{
  /** Height of the digit window in pixels. One digit's travel per step. */
  height: number
  /** This wheel's place value: 1, 10, 100 … */
  place: number
  value: number
}>()

/**
 * Not reduced modulo ten: the wheel is driven by the whole count above this
 * place, which is what carries the tens digit over when the units wrap.
 */
const target = computed(() => Math.floor(value / place))

/*
 * A counter roll is its own kind of motion — it has no arrival state the user
 * is waiting on — so it sits outside the system's transition presets. Damped
 * hard enough not to overshoot into the neighbouring digit.
 */
const animated = useSpring(0, { stiffness: 90, damping: 22, mass: 1 })

/*
 * Starts at zero and is driven to the real figure on mount. The counts arrive
 * from the API before this component renders, so seeding the spring with the
 * final value would leave the wheels standing still — the roll is the whole
 * point of showing a counter rather than a number.
 */
onMounted(() => animated.set(target.value))

watch(target, (next) => animated.set(next))

const digits = Array.from({ length: 10 }, (_, digit) =>
  useTransform(animated, (latest: number) => {
    const placeValue = latest % 10
    const offset = (10 + digit - placeValue) % 10

    return offset > 5 ? (offset - 10) * height : offset * height
  }),
)
</script>

<template>
  <span
    class="relative inline-block w-[1ch] overflow-hidden tabular-nums"
    :style="{ height: `${height}px` }"
  >
    <motion.span
      v-for="(y, digit) in digits"
      :key="digit"
      class="absolute inset-0 flex items-center justify-center"
      :style="{ y }"
    >
      {{ digit }}
    </motion.span>
  </span>
</template>
