<script setup lang="ts">
/**
 * Labelled text input.
 *
 * Wraps UiFormField so a bare `<UiInput>` is always correctly labelled and
 * described. Use the `leading`/`trailing` slots for adornments rather than
 * absolutely positioning icons at the call site.
 */
import { computed, useSlots } from 'vue'
import UiFormField from './UiFormField.vue'
import { fieldClasses, type ControlSize } from './variants'

type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search' | 'date'

const {
  autocomplete,
  disabled = false,
  error = '',
  hint = '',
  inputmode,
  label,
  labelHidden = false,
  max,
  min,
  name,
  optional = false,
  placeholder,
  required = false,
  size = 'md',
  step,
  type = 'text',
} = defineProps<{
  autocomplete?: string
  disabled?: boolean
  error?: string
  hint?: string
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search'
  label: string
  labelHidden?: boolean
  max?: number | string
  min?: number | string
  name?: string
  optional?: boolean
  placeholder?: string
  required?: boolean
  size?: ControlSize
  step?: number | string
  type?: InputType
}>()

const model = defineModel<string | number | null>({ default: '' })

const slots = useSlots()
const hasLeading = computed(() => Boolean(slots.leading))

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement

  if (type === 'number') {
    model.value = target.value === '' ? null : target.valueAsNumber
    return
  }

  model.value = target.value
}
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
      <span
        v-if="slots.leading"
        class="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-text-faint"
      >
        <slot name="leading" />
      </span>

      <input
        :id="id"
        :name="name"
        :type="type"
        :value="model"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
        :class="fieldClasses(size, invalid, hasLeading)"
        @input="handleInput"
      >

      <span
        v-if="slots.trailing"
        class="absolute inset-y-0 right-0 flex items-center pr-2"
      >
        <slot name="trailing" />
      </span>
    </div>
  </UiFormField>
</template>
