import { readonly, ref } from 'vue'
import { http } from '../http'

export interface PlatformStats {
  open_roles: number
  recruiters: number
  candidates: number
}

/**
 * Headline counts for the landing hero.
 *
 * Module-level state, like `useTaxonomies`: the figures are the same for every
 * visitor and change slowly (the API caches them for five minutes), so a
 * second component mounting must not mean a second request.
 *
 * A failure is silent by design. These numbers decorate the hero; if they do
 * not arrive the counters stay at zero and are hidden, rather than putting an
 * error on the first thing a visitor sees.
 */
const stats = ref<PlatformStats>({ open_roles: 0, recruiters: 0, candidates: 0 })
const isLoaded = ref(false)

let inFlight: Promise<void> | null = null

async function fetchStats(): Promise<void> {
  try {
    const response = await http.get<{ data: PlatformStats }>('/api/v1/stats')

    stats.value = response.data.data
    isLoaded.value = true
  } catch {
    // Leaves the counters at zero; `isLoaded` stays false so a later mount retries.
  } finally {
    inFlight = null
  }
}

export function usePlatformStats() {
  function load(): Promise<void> {
    if (isLoaded.value) {
      return Promise.resolve()
    }

    inFlight ??= fetchStats()

    return inFlight
  }

  return {
    stats: readonly(stats),
    isLoaded: readonly(isLoaded),
    load,
  }
}
