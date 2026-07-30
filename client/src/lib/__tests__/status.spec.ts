import { describe, expect, it } from 'vitest'
import {
  APPLICATION_STATUSES,
  applicationStatus,
  hasExpired,
  isCancellable,
  isDecidable,
  jobDisplayStatus,
  jobStatus,
  JOB_STATUSES,
  workTypeLabel,
} from '../status'

/**
 * These mappings are the single source of truth for how backend state is
 * presented. A silent change here would make the same status read differently
 * in two places, which is exactly what centralising it was meant to prevent.
 */
describe('applicationStatus', () => {
  it('describes every status the API can return', () => {
    for (const status of APPLICATION_STATUSES) {
      const descriptor = applicationStatus(status)

      expect(descriptor.value).toBe(status)
      expect(descriptor.label.length).toBeGreaterThan(0)
      expect(descriptor.description.length).toBeGreaterThan(0)
      expect(descriptor.icon).toBeTruthy()
    }
  })

  it('never surfaces a raw enum string for an unrecognised status', () => {
    // A newer API adding a status must not leak "in_interview" into the UI.
    const descriptor = applicationStatus('in_interview')

    expect(descriptor.label).toBe('Unknown')
    expect(descriptor.tone).toBe('neutral')
  })

  it('phrases rejection from the candidate’s side', () => {
    expect(applicationStatus('rejected').label).toBe('Not selected')
  })

  it('pairs every status with a distinct label, so tone is never load-bearing', () => {
    const labels = APPLICATION_STATUSES.map((status) => applicationStatus(status).label)

    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe('cancellation and decision eligibility', () => {
  it.each(['submitted', 'under_review'])('allows a candidate to withdraw "%s"', (status) => {
    expect(isCancellable(status)).toBe(true)
  })

  it.each(['accepted', 'rejected', 'cancelled'])('blocks withdrawal of "%s"', (status) => {
    expect(isCancellable(status)).toBe(false)
  })

  it('lets an employer decide only on applications still in play', () => {
    expect(isDecidable('submitted')).toBe(true)
    expect(isDecidable('accepted')).toBe(false)
    expect(isDecidable('cancelled')).toBe(false)
  })
})

describe('jobStatus', () => {
  it('describes every stored moderation state', () => {
    for (const status of JOB_STATUSES) {
      expect(jobStatus(status).value).toBe(status)
    }
  })

  it('falls back for an unrecognised moderation state', () => {
    expect(jobStatus('archived').label).toBe('Unknown')
  })
})

describe('hasExpired', () => {
  const now = new Date('2026-07-29T12:00:00Z')

  it('treats a listing with no deadline as open', () => {
    expect(hasExpired(null, now)).toBe(false)
    expect(hasExpired(undefined, now)).toBe(false)
  })

  it('treats an unparseable deadline as open rather than silently closing it', () => {
    expect(hasExpired('not-a-date', now)).toBe(false)
  })

  it('detects a passed deadline', () => {
    expect(hasExpired('2026-07-28T12:00:00Z', now)).toBe(true)
    expect(hasExpired('2026-07-30T12:00:00Z', now)).toBe(false)
  })
})

describe('jobDisplayStatus', () => {
  const now = new Date('2026-07-29T12:00:00Z')

  it('shows an approved listing past its deadline as expired, not published', () => {
    const descriptor = jobDisplayStatus('approved', '2026-07-01T00:00:00Z', now)

    expect(descriptor.value).toBe('expired')
    expect(descriptor.label).toBe('Expired')
  })

  it('leaves an approved listing inside its deadline published', () => {
    expect(jobDisplayStatus('approved', '2026-08-30T00:00:00Z', now).value).toBe('approved')
  })

  it('does not derive expiry for listings that were never published', () => {
    // A pending listing with an old deadline is still pending — calling it
    // "expired" would hide it from the moderation queue's meaning.
    expect(jobDisplayStatus('pending', '2026-07-01T00:00:00Z', now).value).toBe('pending')
    expect(jobDisplayStatus('rejected', '2026-07-01T00:00:00Z', now).value).toBe('rejected')
  })
})

describe('taxonomy labels', () => {
  it('renders the API values as human labels', () => {
    expect(workTypeLabel('on-site')).toBe('On-site')
    expect(workTypeLabel('remote')).toBe('Remote')
  })

  it('passes through an unknown value rather than showing nothing', () => {
    expect(workTypeLabel('flexible')).toBe('flexible')
    expect(workTypeLabel(null)).toBe('Not specified')
  })
})
