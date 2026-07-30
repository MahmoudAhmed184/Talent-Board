<route lang="json">
{
  "meta": {
    "layout": "standalone"
  }
}
</route>

<script setup lang="ts">
/**
 * Design-system showcase. Development only.
 *
 * `vite.config.ts` excludes `src/pages/dev/**` from production builds, so this
 * route does not exist in a deployed bundle — it is not merely hidden from
 * navigation.
 *
 * Every example below renders the real component. Nothing here is a static
 * mock, so a regression in a primitive shows up on this page.
 */
import { ref } from 'vue'
import { Inbox, Rocket, Sparkles } from 'lucide-vue-next'
import { motion } from 'motion-v'
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiCard,
  UiCheckbox,
  UiConfirmationDialog,
  UiDialog,
  UiEmptyState,
  UiErrorState,
  UiInput,
  UiPopover,
  UiProgress,
  UiRadioGroup,
  UiSearchInput,
  UiSectionHeader,
  UiSelect,
  UiSkeleton,
  UiSpinner,
  UiStatCard,
  UiStatusBadge,
  UiSwitch,
  UiTabs,
  UiTagInput,
  UiTextarea,
  UiTooltip,
} from '@/components/ui'
import { APPLICATION_STATUSES, applicationStatus, JOB_STATUSES, jobStatus } from '@/lib/status'
import { PASTEL_SURFACES } from '@/lib/tone'
import { durationMs, easing, fadeRise, useStaggeredPreset } from '@/design/motion'

const dialogOpen = ref(false)
const confirmOpen = ref(false)
const popoverOpen = ref(false)
const tab = ref('one')
const text = ref('')
const search = ref('')
const area = ref('')
const select = ref<string | number | null>(null)
const checked = ref(true)
const switched = ref(true)
const radio = ref<string | number | null>('a')
const tags = ref(['Vue', 'TypeScript'])

const staggered = useStaggeredPreset(fadeRise)

const colorGroups = [
  {
    name: 'Neutrals',
    swatches: ['bg-canvas', 'bg-surface', 'bg-surface-subtle', 'bg-surface-sunken', 'bg-border', 'bg-border-strong', 'bg-ink-800', 'bg-ink-950'],
  },
  {
    name: 'Brand',
    swatches: ['bg-brand-50', 'bg-brand-100', 'bg-brand-200', 'bg-brand-400', 'bg-brand-600', 'bg-brand-700', 'bg-brand-800', 'bg-brand-900'],
  },
  { name: 'Decorative pastels (never status)', swatches: [...PASTEL_SURFACES] },
  {
    name: 'Semantic',
    swatches: ['bg-success-bg', 'bg-success-fg', 'bg-warning-bg', 'bg-warning-fg', 'bg-danger-bg', 'bg-danger-fg', 'bg-info-bg', 'bg-info-fg'],
  },
]

const typeScale = [
  { token: 'text-display', label: 'Display' },
  { token: 'text-page-title', label: 'Page title' },
  { token: 'text-section-title', label: 'Section title' },
  { token: 'text-card-title', label: 'Card title' },
  { token: 'text-body', label: 'Body' },
  { token: 'text-support', label: 'Supporting' },
  { token: 'text-meta', label: 'Metadata' },
]

const buttonVariants = ['primary', 'secondary', 'subtle', 'ghost', 'danger', 'danger-ghost'] as const
const radii = ['rounded-control', 'rounded-field', 'rounded-card', 'rounded-panel', 'rounded-shell'] as const
const shadows = ['shadow-raised', 'shadow-card-hover', 'shadow-popover', 'shadow-overlay'] as const
</script>

<template>
  <div class="min-h-svh bg-canvas">
    <header class="border-b border-border bg-surface-inverse">
      <div class="mx-auto max-w-[var(--size-content-max)] px-4 py-8 sm:px-6">
        <p class="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-brand-400">
          <Sparkles class="size-3.5" aria-hidden="true" />
          Development only
        </p>
        <h1 class="mt-2 text-page-title text-text-inverse">Design system showcase</h1>
        <p class="mt-2 max-w-2xl text-support text-text-inverse-muted">
          Live rendering of every token and primitive. Excluded from production
          builds by the router configuration.
        </p>
      </div>
    </header>

    <!--
      `[&>*]:min-w-0`: grid items default to `min-width: auto`, so a wide child
      (the swatch and radius rows) stops the column shrinking and pushes the
      page sideways on narrow screens.
    -->
    <main
      class="mx-auto grid max-w-[var(--size-content-max)] gap-10 px-4 py-10 sm:px-6 [&>*]:min-w-0"
    >
      <!-- Colour -->
      <section aria-labelledby="colour-heading">
        <UiSectionHeader title="Colour" description="Semantic aliases resolve to the primitive ramps." />
        <div class="mt-4 grid gap-5">
          <div v-for="group in colorGroups" :key="group.name">
            <h3 class="text-support font-semibold text-text-secondary">{{ group.name }}</h3>
            <ul class="mt-2 flex flex-wrap gap-2">
              <li v-for="swatch in group.swatches" :key="swatch" class="w-28 sm:w-32">
                <div class="h-12 rounded-field border border-border" :class="swatch" />
                <p class="mt-1 truncate text-[0.6875rem] text-text-muted">{{ swatch }}</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Typography -->
      <section aria-labelledby="type-heading">
        <UiSectionHeader title="Typography" description="Fluid where it earns it, fixed where predictability matters." />
        <UiCard class="mt-4">
          <ul class="grid gap-4">
            <li v-for="item in typeScale" :key="item.token">
              <p class="text-meta text-text-muted">{{ item.token }}</p>
              <p :class="item.token">{{ item.label }} — Senior Vue Engineer</p>
            </li>
          </ul>
        </UiCard>
      </section>

      <!-- Shape and elevation -->
      <section aria-labelledby="shape-heading">
        <UiSectionHeader title="Shape and elevation" />
        <div class="mt-4 grid gap-6 sm:grid-cols-2">
          <UiCard>
            <h3 class="text-support font-semibold text-text-secondary">Radius</h3>
            <ul class="mt-3 flex flex-wrap gap-3">
              <li v-for="radius in radii" :key="radius" class="text-center">
                <div class="size-16 border border-border bg-surface-sunken" :class="radius" />
                <p class="mt-1 text-[0.6875rem] text-text-muted">{{ radius }}</p>
              </li>
            </ul>
          </UiCard>

          <UiCard>
            <h3 class="text-support font-semibold text-text-secondary">Elevation</h3>
            <ul class="mt-3 flex flex-wrap gap-4">
              <li v-for="shadow in shadows" :key="shadow" class="text-center">
                <div class="size-16 rounded-card bg-surface" :class="shadow" />
                <p class="mt-1 text-[0.6875rem] text-text-muted">{{ shadow }}</p>
              </li>
            </ul>
          </UiCard>
        </div>
      </section>

      <!-- Buttons -->
      <section aria-labelledby="buttons-heading">
        <UiSectionHeader title="Buttons" description="Sizes, variants, loading, and disabled." />
        <UiCard class="mt-4">
          <div class="grid gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <UiButton v-for="variant in buttonVariants" :key="variant" :variant="variant">
                {{ variant }}
              </UiButton>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <UiButton size="sm">Small</UiButton>
              <UiButton size="md">Medium</UiButton>
              <UiButton size="lg">Large</UiButton>
              <UiButton loading>Loading</UiButton>
              <UiButton disabled>Disabled</UiButton>
              <UiButton to="/jobs" variant="secondary">As a link</UiButton>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- Form controls -->
      <section aria-labelledby="forms-heading">
        <UiSectionHeader title="Form controls" description="Every control is labelled and describes its own errors." />
        <UiCard class="mt-4">
          <div class="grid gap-6 md:grid-cols-2">
            <UiInput v-model="text" label="Job title" hint="Shown to candidates." required />
            <UiInput
              v-model="text"
              label="With an error"
              error="This field is required."
            />
            <UiSearchInput v-model="search" label="Search" placeholder="Search jobs" />
            <UiSelect
              v-model="select"
              label="Category"
              placeholder="All categories"
              :options="[
                { value: 1, label: 'Engineering' },
                { value: 2, label: 'Design' },
              ]"
            />
            <div class="md:col-span-2">
              <UiTextarea v-model="area" label="Description" :maxlength="200" show-count :rows="4" />
            </div>
            <div class="md:col-span-2">
              <UiTagInput v-model="tags" label="Skills" />
            </div>
            <UiCheckbox v-model="checked" label="Remote friendly" description="Candidates can work from anywhere." />
            <UiSwitch v-model="switched" label="Live updates" description="Applies immediately." />
            <div class="md:col-span-2">
              <UiRadioGroup
                v-model="radio"
                legend="Which resume should we send?"
                :columns="2"
                :options="[
                  { value: 'a', label: 'resume-2024.pdf', description: '182 KB' },
                  { value: 'b', label: 'cv-long-form.docx', description: '240 KB' },
                ]"
              />
            </div>
          </div>
        </UiCard>
      </section>

      <!-- Statuses -->
      <section aria-labelledby="status-heading">
        <UiSectionHeader
          title="Statuses"
          description="Tone always travels with a distinct label and icon, so meaning survives greyscale."
        />
        <UiCard class="mt-4">
          <div class="grid gap-5">
            <div>
              <h3 class="text-support font-semibold text-text-secondary">Application</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <UiStatusBadge
                  v-for="status in APPLICATION_STATUSES"
                  :key="status"
                  :status="applicationStatus(status)"
                />
              </div>
            </div>
            <div>
              <h3 class="text-support font-semibold text-text-secondary">Job moderation</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <UiStatusBadge v-for="status in JOB_STATUSES" :key="status" :status="jobStatus(status)" />
                <UiStatusBadge :status="jobStatus('expired')" />
              </div>
            </div>
            <div>
              <h3 class="text-support font-semibold text-text-secondary">Badges</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <UiBadge tone="neutral">Neutral</UiBadge>
                <UiBadge tone="accent">Accent</UiBadge>
                <UiBadge tone="info">Info</UiBadge>
                <UiBadge tone="success">Success</UiBadge>
                <UiBadge tone="warning">Warning</UiBadge>
                <UiBadge tone="danger">Danger</UiBadge>
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <!-- Feedback -->
      <section aria-labelledby="feedback-heading">
        <UiSectionHeader title="Feedback and states" />
        <div class="mt-4 grid gap-4">
          <UiAlert tone="info" title="Listings are reviewed before publication">
            Your listing shows as pending until an administrator approves it.
          </UiAlert>
          <UiAlert tone="danger" title="Your application was not submitted">
            Choose which resume to send.
          </UiAlert>

          <div class="grid gap-4 md:grid-cols-2">
            <UiEmptyState :icon="Inbox" title="No applications yet" description="They will appear here.">
              <UiButton size="sm">Browse jobs</UiButton>
            </UiEmptyState>
            <UiErrorState title="Jobs could not be loaded" description="The problem is usually temporary." />
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <UiStatCard label="Applications" :value="128" :icon="Rocket" tone="info" />
            <UiStatCard label="Loading" value="0" loading />
            <UiCard><UiProgress :value="62" label="Uploading resume" /></UiCard>
          </div>

          <UiCard>
            <div class="flex flex-wrap items-center gap-6">
              <UiSpinner />
              <UiSkeleton class="h-10 w-40" />
              <UiTooltip text="Repeats what is already visible.">
                <UiButton variant="secondary" size="sm">Hover or focus me</UiButton>
              </UiTooltip>
            </div>
          </UiCard>
        </div>
      </section>

      <!-- Overlays -->
      <section aria-labelledby="overlays-heading">
        <UiSectionHeader
          title="Overlays"
          description="Focus trapping, restoration, and dismissal come from reka-ui; enter and exit are CSS keyframes on the shared tokens."
        />
        <UiCard class="mt-4">
          <div class="flex flex-wrap gap-3">
            <UiButton @click="dialogOpen = true">Open dialog</UiButton>
            <UiButton variant="danger" @click="confirmOpen = true">Destructive confirm</UiButton>
            <UiPopover v-model:open="popoverOpen" label="Example popover">
              <template #trigger>
                <UiButton variant="secondary">Open popover</UiButton>
              </template>
              <p class="text-support text-text-secondary">Arbitrary content, dialog semantics.</p>
            </UiPopover>
          </div>
        </UiCard>
      </section>

      <!-- Tabs -->
      <section aria-labelledby="tabs-heading">
        <UiSectionHeader title="Tabs" />
        <UiCard class="mt-4">
          <UiTabs
            v-model="tab"
            aria-label="Showcase tabs"
            :items="[
              { value: 'one', label: 'Pending', count: 4 },
              { value: 'two', label: 'Published', count: 12 },
              { value: 'three', label: 'Rejected' },
            ]"
          />
          <p class="mt-4 text-support text-text-muted">Active tab: {{ tab }}</p>
        </UiCard>
      </section>

      <!-- Motion -->
      <section aria-labelledby="motion-heading">
        <UiSectionHeader
          title="Motion"
          :description="`Entrance ${durationMs.element}ms on ${easing.entrance.join(', ')}, staggered ${durationMs.stagger}ms apart.`"
        />
        <UiCard class="mt-4">
          <ul class="grid gap-2 sm:grid-cols-3">
            <motion.li
              v-for="index in 6"
              :key="index"
              v-bind="staggered(index - 1)"
              class="rounded-field border border-border bg-surface-subtle p-4 text-support text-text-secondary"
            >
              Item {{ index }}
            </motion.li>
          </ul>
          <p class="mt-4 text-meta text-text-muted">
            Reload to replay. Under `prefers-reduced-motion` these fade without moving.
          </p>
        </UiCard>
      </section>
    </main>

    <UiDialog v-model:open="dialogOpen" title="Example dialog" description="Focus is trapped and restored on close.">
      <p class="text-support text-text-secondary">
        Dialog content. Press Escape, click the backdrop, or use the close button.
      </p>
      <template #footer>
        <UiButton variant="secondary" @click="dialogOpen = false">Cancel</UiButton>
        <UiButton @click="dialogOpen = false">Confirm</UiButton>
      </template>
    </UiDialog>

    <UiConfirmationDialog
      v-model:open="confirmOpen"
      title="Withdraw this application?"
      consequence="Your application will be withdrawn. You cannot undo this."
      confirm-label="Withdraw application"
      @confirm="confirmOpen = false"
    />
  </div>
</template>
