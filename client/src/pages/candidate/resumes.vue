<script setup lang="ts">
/**
 * Resume management.
 *
 * Uploading, choosing a default, and deleting. The default resume matters
 * because it is preselected when applying, so the page explains that rather
 * than leaving "Default" as a decorative badge.
 *
 * Deleting is confirmed and explicitly reassures that already-submitted
 * applications keep their own copy — the API snapshots the file onto each
 * application (FR-FU-05), and users will not assume that.
 */
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { FileText } from 'lucide-vue-next'
import {
  UiAlert,
  UiCard,
  UiConfirmationDialog,
  UiEmptyState,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
} from '@/components/ui'
import ResumeCard from '@/features/candidate/components/ResumeCard.vue'
import ResumeUploader from '@/features/candidate/components/ResumeUploader.vue'
import { useResumes } from '@/features/candidate/composables/useResumes'
import { useCandidateProfile } from '@/features/candidate/composables/useCandidateProfile'
import { useCandidateProfileStore } from '@/features/candidate/stores/useCandidateProfileStore'
import { useToast } from '@/composables/useToast'
import type { Resume } from '@/features/candidate/types'

const toast = useToast()
const profileStore = useCandidateProfileStore()
const { deleteResume } = useCandidateProfile()
const { error: uploadError, fetchResumes, isLoading, resumes, uploadResume } = useResumes()

const uploaderRef = useTemplateRef<InstanceType<typeof ResumeUploader>>('uploader')
const uploading = ref(false)
const busyId = ref<number | null>(null)
const deleteTarget = ref<Resume | null>(null)
const deleteError = ref('')
const actionError = ref('')

const defaultResumeId = computed(() => profileStore.profile?.default_resume_id ?? null)

async function handleUpload(file: File) {
  uploading.value = true

  try {
    const created = await uploadResume(file)
    uploaderRef.value?.reset()
    toast.success(`${file.name} was uploaded.`, { title: 'Resume added' })

    // First resume becomes the default automatically — otherwise applying
    // would immediately ask the candidate to pick from a list of one.
    if (defaultResumeId.value === null && created?.id) {
      await makeDefault(created)
    }
  } catch {
    // `useResumes` already surfaced the message through `uploadError`.
  } finally {
    uploading.value = false
  }
}

async function makeDefault(resume: Resume) {
  actionError.value = ''
  busyId.value = resume.id

  try {
    await profileStore.saveProfile({ default_resume_id: resume.id })
    toast.success(`${resume.original_name} is now your default resume.`)
  } catch {
    actionError.value = 'That resume could not be set as your default.'
  } finally {
    busyId.value = null
  }
}

async function confirmDelete() {
  const target = deleteTarget.value

  if (!target) {
    return
  }

  deleteError.value = ''
  busyId.value = target.id

  try {
    await deleteResume(target.id)
    await fetchResumes()

    // The profile still points at a file that no longer exists.
    if (defaultResumeId.value === target.id) {
      await profileStore.loadProfile()
    }

    deleteTarget.value = null
    toast.success(`${target.original_name} was deleted.`)
  } catch {
    deleteError.value = 'That resume could not be deleted. Please try again.'
  } finally {
    busyId.value = null
  }
}

onMounted(async () => {
  await Promise.allSettled([fetchResumes(), profileStore.loadProfile()])
})
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Resumes"
      description="Upload the files you apply with, and choose which one is sent by default."
    />

    <UiAlert v-if="actionError" tone="danger" title="That did not work">
      {{ actionError }}
    </UiAlert>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section aria-labelledby="stored-resumes-heading" class="min-w-0">
        <UiSectionHeader
          id="stored-resumes-heading"
          title="Your resumes"
          description="Your default resume is preselected whenever you apply."
        />

        <div v-if="isLoading && resumes.length === 0" class="mt-4 grid gap-3" role="status" aria-busy="true">
          <span class="sr-only">Loading your resumes</span>
          <UiSkeleton v-for="index in 2" :key="index" class="h-20" rounded="card" />
        </div>

        <div v-else-if="resumes.length === 0" class="mt-4">
          <UiEmptyState
            :icon="FileText"
            title="No resumes yet"
            description="Upload a PDF, DOC, or DOCX file and you can reuse it for every application."
          />
        </div>

        <ul v-else class="mt-4 grid gap-3">
          <li v-for="resume in resumes" :key="resume.id">
            <ResumeCard
              :resume="resume"
              :is-default="resume.id === defaultResumeId"
              :busy="busyId === resume.id"
              @make-default="makeDefault"
              @delete="deleteTarget = $event"
            />
          </li>
        </ul>
      </section>

      <UiCard as="section">
        <UiSectionHeader as="h3" title="Upload a resume" />
        <div class="mt-4">
          <ResumeUploader
            ref="uploader"
            :uploading="uploading"
            :progress="uploading ? 60 : 0"
            :error="uploadError ?? ''"
            @upload="handleUpload"
          />
        </div>
      </UiCard>
    </div>

    <UiConfirmationDialog
      :open="deleteTarget !== null"
      title="Delete this resume?"
      :consequence="
        deleteTarget
          ? `“${deleteTarget.original_name}” will be removed from your account. Applications you already submitted keep their own copy and are not affected.`
          : undefined
      "
      confirm-label="Delete resume"
      :loading="busyId !== null && busyId === deleteTarget?.id"
      :error="deleteError"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
      @update:open="(value) => { if (!value) deleteTarget = null }"
    />
  </div>
</template>
