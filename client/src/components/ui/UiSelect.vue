<script setup lang="ts">
/**
 * Labelled select built on the native `<select>`.
 *
 * Native is deliberate: it gives correct keyboard behaviour, the platform
 * picker on mobile, and works before hydration. Use UiCombobox instead only
 * when the option list is long enough to need filtering.
 */
import { ChevronDown } from 'lucide-vue-next'
import UiFormField from './UiFormField.vue'
import { fieldClasses, type ControlSize } from './variants'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

const {
  disabled = false,
  error = '',
  hint = '',
  label,
  labelHidden = false,
  name,
  optional = false,
  options,
  placeholder,
  required = false,
  size = 'md',
} = defineProps<{
  disabled?: boolean
  error?: string
  hint?: string
  label: string
  labelHidden?: boolean
  name?: string
  optional?: boolean
  options: readonly SelectOption[]
  /** Rendered as the empty choice. Omit to force an explicit selection. */
  placeholder?: string
  required?: boolean
  size?: ControlSize
}>()

const model = defineModel<string | number | null>({ default: null })
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
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        :name="name"
        :required="required"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
        :class="[fieldClasses(size, invalid), 'appearance-none pr-10']"
      >
        <option v-if="placeholder" :value="null">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <ChevronDown
        class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-faint"
        aria-hidden="true"
      />
    </div>
  </UiFormField>
</template>
