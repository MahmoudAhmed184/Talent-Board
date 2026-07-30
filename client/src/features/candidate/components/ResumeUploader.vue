<script setup lang="ts">
/**
 * Resume upload with drag-and-drop.
 *
 * The drop zone is a `<label>` wrapping a real `<input type="file">`, so the
 * control is reachable by keyboard and operable with the platform file picker.
 * Drag-and-drop is an enhancement layered on top, never the only route.
 *
 * Constraints mirror the D4 contract: pdf/doc/docx, 10MB. They are checked
 * client-side purely to fail fast — the server remains the authority.
 */
import { computed, ref, useTemplateRef } from 'vue'
import { CloudUpload, FileText } from 'lucide-vue-next'
import { UiAlert, UiButton, UiProgress } from '@/components/ui'
import { formatFileSize } from '@/features/jobs/utils/formatters'

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const
const MAX_BYTES = 10 * 1024 * 1024

const { error = '', uploading = false, progress = 0 } = defineProps<{
  /** Server-side failure. Rendered alongside any local validation message. */
  error?: string
  progress?: number
  uploading?: boolean
}>()

const emit = defineEmits<{ upload: [file: File] }>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const localError = ref('')

const acceptAttr = [...ACCEPTED_EXTENSIONS, ...ACCEPTED_MIME_TYPES].join(',')
const hasFile = computed(() => selectedFile.value !== null)

function validate(file: File): string {
  const hasAllowedExtension = ACCEPTED_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  )

  // Some browsers report an empty or generic MIME type for .doc files, so the
  // extension is the reliable signal and the MIME type is a secondary check.
  if (!hasAllowedExtension) {
    return 'Choose a PDF, DOC, or DOCX file.'
  }

  if (file.size > MAX_BYTES) {
    return `That file is ${formatFileSize(file.size)}. The limit is 10 MB.`
  }

  if (file.size === 0) {
    return 'That file appears to be empty.'
  }

  return ''
}

function selectFile(file: File | undefined) {
  if (!file) {
    return
  }

  const message = validate(file)
  localError.value = message
  selectedFile.value = message ? null : file
}

function handleInputChange(event: Event) {
  selectFile((event.target as HTMLInputElement).files?.[0])
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  selectFile(event.dataTransfer?.files?.[0])
}

function submit() {
  if (selectedFile.value && !uploading) {
    emit('upload', selectedFile.value)
  }
}

/** Called by the parent once the upload has been accepted by the API. */
function reset() {
  selectedFile.value = null
  localError.value = ''

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

defineExpose({ reset })
</script>

<template>
  <div class="grid gap-4">
    <label
      class="flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors duration-[var(--duration-control)]"
      :class="
        isDragging
          ? 'border-accent bg-brand-50'
          : 'border-border-strong bg-surface-subtle hover:border-accent hover:bg-brand-50'
      "
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <CloudUpload class="mb-3 size-8 text-text-muted" aria-hidden="true" />

      <span class="text-support font-semibold text-text-primary">
        Drag a file here, or browse
      </span>
      <span class="mt-1 text-meta text-text-muted">PDF, DOC, or DOCX — up to 10 MB</span>

      <input
        ref="input"
        type="file"
        class="sr-only"
        :accept="acceptAttr"
        :disabled="uploading"
        @change="handleInputChange"
      >
    </label>

    <div
      v-if="hasFile"
      class="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
    >
      <FileText class="size-5 shrink-0 text-accent" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-support font-medium text-text-primary">
          {{ selectedFile?.name }}
        </p>
        <p class="text-meta text-text-muted">{{ formatFileSize(selectedFile?.size) }}</p>
      </div>
    </div>

    <UiProgress v-if="uploading" :value="progress" label="Uploading resume" />

    <UiAlert v-if="localError" tone="danger" title="That file cannot be uploaded">
      {{ localError }}
    </UiAlert>
    <UiAlert v-else-if="error" tone="danger" title="Upload failed">{{ error }}</UiAlert>

    <div class="flex justify-end">
      <UiButton :disabled="!hasFile" :loading="uploading" loading-label="Uploading resume" @click="submit">
        Upload resume
      </UiButton>
    </div>
  </div>
</template>
