<script setup lang="ts">
/**
 * Company logo upload with live preview.
 *
 * Rewritten onto the design system: the previous version used a native
 * `confirm()` for removal (unstyleable, not focus-managed, and blocking) and
 * untyped `any` error handling. Removal now goes through UiConfirmationDialog
 * like every other destructive action in the app.
 *
 * The preview is optimistic and reverts if the upload fails, so the employer
 * never believes a failed upload succeeded.
 */
import { computed, ref, useTemplateRef } from 'vue'
import { ImageUp, Trash2 } from 'lucide-vue-next'
import { UiAlert, UiButton, UiCompanyLogo, UiConfirmationDialog } from '@/components/ui'
import { http } from '@/http'
import { formatFileSize } from '@/features/jobs/utils/formatters'

const ACCEPTED = 'image/png,image/jpeg,image/jpg,image/svg+xml'
const MAX_BYTES = 2 * 1024 * 1024

const { companyName, currentLogoUrl, disabled = false } = defineProps<{
  companyName?: string | null
  currentLogoUrl?: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  uploaded: [profile: unknown]
  deleted: []
}>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const previewUrl = ref<string | null>(null)
const uploading = ref(false)
const deleting = ref(false)
const confirmOpen = ref(false)
const errorMessage = ref('')

const shownLogo = computed(() => previewUrl.value ?? currentLogoUrl ?? null)
const hasLogo = computed(() => Boolean(shownLogo.value))

function readErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message

    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file) {
    return
  }

  errorMessage.value = ''

  if (file.size > MAX_BYTES) {
    errorMessage.value = `That image is ${formatFileSize(file.size)}. The limit is 2 MB.`
    resetInput()
    return
  }

  const reader = new FileReader()
  reader.onload = (loaded) => {
    previewUrl.value = loaded.target?.result as string
  }
  reader.readAsDataURL(file)

  void upload(file)
}

async function upload(file: File) {
  uploading.value = true

  const formData = new FormData()
  formData.append('logo_file', file)
  // Laravel does not parse multipart bodies on PATCH, so the request is POSTed
  // with a method override — matching `PATCH /api/v1/employer/profile`.
  formData.append('_method', 'PATCH')

  try {
    const response = await http.post('/api/v1/employer/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    emit('uploaded', response.data.data)
  } catch (error) {
    errorMessage.value = readErrorMessage(error, 'Your logo could not be uploaded.')
    previewUrl.value = null
    resetInput()
  } finally {
    uploading.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  errorMessage.value = ''

  try {
    await http.delete('/api/v1/employer/company-logo')
    previewUrl.value = null
    resetInput()
    confirmOpen.value = false
    emit('deleted')
  } catch (error) {
    errorMessage.value = readErrorMessage(error, 'Your logo could not be removed.')
  } finally {
    deleting.value = false
  }
}

function resetInput() {
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-6">
      <UiCompanyLogo :name="companyName" :src="shownLogo" size="lg" />

      <div class="grid gap-3">
        <div class="flex flex-wrap gap-2">
          <UiButton
            variant="secondary"
            :disabled="disabled || deleting"
            :loading="uploading"
            loading-label="Uploading your logo"
            @click="inputRef?.click()"
          >
            <template #icon><ImageUp class="size-4" aria-hidden="true" /></template>
            {{ hasLogo ? 'Replace logo' : 'Upload logo' }}
          </UiButton>

          <UiButton
            v-if="hasLogo"
            variant="danger-ghost"
            :disabled="disabled || uploading"
            @click="confirmOpen = true"
          >
            <template #icon><Trash2 class="size-4" aria-hidden="true" /></template>
            Remove
          </UiButton>
        </div>

        <p class="max-w-xs text-meta text-text-muted">
          PNG, JPG, or SVG, up to 2 MB. Shown next to your company name on every
          listing.
        </p>
      </div>

      <input
        ref="input"
        type="file"
        class="sr-only"
        :accept="ACCEPTED"
        :disabled="disabled || uploading || deleting"
        @change="handleFileSelect"
      >
    </div>

    <UiAlert v-if="errorMessage" tone="danger" title="That did not work">
      {{ errorMessage }}
    </UiAlert>

    <UiConfirmationDialog
      v-model:open="confirmOpen"
      title="Remove your company logo?"
      consequence="Your listings will show your company initial instead. You can upload a new logo at any time."
      confirm-label="Remove logo"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
