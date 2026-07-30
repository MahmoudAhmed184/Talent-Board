<script setup lang="ts">
/**
 * Full application detail for an employer, backed by
 * `GET /employer/applications/{id}` — a real endpoint, unlike the candidate
 * side, so this page deep-links correctly.
 *
 * Accept/reject live here as well as in the list, because this is where an
 * employer has actually read the cover letter.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Briefcase, Mail, Paperclip, Phone } from 'lucide-vue-next'
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
  UiTextarea,
} from '@/components/ui'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge.vue'
import ApplicationTimeline from '@/features/applications/components/ApplicationTimeline.vue'
import { UiAvatar } from '@/components/ui'
import { useEmployerApplications } from '@/composables/useEmployerApplications'
import { isDecidable } from '@/lib/status'
import { formatDate } from '@/features/jobs/utils/formatters'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const toast = useToast()
const {
  formError,
  isDetailLoading,
  isUpdatingStatus,
  loadDetail,
  selected,
  updateDecision,
} = useEmployerApplications()

const decisionType = ref<'accepted' | 'rejected' | null>(null)
const decisionNote = ref('')
const decisionError = ref('')

const applicationId = computed(() => Number(route.params.id))
const canDecide = computed(() => (selected.value ? isDecidable(selected.value.status) : false))

const details = computed(() => {
  const item = selected.value

  if (!item) {
    return []
  }

  return [
    { term: 'Applied for', value: item.job_listing?.title ?? 'Unknown listing' },
    { term: 'Submitted', value: formatDate(item.submitted_at) },
    { term: 'Email', value: item.contact_email ?? 'Not provided' },
    { term: 'Phone', value: item.contact_phone ?? 'Not provided' },
    { term: 'Resume', value: item.resume?.original_name ?? 'Not attached' },
    {
      term: 'Decision recorded',
      value: item.decision?.decided_at ? formatDate(item.decision.decided_at) : 'Not yet decided',
    },
  ]
})

function openDecision(type: 'accepted' | 'rejected') {
  decisionType.value = type
  decisionNote.value = ''
  decisionError.value = ''
}

async function confirmDecision() {
  const type = decisionType.value

  if (!type || !selected.value) {
    return
  }

  decisionError.value = ''

  const ok = await updateDecision(selected.value.id, type, decisionNote.value)

  if (!ok) {
    decisionError.value = formError.value ?? 'The decision could not be saved.'
    return
  }

  toast.success(
    type === 'accepted' ? 'Candidate accepted.' : 'Candidate rejected.',
    { title: 'Decision recorded' },
  )
  decisionType.value = null
}

onMounted(() => loadDetail(applicationId.value))
</script>

<template>
  <div class="grid gap-6">
    <UiBreadcrumbs
      :items="[
        { label: 'Applications', to: '/employer/applications' },
        { label: selected?.candidate.name ?? 'Application' },
      ]"
    />

    <div v-if="isDetailLoading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading application</span>
      <UiSkeleton class="h-28" rounded="card" />
      <UiSkeleton class="h-64" rounded="card" />
    </div>

    <UiErrorState
      v-else-if="!selected"
      title="This application could not be loaded"
      description="It may have been withdrawn, or it may not belong to one of your listings."
      @retry="loadDetail(applicationId)"
    >
      <UiButton to="/employer/applications" variant="secondary">Back to applications</UiButton>
    </UiErrorState>

    <template v-else>
      <UiPageHeader :title="selected.candidate.name ?? 'Candidate'">
        <template #meta>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <ApplicationStatusBadge :status="selected.status" />
            <span class="flex items-center gap-1.5 text-support text-text-muted">
              <Briefcase class="size-4" aria-hidden="true" />
              {{ selected.job_listing?.title ?? 'Unknown listing' }}
            </span>
          </div>
        </template>

        <template #actions>
          <template v-if="canDecide">
            <UiButton variant="danger-ghost" @click="openDecision('rejected')">Reject</UiButton>
            <UiButton @click="openDecision('accepted')">Accept</UiButton>
          </template>
        </template>
      </UiPageHeader>

      <UiAlert v-if="formError && decisionType === null" tone="danger" title="Something went wrong">
        {{ formError }}
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div class="grid min-w-0 gap-6">
          <UiCard as="section">
            <div class="flex items-start gap-4">
              <UiAvatar :name="selected.candidate.name" size="lg" />
              <div class="min-w-0">
                <h2 class="text-card-title text-text-primary">
                  {{ selected.candidate.name ?? 'Candidate' }}
                </h2>
                <ul class="mt-2 grid gap-1.5 text-support text-text-secondary">
                  <li v-if="selected.contact_email" class="flex items-center gap-2">
                    <Mail class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
                    <a
                      :href="`mailto:${selected.contact_email}`"
                      class="rounded-control hover:text-accent hover:underline"
                    >
                      {{ selected.contact_email }}
                    </a>
                  </li>
                  <li v-if="selected.contact_phone" class="flex items-center gap-2">
                    <Phone class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
                    {{ selected.contact_phone }}
                  </li>
                  <li v-if="selected.resume?.original_name" class="flex items-center gap-2">
                    <Paperclip class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
                    {{ selected.resume.original_name }}
                  </li>
                </ul>
              </div>
            </div>
          </UiCard>

          <UiCard v-if="selected.cover_letter" as="section">
            <UiSectionHeader title="Cover letter" />
            <p class="mt-3 whitespace-pre-line text-body leading-7 text-text-secondary">
              {{ selected.cover_letter }}
            </p>
          </UiCard>

          <UiCard as="section">
            <UiSectionHeader title="Submitted details" />
            <div class="mt-4">
              <UiDescriptionList :items="details" />
            </div>
          </UiCard>
        </div>

        <UiCard as="section">
          <UiSectionHeader as="h3" title="Status history" />
          <div class="mt-5">
            <ApplicationTimeline
              :status="selected.status"
              :submitted-at="selected.submitted_at"
              :decided-at="selected.decision?.decided_at"
              :decision-note="selected.decision?.note"
            />
          </div>
        </UiCard>
      </div>

      <UiConfirmationDialog
        :open="decisionType !== null"
        :title="decisionType === 'accepted' ? 'Accept this candidate?' : 'Reject this candidate?'"
        :consequence="
          decisionType === 'accepted'
            ? `${selected.candidate.name ?? 'This candidate'} will see that their application was accepted.`
            : `${selected.candidate.name ?? 'This candidate'} will see that they were not selected. This cannot be undone.`
        "
        :confirm-label="decisionType === 'accepted' ? 'Accept candidate' : 'Reject candidate'"
        :confirm-variant="decisionType === 'accepted' ? 'primary' : 'danger'"
        :loading="isUpdatingStatus"
        :error="decisionError"
        @confirm="confirmDecision"
        @cancel="decisionType = null"
        @update:open="(value) => { if (!value) decisionType = null }"
      >
        <UiTextarea
          v-model="decisionNote"
          label="Note for your records"
          optional
          :rows="3"
          :maxlength="500"
          hint="Stored with the decision."
        />
      </UiConfirmationDialog>
    </template>
  </div>
</template>
