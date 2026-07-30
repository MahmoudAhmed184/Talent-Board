import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isApiValidationError } from '@/http'
import { useToast } from '@/composables/useToast'
import { useCandidateApplicationsStore } from '@/features/candidate/stores/useCandidateApplicationsStore'
import { useCandidateProfileStore } from '@/features/candidate/stores/useCandidateProfileStore'
import { useResumes } from '@/features/candidate/composables/useResumes'
import { useApplicationSubmit } from '@/features/candidate/composables/useApplicationSubmit'
import type { PublicJobSummary } from '@/composables/usePublicJobs'

/**
 * Drives the apply flow from wherever a job can be applied to — the detail
 * page and the candidate search results.
 *
 * Centralised so the two entry points cannot diverge on validation handling,
 * the applied-set bookkeeping, or where the user lands afterwards.
 */
export function useJobApplication() {
  const router = useRouter()
  const toast = useToast()
  const applicationsStore = useCandidateApplicationsStore()
  const profileStore = useCandidateProfileStore()
  const { fetchResumes, resumes } = useResumes()
  const { isSubmitting, submitApplication } = useApplicationSubmit()

  const dialogOpen = ref(false)
  const activeJob = ref<PublicJobSummary | null>(null)
  const loadingContext = ref(false)
  const submitError = ref('')

  /**
   * Loads the resumes and profile the dialog needs. Called on open rather than
   * on mount so a guest browsing the board never triggers candidate requests.
   */
  async function openFor(job: PublicJobSummary) {
    activeJob.value = job
    submitError.value = ''
    dialogOpen.value = true
    loadingContext.value = true

    try {
      await Promise.all([
        fetchResumes(),
        profileStore.profile ? Promise.resolve() : profileStore.loadProfile(),
      ])
    } catch {
      submitError.value = 'We could not load your resumes. Close this and try again.'
    } finally {
      loadingContext.value = false
    }
  }

  async function submit(payload: { resumeId: number; coverLetter: string }) {
    const job = activeJob.value

    if (!job) {
      return
    }

    submitError.value = ''

    try {
      await submitApplication(job.id, {
        resume_id: payload.resumeId,
        cover_letter: payload.coverLetter,
      })

      // Keep the local applied set in step so the card flips to "Applied"
      // without a refetch.
      applicationsStore.markJobAsApplied(job.id)
      dialogOpen.value = false

      toast.success(`Your application for ${job.title} has been submitted.`, {
        title: 'Application sent',
      })

      await router.push(`/candidate/applications?applied=${job.id}`)
    } catch (error) {
      // The dialog stays open and shows the reason: a toast alone would vanish
      // and leave the candidate unsure whether they applied.
      if (isApiValidationError(error)) {
        submitError.value = error.message
        return
      }

      submitError.value =
        'Your application could not be submitted. Please check your connection and try again.'
    }
  }

  return {
    activeJob,
    dialogOpen,
    loadingContext,
    openFor,
    profile: profileStore,
    resumes,
    submit,
    submitError,
    submitting: isSubmitting,
  }
}
