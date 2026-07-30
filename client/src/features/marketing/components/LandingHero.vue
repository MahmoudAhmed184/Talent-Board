<script setup lang="ts">
/**
 * Landing hero.
 *
 * Composition follows the reference direction: headline with a single accented
 * word, one pill search field as the primary action, and an arched tile
 * collage holding the right half.
 *
 * The band runs from the very top of the page and the public header sits over
 * it unpainted, so the two read as one block and the collage passes behind the
 * navigation. That is why the copy starts below a header's worth of padding
 * rather than at the top of the section.
 *
 * The palette stays on the product's own brand ramp rather than the
 * reference's orange — the accent colour carries meaning everywhere else in
 * the app, and a second one on the busiest page would break that.
 *
 * The search field is composed here rather than reusing `UiSearchInput`
 * because the hero's pill geometry and inline submit button are specific to
 * this surface; the field's height, focus ring, and icon still come from the
 * same tokens.
 */
import { onMounted, useId } from 'vue'
import { ArrowRight, Search } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { UiButton } from '@/components/ui'
import { usePlatformStats } from '@/composables/usePlatformStats'
import { fadeRise, useMotionPreset } from '@/design/motion'
import HeroStats from './HeroStats.vue'
import HeroTalentCollage from './HeroTalentCollage.vue'

const { stats, isLoaded, load } = usePlatformStats()

onMounted(load)

const emit = defineEmits<{ submit: [] }>()

const query = defineModel<string>({ default: '' })
const searchId = useId()
const copyMotion = useMotionPreset(fadeRise)
</script>

<template>
  <section class="relative overflow-hidden bg-surface-subtle">
    <!-- Decorative geometry. Anchored to the band's edges so it reads as part
         of the surface rather than as floating debris. -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <!-- Suppressed below lg, where the copy runs the full width and the
           shape would sit underneath the headline. -->
      <span class="absolute left-0 top-24 hidden h-20 w-10 rounded-r-full bg-brand-600 lg:block" />
      <span class="absolute left-1/2 top-0 h-10 w-24 -translate-x-1/2 rounded-b-full bg-brand-200 lg:left-[30%]" />
      <span class="absolute bottom-0 left-[18%] h-12 w-28 rounded-t-full bg-pastel-mint" />
    </div>

    <!--
      The copy column keeps the page's content measure and stays aligned with
      the rest of the page; the collage takes the other half and runs to the
      viewport edge, which is what makes the band read as full width.
    -->
    <div class="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-0">
      <motion.div
        v-bind="copyMotion"
        class="w-full px-4 pb-4 pt-28 sm:px-6 sm:pt-32 lg:max-w-[calc(var(--size-content-max)/2)] lg:justify-self-end lg:py-32 lg:pr-12"
      >
          <h1 class="text-display text-text-primary">
            Find <span class="text-accent">verified</span> roles for your next move
          </h1>

          <p class="mt-5 text-body leading-7 text-text-muted">
            Every listing here is reviewed before it goes live. Apply with a
            resume you have already uploaded, then follow each decision without
            chasing anyone.
          </p>

          <!-- Primary action. A form so Enter submits and the field carries a
               real label for screen readers. -->
          <form
            class="mt-8 flex max-w-lg items-center gap-2 rounded-pill bg-surface p-2 shadow-popover"
            @submit.prevent="emit('submit')"
          >
            <label :for="searchId" class="sr-only">Search jobs by title or keyword</label>

            <Search class="ml-3 size-4 shrink-0 text-text-faint" aria-hidden="true" />

            <input
              :id="searchId"
              v-model="query"
              type="search"
              name="q"
              placeholder="Search a job title or skill"
              class="h-11 min-w-0 flex-1 bg-transparent text-body text-text-primary placeholder:text-text-faint focus:outline-none"
            >

            <button
              type="submit"
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-text-inverse transition-colors duration-[var(--duration-control)] ease-[var(--ease-standard)] hover:bg-accent-hover active:scale-[0.98]"
            >
              <Search class="size-4" aria-hidden="true" />
              <span class="sr-only">Search jobs</span>
            </button>
          </form>

          <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <p class="text-support text-text-muted">Hiring instead?</p>
            <UiButton to="/auth/register/employer" size="sm" class="rounded-full!">
              Post a role
              <template #trailing><ArrowRight class="size-4" aria-hidden="true" /></template>
            </UiButton>
          </div>

          <div v-if="isLoaded" class="mt-10 border-t border-border pt-8">
            <HeroStats
              :candidates="stats.candidates"
              :open-roles="stats.open_roles"
              :recruiters="stats.recruiters"
            />
          </div>
        </motion.div>

      <!--
        A fixed height, not the collage's own: the columns are deliberately
        taller than this box. From `lg` the copy sits beside the collage, so
        the overflow is left to run to the band's edges and the band crops it —
        the same crop the reference uses to imply the grid continues. Below
        `lg` the collage sits under the copy, where that same overflow would
        run over the headline, so it is clipped to its own box.
      -->
      <div
        class="h-80 overflow-hidden px-4 sm:h-[28rem] sm:px-6 lg:h-[44rem] lg:overflow-visible lg:px-0"
      >
        <HeroTalentCollage />
      </div>
    </div>

    <!--
      Legibility scrim for the header that floats over this band. The tiles
      still run behind the navigation — they just fade into the surface as they
      reach it, so "Sign in" never lands on a bright photograph. Drawn after
      the collage so it paints over it, and still under the header itself.
    -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-surface-subtle via-surface-subtle/80 to-transparent"
      aria-hidden="true"
    />
  </section>
</template>
