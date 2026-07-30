/**
 * Talent Board motion system.
 *
 * Durations and easings here mirror the CSS custom properties in
 * `src/design/tokens.css`; `__tests__/tokens.spec.ts` fails if they drift.
 *
 * Rules this module exists to enforce:
 *  - No component invents its own duration, easing, or transform distance.
 *  - Motion only ever uses `opacity` and `transform`, never layout properties.
 *  - Every variant has a reduced-motion counterpart that changes opacity only.
 *
 * See docs/motion-guidelines.md.
 */
import { computed, type ComputedRef } from 'vue'
import { useReducedMotion, type VariantType } from 'motion-v'

/** Milliseconds — matches `--duration-*` in tokens.css. */
export const durationMs = {
  /** Press feedback, colour and icon swaps. */
  instant: 110,
  /** Hover and focus transitions on small controls. */
  control: 165,
  /** A component entering or leaving the page. */
  element: 220,
  /** Dialogs, drawers, page-level transitions. */
  panel: 320,
  /** Gap between items in a staggered list. */
  stagger: 38,
} as const

export type DurationToken = keyof typeof durationMs

/** Seconds — the unit motion-v expects. */
export const duration = {
  instant: durationMs.instant / 1000,
  control: durationMs.control / 1000,
  element: durationMs.element / 1000,
  panel: durationMs.panel / 1000,
  stagger: durationMs.stagger / 1000,
} as const

/** Cubic-bezier control points — matches `--ease-*` in tokens.css. */
export const easing = {
  /** Decelerating. Anything arriving on screen. */
  entrance: [0.22, 1, 0.36, 1],
  /** Accelerating. Anything leaving — always quicker than its entrance. */
  exit: [0.4, 0, 1, 1],
  /** Symmetric. State changes that neither arrive nor leave. */
  standard: [0.4, 0, 0.2, 1],
} as const satisfies Record<string, [number, number, number, number]>

/** Restrained springs. Used only where a surface is dragged or shares layout. */
export const spring = {
  panel: { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 },
  chip: { type: 'spring', stiffness: 460, damping: 30, mass: 0.6 },
} as const

/** The only vertical travel distances in the system, in pixels. */
export const travel = {
  /** Cards, list rows, toasts. */
  sm: 8,
  /** Panels and page sections. */
  md: 16,
} as const

export const transition = {
  instant: { duration: duration.instant, ease: easing.standard },
  control: { duration: duration.control, ease: easing.standard },
  enter: { duration: duration.element, ease: easing.entrance },
  exit: { duration: duration.control, ease: easing.exit },
  panelEnter: { duration: duration.panel, ease: easing.entrance },
  panelExit: { duration: duration.element, ease: easing.exit },
} as const

/**
 * The three variant slots motion-v reads off a component.
 *
 * Typed with motion-v's own `VariantType` rather than a loose record, so a
 * malformed variant fails at the definition instead of at every `v-bind`.
 */
export interface MotionVariants {
  initial: VariantType
  animate: VariantType
  exit?: VariantType
}

/**
 * A pair of motion-v variant objects: the expressive version and the
 * opacity-only version served to reduced-motion users.
 */
export interface MotionVariantPair {
  readonly full: MotionVariants
  readonly reduced: MotionVariants
}

const fadeOnly: MotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.instant } },
  exit: { opacity: 0, transition: { duration: duration.instant } },
}

/** Content arriving in place — page sections, search results, cards. */
export const fadeRise: MotionVariantPair = {
  full: {
    initial: { opacity: 0, y: travel.sm },
    animate: { opacity: 1, y: 0, transition: transition.enter },
    exit: { opacity: 0, y: -travel.sm / 2, transition: transition.exit },
  },
  reduced: fadeOnly,
}

/** Route-level transitions. Deliberately shallow so content is never withheld. */
export const pageTransition: MotionVariantPair = {
  full: {
    initial: { opacity: 0, y: travel.md },
    animate: { opacity: 1, y: 0, transition: transition.panelEnter },
    exit: { opacity: 0, transition: transition.exit },
  },
  reduced: fadeOnly,
}

/** Dialogs and confirmation surfaces. */
export const dialogTransition: MotionVariantPair = {
  full: {
    initial: { opacity: 0, scale: 0.97, y: travel.sm },
    animate: { opacity: 1, scale: 1, y: 0, transition: transition.panelEnter },
    exit: { opacity: 0, scale: 0.98, transition: transition.panelExit },
  },
  reduced: fadeOnly,
}

/** Backdrops behind dialogs and drawers. */
export const backdropTransition: MotionVariantPair = {
  full: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transition.control },
    exit: { opacity: 0, transition: transition.exit },
  },
  reduced: fadeOnly,
}

/** Popovers, dropdown menus, tooltips — anchored to a trigger. */
export const popoverTransition: MotionVariantPair = {
  full: {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: transition.control },
    exit: { opacity: 0, scale: 0.98, transition: { duration: duration.instant, ease: easing.exit } },
  },
  reduced: fadeOnly,
}

/** Filter chips and other small elements that pop in and out of a row. */
export const chipTransition: MotionVariantPair = {
  full: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1, transition: spring.chip },
    exit: { opacity: 0, scale: 0.85, transition: { duration: duration.instant, ease: easing.exit } },
  },
  reduced: fadeOnly,
}

/** Expand/collapse sections. Height is animated only here, where it is the point. */
export const collapseTransition: MotionVariantPair = {
  full: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: transition.enter },
    exit: { opacity: 0, height: 0, transition: transition.exit },
  },
  reduced: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1, transition: { duration: 0 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0 } },
  },
}

/** Drawers and sheets sliding in from an edge. */
export function sheetTransition(side: 'left' | 'right' | 'bottom'): MotionVariantPair {
  const offscreen =
    side === 'bottom' ? { y: '100%' } : { x: side === 'left' ? '-100%' : '100%' }

  return {
    full: {
      initial: offscreen,
      animate: { x: 0, y: 0, transition: spring.panel },
      exit: { ...offscreen, transition: transition.panelExit },
    },
    reduced: fadeOnly,
  }
}

/**
 * Stagger delay for the nth item in a list.
 *
 * Capped so that a full page of results never makes the last card wait: with a
 * 38ms gap the twelfth card already starts at ~418ms, which is the limit of
 * what still reads as "the list arrived" rather than "the list is loading".
 */
export function staggerDelay(index: number, maxItems = 12): number {
  return Math.min(index, maxItems) * duration.stagger
}

/**
 * Resolves variants against the user's motion preference.
 *
 * Prefer this over reading `useReducedMotion()` directly so that the
 * opacity-only fallback stays consistent across the app.
 */
export function useMotionPreset(pair: MotionVariantPair): ComputedRef<MotionVariants> {
  const prefersReduced = useReducedMotion()

  return computed(() => (prefersReduced.value ? pair.reduced : pair.full))
}

/**
 * Stagger delay that collapses to zero for reduced-motion users, so lists
 * appear at once instead of trickling in.
 */
export function useStagger(maxItems = 12) {
  const prefersReduced = useReducedMotion()

  return computed(() => (index: number) => (prefersReduced.value ? 0 : staggerDelay(index, maxItems)))
}

/**
 * Per-item variants for a staggered list.
 *
 * Returns a factory so a `v-for` can bind `v-bind="itemMotion(index)"` in one
 * expression. The delay is merged *into* the animate variant's own transition:
 * a sibling `:transition` prop would be shadowed by it and silently ignored.
 */
export function useStaggeredPreset(
  pair: MotionVariantPair,
  maxItems = 12,
): ComputedRef<(index: number) => MotionVariants> {
  const preset = useMotionPreset(pair)
  const delayFor = useStagger(maxItems)

  return computed(() => (index: number) => {
    const variants = preset.value
    const delay = delayFor.value(index)

    if (delay === 0) {
      return variants
    }

    return {
      ...variants,
      animate: {
        ...variants.animate,
        transition: { ...variants.animate.transition, delay },
      },
    }
  })
}

export { useReducedMotion }
