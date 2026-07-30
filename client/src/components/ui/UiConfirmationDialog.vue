<script setup lang="ts">
/**
 * Confirmation gate for destructive or irreversible actions.
 *
 * Deliberately opinionated:
 *  - Cancel comes first in the DOM so it takes focus, making Enter safe.
 *  - The confirm button says what it does ("Withdraw application"), never "OK".
 *  - `consequence` states what cannot be undone, in the user's terms.
 *  - The dialog stays open and shows `error` when the request fails, rather
 *    than closing and leaving a toast as the only trace.
 */
import UiAlert from './UiAlert.vue'
import UiButton from './UiButton.vue'
import UiDialog from './UiDialog.vue'
import type { ButtonVariant } from './variants'

const {
  cancelLabel = 'Cancel',
  confirmLabel,
  confirmVariant = 'danger',
  consequence,
  error = '',
  loading = false,
  title,
} = defineProps<{
  cancelLabel?: string
  /** Names the action, e.g. "Withdraw application". Never "OK" or "Yes". */
  confirmLabel: string
  confirmVariant?: ButtonVariant
  /** What will happen and what cannot be undone. */
  consequence?: string
  /** Failure from the confirm handler. Keeps the dialog open. */
  error?: string
  loading?: boolean
  title: string
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const open = defineModel<boolean>('open', { default: false })

function cancel() {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <UiDialog v-model:open="open" :title="title" :description="consequence" size="sm" :dismissible="!loading">
    <div class="grid gap-4">
      <slot />
      <UiAlert v-if="error" tone="danger" title="That did not work">{{ error }}</UiAlert>
    </div>

    <template #footer>
      <UiButton variant="secondary" :disabled="loading" @click="cancel">
        {{ cancelLabel }}
      </UiButton>
      <UiButton
        :variant="confirmVariant"
        :loading="loading"
        :loading-label="`${confirmLabel} in progress`"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </UiButton>
    </template>
  </UiDialog>
</template>
