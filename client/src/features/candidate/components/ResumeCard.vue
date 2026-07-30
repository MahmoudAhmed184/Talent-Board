<script setup lang="ts">
/**
 * One stored resume.
 *
 * The default-resume state is shown as a badge *and* the radio-style action
 * changes wording, so "which one will be used" never depends on a highlight
 * colour alone.
 */
import { FileText, Star, Trash2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiIconButton } from '@/components/ui'
import { formatFileSize, formatRelative } from '@/features/jobs/utils/formatters'
import type { Resume } from '../types'

const { busy = false, isDefault = false, resume } = defineProps<{
  busy?: boolean
  isDefault?: boolean
  resume: Resume
}>()

const emit = defineEmits<{
  'make-default': [resume: Resume]
  delete: [resume: Resume]
}>()
</script>

<template>
  <article
    class="flex flex-wrap items-center gap-4 rounded-card border bg-surface p-4"
    :class="isDefault ? 'border-accent' : 'border-border'"
  >
    <span class="flex size-10 shrink-0 items-center justify-center rounded-field bg-surface-sunken">
      <FileText class="size-5 text-text-muted" aria-hidden="true" />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="min-w-0 truncate text-support font-semibold text-text-primary">
          {{ resume.original_name }}
        </h3>
        <UiBadge v-if="isDefault" tone="accent" size="sm">
          <template #icon><Star class="size-3" aria-hidden="true" /></template>
          Default
        </UiBadge>
      </div>

      <p class="mt-0.5 text-meta text-text-muted">
        {{ formatFileSize(resume.size) }} · Uploaded {{ formatRelative(resume.created_at) }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <UiButton
        v-if="!isDefault"
        size="sm"
        variant="secondary"
        :disabled="busy"
        @click="emit('make-default', resume)"
      >
        Use by default
      </UiButton>

      <UiIconButton
        variant="danger-ghost"
        size="sm"
        :label="`Delete ${resume.original_name}`"
        :disabled="busy"
        @click="emit('delete', resume)"
      >
        <Trash2 class="size-4" aria-hidden="true" />
      </UiIconButton>
    </div>
  </article>
</template>
