import { ref } from 'vue'
import { http } from '../../../http'
import type { ApplicationSubmissionResponse } from '../types'

/**
 * Submits a job application.
 *
 * The payload matches `StoreApplicationRequest` exactly: `resume_id` is
 * required and `cover_letter` is optional. The API additionally snapshots the
 * candidate's email and profile phone onto the application server-side, so
 * contact details are always forwarded and are not sent from here.
 *
 * Note: `docs/requirements.md` FR-AP-03 describes a contact-only application
 * path with no resume. The implemented API does not support it — `resume_id`
 * is `required` — so the UI requires a resume rather than sending fields the
 * backend would silently discard.
 */
export interface SubmitApplicationPayload {
  resume_id: number
  cover_letter?: string | null
}

export function useApplicationSubmit() {
  const isSubmitting = ref(false)

  async function submitApplication(
    jobId: string | number,
    payload: SubmitApplicationPayload,
  ): Promise<ApplicationSubmissionResponse> {
    isSubmitting.value = true

    try {
      const response = await http.post<{ data: ApplicationSubmissionResponse }>(
        `/api/v1/jobs/${jobId}/applications`,
        {
          resume_id: payload.resume_id,
          cover_letter: payload.cover_letter?.trim() || undefined,
        },
      )

      return response.data.data
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    submitApplication,
  }
}
