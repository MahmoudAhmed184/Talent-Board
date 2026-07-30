<script setup lang="ts">
/**
 * Account-type chooser.
 *
 * Candidates and employers get genuinely different products, so the choice is
 * made up front on its own screen rather than as a toggle buried in one form.
 * Each option links to a dedicated, linkable registration route.
 *
 * Administrator accounts are provisioned by seeder and cannot be self-registered
 * (`UserRole::canSelfRegister()`), so no third option is offered.
 */
import { ArrowRight, Briefcase, Building2 } from 'lucide-vue-next'

const options = [
  {
    to: '/auth/register/candidate',
    icon: Briefcase,
    title: 'I am looking for work',
    body: 'Search approved roles, apply with a saved resume, and track every response.',
  },
  {
    to: '/auth/register/employer',
    icon: Building2,
    title: 'I am hiring',
    body: 'Publish roles for review, manage your listings, and decide on applicants.',
  },
] as const
</script>

<template>
  <div>
    <h1 class="text-page-title text-text-primary">Create your account</h1>
    <p class="mt-2 text-support text-text-muted">
      Choose the account type that matches what you are here to do.
    </p>

    <ul class="mt-8 grid gap-3">
      <li v-for="option in options" :key="option.to">
        <RouterLink
          :to="option.to"
          class="group flex items-start gap-4 rounded-card border border-border bg-surface p-5 transition-[border-color,box-shadow,transform] duration-[var(--duration-control)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover motion-reduce:hover:translate-y-0"
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-field bg-brand-100 text-accent"
            aria-hidden="true"
          >
            <component :is="option.icon" class="size-5" />
          </span>

          <span class="min-w-0 flex-1">
            <span class="block text-card-title text-text-primary">{{ option.title }}</span>
            <span class="mt-1 block text-support leading-6 text-text-muted">{{ option.body }}</span>
          </span>

          <ArrowRight
            class="mt-1 size-5 shrink-0 text-text-faint transition-transform duration-[var(--duration-control)] group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </RouterLink>
      </li>
    </ul>

    <p class="mt-6 text-support text-text-muted">
      Already have an account?
      <RouterLink to="/auth/login" class="font-semibold text-accent hover:underline">
        Sign in
      </RouterLink>
    </p>
  </div>
</template>
