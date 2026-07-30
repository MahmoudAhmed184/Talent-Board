import { readonly, ref } from 'vue'
import { http } from '../http'

export interface TaxonomyItem {
  id: number
  name: string
  slug: string
}

/**
 * Categories and locations, loaded once per session.
 *
 * The lists are small, seeded, and read by several components at once (the
 * filter panel, the active-filter chips, the employer job form). Module-level
 * state means opening the mobile filter drawer does not refetch what the
 * sidebar already has, and concurrent callers share one in-flight request
 * instead of issuing duplicates.
 */
const categories = ref<TaxonomyItem[]>([])
const locations = ref<TaxonomyItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

let inFlight: Promise<void> | null = null
let loaded = false

async function fetchTaxonomies(): Promise<void> {
  isLoading.value = true
  error.value = null

  try {
    const [categoryResponse, locationResponse] = await Promise.all([
      http.get<{ data: TaxonomyItem[] }>('/api/v1/categories'),
      http.get<{ data: TaxonomyItem[] }>('/api/v1/locations'),
    ])

    categories.value = categoryResponse.data.data
    locations.value = locationResponse.data.data
    loaded = true
  } catch {
    error.value = 'Categories and locations could not be loaded.'
    // `loaded` stays false so a later call retries, rather than serving empty
    // dropdowns for the rest of the session.
  } finally {
    isLoading.value = false
    inFlight = null
  }
}

export function useTaxonomies() {
  function loadTaxonomies(force = false): Promise<void> {
    if (loaded && !force) {
      return Promise.resolve()
    }

    inFlight ??= fetchTaxonomies()

    return inFlight
  }

  /** Resolves a taxonomy id to its display name, for filter chips and summaries. */
  function categoryName(id: number | null | undefined): string | null {
    return categories.value.find((item) => item.id === id)?.name ?? null
  }

  function locationName(id: number | null | undefined): string | null {
    return locations.value.find((item) => item.id === id)?.name ?? null
  }

  return {
    categories: readonly(categories),
    categoryName,
    error: readonly(error),
    isLoading: readonly(isLoading),
    loadTaxonomies,
    locationName,
    locations: readonly(locations),
  }
}
