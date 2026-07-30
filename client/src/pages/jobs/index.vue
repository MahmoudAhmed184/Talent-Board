<script setup lang="ts">
/**
 * Public job discovery — the closest descendant of the reference direction.
 *
 * Guests can search and filter freely; applying requires a candidate account,
 * so no apply control is offered here. The heavy lifting lives in
 * `JobDiscovery`, shared with the candidate-side search.
 */
import { UiPageHeader } from '@/components/ui'
import JobDiscovery from '@/features/jobs/components/JobDiscovery.vue'
</script>

<template>
  <div class="mx-auto grid max-w-[var(--size-content-max)] gap-6 px-4 py-8 sm:px-6">
    <UiPageHeader
      eyebrow="Open roles"
      title="Find your next role"
      description="Every listing here has been reviewed and approved before publication."
    />

    <JobDiscovery />
  </div>
</template>
