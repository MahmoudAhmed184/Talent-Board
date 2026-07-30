<script setup lang="ts">
/**
 * Candidate application detail, with the status timeline.
 *
 * The API has no `GET /candidate/applications/{id}`, so the record is taken
 * from the loaded collection and the collection is fetched on a cold load
 * (deep link, refresh). If it still is not found the page says the record
 * could not be located rather than rendering an empty shell — see
 * docs/frontend-information-architecture.md for the endpoint gap.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Building2, FileText, Mail, Phone } from 'lucide-vue-next'
import {
  UiAlert,
  UiBreadcrumbs,
  UiButton,
  UiCard,
  UiConfirmationDialog,
  UiDescriptionList,
  UiErrorState,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
} from '@/components/ui'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge.vue'
import ApplicationTimeline from '@/features/applications/components/ApplicationTimeline.vue'
import { useCandidateApplicationsStore } from '@/features/candidate/stores/useCandidateApplicationsStore'
import { applicationStatus, isCancellable } from '@/lib/status'
import { formatDate } from '@/features/jobs/utils/formatters'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const toast = useToast()
const store = useCandidateApplicationsStore()

const cancelOpen = ref(false)
const cancelError = ref('')
const loading = ref(true)

const applicationId = computed(() => Number(route.params.id))
const application = computed(
  () => store.applications.find((item) => item.id === applicationId.value) ?? null,
)
const descriptor = computed(() =>
  application.value ? applicationStatus(application.value.status) : null,
)

/**
 * UiAlert only speaks the four semantic tones. `neutral` and `accent` (used by
 * cancelled and by any future accent status) both read as informational here.
 */
const alertTone = computed<'info' | 'success' | 'warning' | 'danger'>(() => {
  const tone = descriptor.value?.tone

  return tone === 'success' || tone === 'warning' || tone === 'danger' ? tone : 'info'
})
const canCancel = computed(() =>
  application.value ? isCancellable(application.value.status) : false,
)

const details = computed(() => {
  const item = application.value

  if (!item) {
    return []
  }

  return [
    { term: 'Submitted', value: formatDate(item.submitted_at) },
    { term: 'Company', value: item.job_listing?.employer?.company_name ?? 'Hiring company' },
    { term: 'Resume', key: 'resume', value: item.resume?.original_name ?? 'Not attached' },
    { term: 'Contact email', key: 'contact-email', value: item.contact_email ?? 'Not provided' },
    { term: 'Contact phone', key: 'contact-phone', value: item.contact_phone ?? 'Not provided' },
  ]
})

async function load() {
  loading.value = true

  try {
    // Only fetch when the collection is cold, so navigating in from the list
    // does not refetch what is already there.
    if (store.applications.length === 0) {
      await store.loadPage(1)
    }
  } finally {
    loading.value = false
  }
}

async function confirmCancel() {
  const item = application.value

  if (!item) {
    return
  }

  cancelError.value = ''

  try {
    await store.cancelApplication(item.id)
    cancelOpen.value = false
    toast.success('Your application was withdrawn.', { title: 'Application withdrawn' })
  } catch {
    cancelError.value =
      'The application could not be withdrawn. It may already have been decided.'
  }
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6">
    <UiBreadcrumbs
      :items="[
        { label: 'My applications', to: '/candidate/applications' },
        { label: application?.job_listing?.title ?? 'Application' },
      ]"
    />

    <div v-if="loading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading application</span>
      <UiSkeleton class="h-28" rounded="card" />
      <UiSkeleton class="h-64" rounded="card" />
    </div>

    <UiErrorState
      v-else-if="!application"
      title="We could not find that application"
      description="It may have been withdrawn, or the link may be out of date."
      @retry="load"
    >
      <UiButton to="/candidate/applications" variant="secondary">
        Back to my applications
      </UiButton>
    </UiErrorState>

    <template v-else>
      <UiPageHeader
        eyebrow="Application"
        :title="application.job_listing?.title ?? 'Job application'"
      >
        <template #meta>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <ApplicationStatusBadge :status="application.status" />
            <span class="flex items-center gap-1.5 text-support text-text-muted">
              <Building2 class="size-4" aria-hidden="true" />
              {{ application.job_listing?.employer?.company_name ?? 'Hiring company' }}
            </span>
          </div>
        </template>

        <template #actions>
          <UiButton
            v-if="application.job_listing?.id"
            variant="secondary"
            :to="`/jobs/${application.job_listing.id}`"
          >
            View the listing
          </UiButton>
          <UiButton v-if="canCancel" variant="danger-ghost" @click="cancelOpen = true">
            Withdraw
          </UiButton>
        </template>
      </UiPageHeader>

      <UiAlert v-if="descriptor" :tone="alertTone">
        {{ descriptor.description }}
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <UiCard as="section">
          <UiSectionHeader title="Status history" />
          <div class="mt-5">
            <ApplicationTimeline
              :status="application.status"
              :submitted-at="application.submitted_at"
              :decided-at="application.decision?.decided_at"
              :decision-note="application.decision?.note"
            />
          </div>
        </UiCard>

        <div class="grid gap-4">
          <UiCard as="section">
            <UiSectionHeader as="h3" title="What you sent" />
            <div class="mt-4">
              <UiDescriptionList :items="details" :columns="1">
                <template #[`value-resume`]>
                  <span class="flex items-center gap-2">
                    <FileText class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
                    {{ application.resume?.original_name ?? 'Not attached' }}
                  </span>
                </template>
                <template #[`value-contact-email`]>
                  <span class="flex items-center gap-2">
                    <Mail class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
                    {{ application.contact_email ?? 'Not provided' }}
                  </span>
                </template>
                <template #[`value-contact-phone`]>
                  <span class="flex items-center gap-2">
                    <Phone class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
                    {{ application.contact_phone ?? 'Not provided' }}
                  </span>
                </template>
              </UiDescriptionList>
            </div>
          </UiCard>

          <UiCard v-if="application.cover_letter" as="section">
            <UiSectionHeader as="h3" title="Your cover letter" />
            <p class="mt-3 whitespace-pre-line text-support leading-6 text-text-secondary">
              {{ application.cover_letter }}
            </p>
          </UiCard>
        </div>
      </div>

      <UiConfirmationDialog
        v-model:open="cancelOpen"
        title="Withdraw this application?"
        :consequence="`Your application for “${application.job_listing?.title ?? 'this role'}” will be withdrawn. You cannot undo this.`"
        confirm-label="Withdraw application"
        :loading="store.isCancelling"
        :error="cancelError"
        @confirm="confirmCancel"
      />
    </template>
  </div>
</template>
