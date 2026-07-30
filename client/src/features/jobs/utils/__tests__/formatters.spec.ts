import { describe, expect, it } from 'vitest'
import {
  descriptionSnippet,
  formatDate,
  formatDeadline,
  formatFileSize,
  formatSalaryRange,
  sentenceCase,
} from '../formatters'

describe('formatSalaryRange', () => {
  it('formats a full range', () => {
    expect(formatSalaryRange(60000, 90000)).toBe('$60,000 – $90,000')
  })

  it('formats open-ended ranges', () => {
    expect(formatSalaryRange(60000, null)).toBe('From $60,000')
    expect(formatSalaryRange(null, 90000)).toBe('Up to $90,000')
  })

  it('says the salary was not disclosed rather than implying missing data', () => {
    expect(formatSalaryRange(null, null)).toBe('Not disclosed')
    expect(formatSalaryRange(0, 0)).toBe('Not disclosed')
  })

  it('keeps very large figures short in compact mode, so cards cannot overflow', () => {
    const compact = formatSalaryRange(120000, 1200000, true)

    expect(compact).toBe('$120K – $1.2M')
    expect(compact.length).toBeLessThan(formatSalaryRange(120000, 1200000).length)
  })
})

describe('formatDeadline', () => {
  /*
   * Deadline wording is described in *calendar* days, which are local to the
   * reader. These helpers build local instants so the expectations hold in any
   * timezone the suite happens to run in — writing them as UTC literals makes
   * the tests pass only near Greenwich.
   */
  const at = (day: number, hour: number) => new Date(2026, 6, day, hour, 0, 0)
  const iso = (day: number, hour: number) => at(day, hour).toISOString()
  const now = at(29, 12)

  it('marks a listing with no deadline as open, not urgent', () => {
    expect(formatDeadline(null, now)).toEqual({
      label: 'No deadline',
      urgent: false,
      passed: false,
    })
  })

  it('describes a later hour on the same day as closing today, not tomorrow', () => {
    expect(formatDeadline(iso(29, 23), now)).toMatchObject({
      label: 'Closes today',
      urgent: true,
      passed: false,
    })
  })

  it('flags deadlines within a week as urgent', () => {
    expect(formatDeadline(iso(30, 13), now)).toMatchObject({
      label: 'Closes tomorrow',
      urgent: true,
    })
    expect(formatDeadline(iso(31, 9), now)).toMatchObject({
      label: 'Closes in 2 days',
      urgent: true,
    })
  })

  it('does not shout about distant deadlines', () => {
    expect(formatDeadline(new Date(2026, 11, 1, 12).toISOString(), now)).toMatchObject({
      urgent: false,
      passed: false,
    })
  })

  it('reports a passed deadline without marking it urgent', () => {
    expect(formatDeadline(iso(1, 12), now)).toMatchObject({
      urgent: false,
      passed: true,
    })
  })

  it('treats an earlier hour on the current day as closed, not "closes today"', () => {
    expect(formatDeadline(iso(29, 9), now)).toMatchObject({ passed: true })
  })

  it('treats an unparseable date as no deadline rather than crashing', () => {
    expect(formatDeadline('garbage', now).label).toBe('No deadline')
  })
})

describe('formatDate', () => {
  it('degrades gracefully on invalid input', () => {
    expect(formatDate('not-a-date')).toBe('Not specified')
    expect(formatDate(null)).toBe('Not specified')
  })
})

describe('descriptionSnippet', () => {
  it('collapses whitespace and truncates long text', () => {
    const snippet = descriptionSnippet(`a${' '.repeat(5)}b`.repeat(200), 50)

    expect(snippet).toHaveLength(51) // 50 characters plus the ellipsis
    expect(snippet.endsWith('…')).toBe(true)
    expect(snippet).not.toContain('  ')
  })

  it('offers a useful line when a listing has no description', () => {
    expect(descriptionSnippet('')).toContain('details available')
    expect(descriptionSnippet(null)).toContain('details available')
  })
})

describe('formatFileSize', () => {
  it('scales units', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('handles missing metadata', () => {
    expect(formatFileSize(null)).toBe('Unknown size')
    expect(formatFileSize(0)).toBe('Unknown size')
  })
})

describe('sentenceCase', () => {
  it('humanises snake and kebab case', () => {
    expect(sentenceCase('under_review')).toBe('Under Review')
    expect(sentenceCase('on-site')).toBe('On Site')
  })

  it('has a fallback for empty values', () => {
    expect(sentenceCase(null)).toBe('Not specified')
  })
})
