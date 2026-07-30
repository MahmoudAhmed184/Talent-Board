/**
 * Tone → Tailwind class mappings.
 *
 * Kept here rather than inside each component so a status badge, an inline
 * alert, and a stat card all render the same tone identically.
 */
import type { Tone } from './status'

/** Filled-surface treatment. Used by badges and inline alerts. */
export const TONE_SURFACE: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-text-secondary border-border',
  accent: 'bg-brand-100 text-brand-900 border-brand-200',
  info: 'bg-info-bg text-info-fg border-info-border',
  success: 'bg-success-bg text-success-fg border-success-border',
  warning: 'bg-warning-bg text-warning-fg border-warning-border',
  danger: 'bg-danger-bg text-danger-fg border-danger-border',
}

/** Foreground-only treatment. Used for icons and emphasis inside neutral cards. */
export const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-text-muted',
  accent: 'text-accent',
  info: 'text-info-fg',
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
}

/** A 2px rail, used by timelines and left-accented panels. */
export const TONE_RAIL: Record<Tone, string> = {
  neutral: 'bg-border-strong',
  accent: 'bg-brand-600',
  info: 'bg-info-fg',
  success: 'bg-success-fg',
  warning: 'bg-warning-fg',
  danger: 'bg-danger-fg',
}

/**
 * Decorative pastel surfaces for job cards.
 *
 * These carry no meaning. The index is derived from a job id so that the same
 * listing keeps the same colour between renders, and text on them is always
 * ink-950 (>= 15:1 on every pastel in the set).
 */
export const PASTEL_SURFACES = [
  'bg-pastel-sky',
  'bg-pastel-mint',
  'bg-pastel-peach',
  'bg-pastel-lilac',
  'bg-pastel-rose',
  'bg-pastel-neutral',
] as const

export function pastelForId(id: number | string): string {
  const numeric = typeof id === 'number' ? id : Number.parseInt(String(id), 10)
  const safe = Number.isFinite(numeric) ? Math.abs(numeric) : 0

  return PASTEL_SURFACES[safe % PASTEL_SURFACES.length]
}
