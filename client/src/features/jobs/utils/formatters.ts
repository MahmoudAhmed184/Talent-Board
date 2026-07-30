/**
 * Shared formatting utilities for job listing display.
 *
 * Every user-facing string derived from a raw API value goes through here, so
 * a salary or a date reads identically on a card, a detail page, and a table.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'currency',
  currency: 'USD',
})

/**
 * Compact form for cards and pills, where a seven-figure range would otherwise
 * wrap or force horizontal overflow: "$120K – $1.2M".
 */
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

/**
 * Convert snake_case or kebab-case strings to Sentence Case.
 * Returns "Not specified" for nullish/empty values.
 */
export function sentenceCase(value?: string | null): string {
  if (!value) return 'Not specified'
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

/**
 * Build a human-readable salary range label.
 *
 * "Not disclosed" rather than "Salary not listed": an absent range is the
 * employer's choice, and candidates read the difference.
 */
export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  compact = false,
): string {
  const format = (value: number) =>
    compact ? compactCurrencyFormatter.format(value) : currencyFormatter.format(value)

  if (min && max) return `${format(min)} – ${format(max)}`
  if (min) return `From ${format(min)}`
  if (max) return `Up to ${format(max)}`
  return 'Not disclosed'
}

/**
 * Truncate a description to a card-friendly snippet.
 */
export function descriptionSnippet(text?: string | null, maxLength = 200): string {
  const cleaned = text?.replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'Open role with details available on the listing page.'
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}…` : cleaned
}

/**
 * Format an ISO date string to a short human-readable label.
 */
export function formatDate(value?: string | null): string {
  if (!value) return 'Not specified'

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Not specified' : dateFormatter.format(date)
}

/** Posting date, with a softer fallback suited to job cards. */
export function formatPostedDate(value?: string | null): string {
  if (!value) return 'Posted recently'

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Posted recently' : dateFormatter.format(date)
}

/**
 * "3 days ago", "in 2 weeks". Falls back to an absolute date beyond a month,
 * where relative phrasing stops being useful.
 */
export function formatRelative(value?: string | null, now = new Date()): string {
  if (!value) return 'Unknown'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / 86_400_000)

  if (Math.abs(diffDays) > 30) return formatDate(value)
  if (Math.abs(diffDays) >= 1) return relativeFormatter.format(diffDays, 'day')

  const diffHours = Math.round(diffMs / 3_600_000)
  if (Math.abs(diffHours) >= 1) return relativeFormatter.format(diffHours, 'hour')

  return relativeFormatter.format(Math.round(diffMs / 60_000), 'minute')
}

export interface DeadlineLabel {
  label: string
  /** True within a week of closing, so callers can raise the visual weight. */
  urgent: boolean
  passed: boolean
}

/**
 * Deadline phrasing for a listing.
 *
 * Returns `urgent` so callers do not re-derive the date maths, and so
 * "closes tomorrow" is never styled the same as "closes in three months".
 */
export function formatDeadline(value?: string | null, now = new Date()): DeadlineLabel {
  if (!value) {
    return { label: 'No deadline', urgent: false, passed: false }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { label: 'No deadline', urgent: false, passed: false }
  }

  // Whether the deadline has passed is a question about the instant.
  if (date.getTime() < now.getTime()) {
    return { label: `Closed ${formatDate(value)}`, urgent: false, passed: true }
  }

  /*
   * How it is *described* is a question about the calendar. Measuring elapsed
   * milliseconds would call a deadline eleven hours away "tomorrow" even when
   * it falls later the same day — the kind of wording that makes someone miss
   * it. Local days are used to match the date rendered by `formatDate`.
   */
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000)

  if (diffDays === 0) return { label: 'Closes today', urgent: true, passed: false }
  if (diffDays === 1) return { label: 'Closes tomorrow', urgent: true, passed: false }
  if (diffDays <= 7) return { label: `Closes in ${diffDays} days`, urgent: true, passed: false }

  return { label: `Closes ${formatDate(value)}`, urgent: false, passed: false }
}

/** Local midnight, so day comparisons ignore the time of day. */
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Human-readable file size for resume and logo metadata. */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes < 0) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
