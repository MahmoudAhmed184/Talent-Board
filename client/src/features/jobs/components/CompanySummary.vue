<script setup lang="ts">
/**
 * Employer identity block: logo, company name, optional description.
 *
 * `variant="inline"` is the single-line form used inside job cards;
 * `variant="panel"` is the block used on detail pages.
 */
import { UiCompanyLogo } from '@/components/ui'

const {
  logoUrl,
  name,
  summary,
  variant = 'inline',
} = defineProps<{
  logoUrl?: string | null
  name?: string | null
  summary?: string | null
  variant?: 'inline' | 'panel'
}>()
</script>

<template>
  <div
    v-if="variant === 'inline'"
    class="flex min-w-0 items-center gap-2.5"
  >
    <UiCompanyLogo :name="name" :src="logoUrl" size="sm" />
    <span class="min-w-0 truncate text-support font-medium text-text-secondary">
      {{ name || 'Hiring company' }}
    </span>
  </div>

  <div v-else class="rounded-card border border-border bg-surface p-5">
    <div class="flex items-start gap-4">
      <UiCompanyLogo :name="name" :src="logoUrl" size="lg" />

      <div class="min-w-0">
        <h3 class="text-card-title text-text-primary">{{ name || 'Hiring company' }}</h3>
        <p v-if="summary" class="mt-2 text-support leading-6 text-text-secondary">
          {{ summary }}
        </p>
        <p v-else class="mt-2 text-support text-text-muted">
          This employer has not added a company description yet.
        </p>
      </div>
    </div>
  </div>
</template>
