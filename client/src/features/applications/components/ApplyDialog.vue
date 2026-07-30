<script setup lang="ts">
/**
 * Job application flow.
 *
 * Requires a resume, because the API does (`StoreApplicationRequest` marks
 * `resume_id` as required). Rather than hiding that, the dialog shows the
 * candidate exactly what will be sent — which resume, and the contact details
 * the server snapshots onto the application — so submitting holds no surprises.
 *
 * A candidate with no resume yet is routed to the upload page instead of being
 * shown an empty, unusable picker.
 */
import { computed, ref, watch } from 'vue'
import { Mail, Phone, Upload } from 'lucide-vue-next'
import {
  UiAlert,
  UiButton,
  UiDialog,
  UiRadioGroup,
  UiSpinner,
  UiTextarea,
} from '@/components/ui'
import { formatFileSize } from '@/features/jobs/utils/formatters'
import type { CandidateProfile, Resume } from '@/features/candidate/types'

const {
  error = '',
  jobTitle,
  loadingResumes = false,
  profile,
  resumes,
  submitting = false,
} = defineProps<{
  error?: string
  jobTitle: string
  loadingResumes?: boolean
  profile: CandidateProfile | null
  resumes: readonly Resume[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { resumeId: number; coverLetter: string }]
}>()

const open = defineModel<boolean>('open', { default: false })

const resumeId = ref<number | null>(null)
const coverLetter = ref('')
const validationError = ref('')

const resumeOptions = computed(() =>
  resumes.map((resume) => ({
    value: resume.id,
    label: resume.original_name,
    description: formatFileSize(resume.size),
  })),
)

const hasResumes = computed(() => resumes.length > 0)

// Reset per opening, and preselect the candidate's default resume so the
// common case is a single click.
watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }

  coverLetter.value = ''
  validationError.value = ''
  resumeId.value = profile?.default_resume_id ?? resumes[0]?.id ?? null
})

function submit() {
  if (resumeId.value === null) {
    validationError.value = 'Choose which resume to send.'
    return
  }

  validationError.value = ''
  emit('submit', { resumeId: resumeId.value, coverLetter: coverLetter.value })
}
</script>

<template>
  <UiDialog
    v-model:open="open"
    :title="`Apply for ${jobTitle}`"
    description="Review what the employer will receive, then submit."
    size="lg"
    :dismissible="!submitting"
  >
    <div v-if="loadingResumes" class="flex justify-center py-8">
      <UiSpinner size="lg" label="Loading your resumes" />
    </div>

    <div v-else-if="!hasResumes" class="grid gap-4">
      <UiAlert tone="warning" title="You need a resume first">
        Every application includes a resume. Upload one and you can reuse it for
        every job after this.
      </UiAlert>

      <UiButton to="/candidate/resumes">
        <template #icon><Upload class="size-4" aria-hidden="true" /></template>
        Upload a resume
      </UiButton>
    </div>

    <form v-else class="grid gap-6" @submit.prevent="submit">
      <UiRadioGroup
        v-model="resumeId"
        legend="Which resume should we send?"
        :options="resumeOptions"
        :error="validationError"
        required
      />

      <UiTextarea
        v-model="coverLetter"
        label="Cover letter"
        optional
        :maxlength="2000"
        show-count
        :rows="6"
        hint="Say why you are a good fit. Employers read this alongside your resume."
        placeholder="Introduce yourself and explain your interest in this role."
      />

      <!--
        The API snapshots these onto the application, so the candidate should
        see them before submitting rather than discovering them afterwards.
      -->
      <section class="rounded-card border border-border bg-surface-subtle p-4">
        <h3 class="text-support font-semibold text-text-primary">
          Contact details sent with this application
        </h3>

        <dl class="mt-3 grid gap-2 text-support text-text-secondary">
          <div class="flex items-center gap-2">
            <Mail class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
            <dt class="sr-only">Email</dt>
            <dd class="min-w-0 truncate">{{ profile?.email || 'Your account email' }}</dd>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
            <dt class="sr-only">Phone</dt>
            <dd class="min-w-0 truncate">
              {{ profile?.phone || 'No phone number on your profile' }}
            </dd>
          </div>
        </dl>

        <p v-if="!profile?.phone" class="mt-3 text-meta text-text-muted">
          <RouterLink to="/candidate/profile" class="font-semibold text-accent hover:underline">
            Add a phone number
          </RouterLink>
          so employers have a second way to reach you.
        </p>
      </section>

      <UiAlert v-if="error" tone="danger" title="Your application was not submitted">
        {{ error }}
      </UiAlert>
    </form>

    <template v-if="hasResumes && !loadingResumes" #footer>
      <UiButton variant="secondary" :disabled="submitting" @click="open = false">
        Cancel
      </UiButton>
      <UiButton :loading="submitting" loading-label="Submitting application" @click="submit">
        Submit application
      </UiButton>
    </template>
  </UiDialog>
</template>
