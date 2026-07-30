<script setup lang="ts">
/**
 * Approve/reject controls for a pending listing.
 *
 * Rejection requires a reason: it is the only thing the employer will receive
 * explaining why their listing is not public, so the field is required rather
 * than optional. Approval is a single confirmed action.
 */
import { ref, watch } from 'vue'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
import { UiAlert, UiButton, UiConfirmationDialog, UiTextarea } from '@/components/ui'

const { busy = false, error = '', jobTitle } = defineProps<{
  busy?: boolean
  error?: string
  jobTitle: string
}>()

const emit = defineEmits<{
  approve: []
  reject: [reason: string]
}>()

const approveOpen = ref(false)
const rejectOpen = ref(false)
const reason = ref('')
const reasonError = ref('')

watch(rejectOpen, (open) => {
  if (open) {
    reason.value = ''
    reasonError.value = ''
  }
})

function confirmReject() {
  const trimmed = reason.value.trim()

  if (trimmed.length < 10) {
    reasonError.value = 'Give the employer at least a sentence explaining the decision.'
    return
  }

  reasonError.value = ''
  emit('reject', trimmed)
}
</script>

<template>
  <div class="grid gap-4">
    <UiAlert v-if="error" tone="danger" title="The decision could not be saved">
      {{ error }}
    </UiAlert>

    <div class="flex flex-wrap gap-3">
      <UiButton :disabled="busy" @click="approveOpen = true">
        <template #icon><CheckCircle2 class="size-4" aria-hidden="true" /></template>
        Approve listing
      </UiButton>

      <UiButton variant="secondary" :disabled="busy" @click="rejectOpen = true">
        <template #icon><XCircle class="size-4" aria-hidden="true" /></template>
        Reject listing
      </UiButton>
    </div>

    <UiConfirmationDialog
      v-model:open="approveOpen"
      title="Publish this listing?"
      :consequence="`“${jobTitle}” becomes visible to every candidate immediately.`"
      confirm-label="Approve and publish"
      confirm-variant="primary"
      :loading="busy"
      @confirm="emit('approve')"
    />

    <UiConfirmationDialog
      v-model:open="rejectOpen"
      title="Reject this listing?"
      :consequence="`“${jobTitle}” stays private and the employer sees your reason.`"
      confirm-label="Reject listing"
      :loading="busy"
      @confirm="confirmReject"
    >
      <UiTextarea
        v-model="reason"
        label="Reason for rejection"
        required
        :error="reasonError"
        hint="Shared with the employer so they can correct and resubmit."
        placeholder="Explain what needs to change before this listing can be published."
        :rows="4"
      />
    </UiConfirmationDialog>
  </div>
</template>
