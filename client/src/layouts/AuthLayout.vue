<script setup lang="ts">
/**
 * Authentication shell.
 *
 * Two columns on desktop — a short value statement beside the form — and a
 * single column on mobile where the form comes first. The form card is the
 * skip-link target, because on this page the form *is* the page.
 */
import AppLogo from '@/components/AppLogo.vue'

const { subtitle, title } = defineProps<{
  subtitle?: string
  title?: string
}>()

const reasons = [
  'Search approved openings from verified employers.',
  'Apply with a saved resume or forwarded contact details.',
  'Track every application status in one place.',
] as const
</script>

<template>
  <div class="min-h-svh bg-canvas">
    <a
      href="#auth-form"
      class="sr-only-focusable absolute left-4 top-4 rounded-field bg-surface px-4 py-2 text-support font-semibold text-accent shadow-overlay"
      :style="{ zIndex: 'var(--z-skip-link)' }"
    >
      Skip to form
    </a>

    <div
      class="mx-auto grid min-h-svh max-w-[var(--size-content-max)] items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_28rem] lg:gap-16"
    >
      <!-- Supporting column. Second in the DOM so the form leads on mobile. -->
      <section class="order-2 hidden max-w-xl lg:order-1 lg:block">
        <AppLogo />

        <h2 class="mt-8 text-display text-text-primary">
          {{ title ?? 'Hiring, without the guesswork.' }}
        </h2>
        <p class="mt-4 text-body leading-7 text-text-muted">
          {{ subtitle ?? 'One account covers browsing, applying, and tracking every response.' }}
        </p>

        <ul class="mt-8 grid gap-3">
          <li v-for="reason in reasons" :key="reason" class="flex items-start gap-3 text-support text-text-secondary">
            <span class="mt-2 size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
            {{ reason }}
          </li>
        </ul>
      </section>

      <section class="order-1 w-full lg:order-2">
        <div class="mb-6 lg:hidden">
          <AppLogo />
        </div>

        <div id="auth-form" class="rounded-panel border border-border bg-surface p-6 shadow-raised sm:p-8">
          <slot />
        </div>
      </section>
    </div>
  </div>
</template>
