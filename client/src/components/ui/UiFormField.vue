<script setup lang="ts">
/**
 * Label, hint, and validation wrapper for a single control.
 *
 * The a11y wiring — `for`/`id`, `aria-describedby`, `aria-invalid`, and the
 * assertive live region for errors — is done once here and handed to the
 * control through slot props. Individual inputs never assemble it themselves.
 *
 * Design-system note: separate `Label`, `HelperText`, and `ValidationMessage`
 * components were deliberately not created. Split apart they carry no styling
 * decision of their own and make it possible to render a label without its
 * error, which is the failure this component exists to prevent.
 */
import { computed, useId } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

const {
  error = '',
  hint = '',
  id,
  label,
  labelHidden = false,
  optional = false,
  required = false,
} = defineProps<{
  /** Field-level validation message. Presence also drives `aria-invalid`. */
  error?: string
  /** Guidance shown before the user makes a mistake. */
  hint?: string
  /** Supply to control the id; otherwise one is generated. */
  id?: string
  label: string
  /** Keeps the label for assistive tech while hiding it visually. */
  labelHidden?: boolean
  /** Renders an explicit "Optional" marker. */
  optional?: boolean
  required?: boolean
}>()

const generatedId = useId()
const fieldId = computed(() => id ?? generatedId)
const hintId = computed(() => `${fieldId.value}-hint`)
const errorId = computed(() => `${fieldId.value}-error`)

const describedBy = computed(() => {
  const ids = [hint ? hintId.value : null, error ? errorId.value : null].filter(Boolean)

  return ids.length > 0 ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="grid gap-1.5">
    <label
      :for="fieldId"
      class="flex items-center gap-1.5 text-support font-medium text-text-secondary"
      :class="{ 'sr-only': labelHidden }"
    >
      {{ label }}
      <span v-if="required" class="text-danger-fg" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only">(required)</span>
      <span v-else-if="optional" class="text-meta font-normal text-text-muted">Optional</span>
    </label>

    <slot
      :id="fieldId"
      :described-by="describedBy"
      :invalid="Boolean(error)"
      :required="required"
    />

    <p v-if="hint" :id="hintId" class="text-meta text-text-muted">
      {{ hint }}
    </p>

    <!--
      Errors are announced as they appear. `role="alert"` rather than a polite
      region because a validation failure blocks the user's next action.
    -->
    <p
      v-if="error"
      :id="errorId"
      role="alert"
      class="flex items-start gap-1.5 text-meta font-medium text-danger-fg"
    >
      <AlertCircle class="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>
