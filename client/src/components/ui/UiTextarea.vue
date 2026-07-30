<script setup lang="ts">
import { computed } from 'vue'
import UiFormField from './UiFormField.vue'
import { textareaClasses } from './variants'

const {
  disabled = false,
  error = '',
  hint = '',
  label,
  labelHidden = false,
  maxlength,
  name,
  optional = false,
  placeholder,
  required = false,
  rows = 5,
  showCount = false,
} = defineProps<{
  disabled?: boolean
  error?: string
  hint?: string
  label: string
  labelHidden?: boolean
  maxlength?: number
  name?: string
  optional?: boolean
  placeholder?: string
  required?: boolean
  rows?: number
  /** Shows a live character counter. Requires `maxlength`. */
  showCount?: boolean
}>()

const model = defineModel<string>({ default: '' })

const remaining = computed(() =>
  maxlength === undefined ? null : maxlength - (model.value?.length ?? 0),
)
</script>

<template>
  <UiFormField
    :label="label"
    :label-hidden="labelHidden"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
    v-slot="{ id, describedBy, invalid }"
  >
    <div class="grid gap-1">
      <textarea
        :id="id"
        v-model="model"
        :name="name"
        :rows="rows"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :maxlength="maxlength"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
        :class="textareaClasses(invalid)"
      />

      <!-- Polite so typing is not interrupted; only the count changes. -->
      <p
        v-if="showCount && remaining !== null"
        class="justify-self-end text-meta tabular-nums"
        :class="remaining < 0 ? 'text-danger-fg' : 'text-text-muted'"
        aria-live="polite"
      >
        {{ remaining }} characters left
      </p>
    </div>
  </UiFormField>
</template>
