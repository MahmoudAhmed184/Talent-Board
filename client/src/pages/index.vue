<script setup lang="ts">
/**
 * Public landing page.
 *
 * Leads straight into search — the fastest path to value on a job board is the
 * search field, not a marketing narrative. The latest approved listings are
 * shown immediately so the page proves it has real content.
 *
 * Every number on this page is a real count from the API — the hero's figures
 * come from `GET /api/v1/stats`; none of them is invented.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { UiButton, UiErrorState, UiSkeleton } from '@/components/ui'
import { fadeRise, useStaggeredPreset } from '@/design/motion'
import { usePublicJobs } from '@/composables/usePublicJobs'
import { useSearchStore } from '@/stores/useSearchStore'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { homeForRole } from '@/lib/navigation'
import JobCard from '@/features/jobs/components/JobCard.vue'
import LandingHero from '@/features/marketing/components/LandingHero.vue'
import TalentArcSection from '@/features/marketing/components/TalentArcSection.vue'
import TalentBentoSection from '@/features/marketing/components/TalentBentoSection.vue'

const router = useRouter()
const authStore = useAuthStore()
const searchStore = useSearchStore()
const { formError, isListLoading, jobs, loadJobs } = usePublicJobs()

const cardMotion = useStaggeredPreset(fadeRise)

const featuredJobs = computed(() => jobs.value.slice(0, 6))

function runSearch() {
  void router.push({ path: '/jobs', query: searchStore.q ? { q: searchStore.q } : {} })
}

onMounted(() => {
  void loadJobs({ per_page: 6 })
})
</script>

<template>
  <div>
    <!-- Hero. A full-bleed band that the public header sits over, unpainted. -->
    <LandingHero v-model="searchStore.q" @submit="runSearch" />

    <div class="mx-auto max-w-[var(--size-content-max)] px-4 py-12 sm:px-6 sm:py-16">
      <!-- Latest listings -->
      <section aria-labelledby="latest-jobs-heading">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="latest-jobs-heading" class="text-section-title text-text-primary">
              Latest approved roles
            </h2>
            <p class="mt-1 text-support text-text-muted">
              Freshly published listings from across the board.
            </p>
          </div>

          <UiButton to="/jobs" variant="secondary" size="sm">
            Browse all jobs
            <template #trailing><ArrowRight class="size-4" aria-hidden="true" /></template>
          </UiButton>
        </div>

        <div
          v-if="isListLoading"
          class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-busy="true"
        >
          <span class="sr-only">Loading the latest job listings</span>
          <UiSkeleton v-for="index in 6" :key="index" class="h-64" rounded="card" />
        </div>

        <div v-else-if="formError" class="mt-6">
          <UiErrorState
            title="Latest jobs could not be loaded"
            :description="formError"
            @retry="loadJobs({ per_page: 6 })"
          />
        </div>

        <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.li
            v-for="(job, index) in featuredJobs"
            :key="job.id"
            v-bind="cardMotion(index)"
          >
            <JobCard :job="job" />
          </motion.li>
        </ul>
      </section>
    </div>

    <!--
      Value proposition. A full-bleed band, so it sits outside the content
      column and its portrait arc can be cropped by the viewport edges. It also
      carries the three points the old numbered "How applying works" list made,
      which is why that list is gone.
    -->
    <TalentArcSection />

    <div class="mx-auto max-w-[var(--size-content-max)] px-4 py-12 sm:px-6 sm:py-16">
      <TalentBentoSection />

      <!-- Sign-up prompt. Hidden once signed in, where it would be noise. -->
      <section
        v-if="!authStore.isAuthenticated && !authStore.isSessionLoading"
        class="mt-16 rounded-panel border border-border bg-surface p-6 sm:p-10"
      >
        <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div class="max-w-2xl">
            <h2 class="text-section-title text-text-primary">Ready to apply?</h2>
            <p class="mt-2 text-support leading-6 text-text-muted">
              Create a candidate account to apply and track responses, or an
              employer account to post a role for review.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <UiButton to="/auth/register/candidate">I am looking for work</UiButton>
            <UiButton to="/auth/register/employer" variant="secondary">I am hiring</UiButton>
          </div>
        </div>
      </section>

      <section v-else-if="authStore.isAuthenticated" class="mt-16">
        <UiButton :to="homeForRole(authStore.role)" variant="secondary">
          Go to my workspace
          <template #trailing><ArrowRight class="size-4" aria-hidden="true" /></template>
        </UiButton>
      </section>
    </div>
  </div>
</template>
