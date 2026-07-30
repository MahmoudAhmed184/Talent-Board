import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { durationMs, easing } from '../motion'

// Read from disk rather than importing: the Tailwind Vite plugin claims `.css`
// modules, so even a `?raw` import comes back empty inside Vitest. `import.meta.url`
// is an http URL under the jsdom environment, so resolve from the project root.
const tokensCss = readFileSync(
  resolve(process.cwd(), 'src/design/tokens.css'),
  'utf8',
)

/**
 * The CSS and JavaScript halves of the motion system are written twice — once
 * as custom properties for CSS transitions, once as constants for motion-v.
 * These tests exist so the duplication can never silently drift.
 */
function cssValue(name: string): string | null {
  const match = tokensCss.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm'))

  return match ? match[1].trim() : null
}

describe('motion tokens', () => {
  it.each(Object.entries(durationMs))(
    'duration "%s" matches --duration-%s in tokens.css',
    (token, ms) => {
      expect(cssValue(`--duration-${token}`)).toBe(`${ms}ms`)
    },
  )

  it.each(Object.entries(easing))(
    'easing "%s" matches --ease-%s in tokens.css',
    (token, points) => {
      expect(cssValue(`--ease-${token}`)).toBe(`cubic-bezier(${points.join(', ')})`)
    },
  )
})

describe('colour tokens', () => {
  it('defines every semantic alias the components rely on', () => {
    const required = [
      '--color-canvas',
      '--color-surface',
      '--color-surface-subtle',
      '--color-surface-inverse',
      '--color-border',
      '--color-border-strong',
      '--color-text-primary',
      '--color-text-muted',
      '--color-text-inverse',
      '--color-accent',
      '--color-focus-ring',
    ]

    for (const token of required) {
      expect(cssValue(token), `${token} is missing from tokens.css`).not.toBeNull()
    }
  })

  it('keeps the accent at brand-700, which is the shade that clears AA on white', () => {
    // brand-600 is only 3.38:1 against the surface — large text and borders
    // only. Downgrading the accent would silently break body-copy contrast.
    expect(cssValue('--color-accent')).toBe('var(--color-brand-700)')
    expect(cssValue('--color-brand-700')).toBe('#0877a8')
  })
})
