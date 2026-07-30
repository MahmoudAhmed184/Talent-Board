<script setup lang="ts">
/**
 * Radio group rendered as selectable cards.
 *
 * A real `<fieldset>`/`<legend>` plus native radios gives correct arrow-key
 * roving focus for free. The card is the `<label>`, so the whole surface is
 * clickable without any of it becoming an unlabelled `<div>`.
 */
import { useId } from 'vue'

export interface RadioOption<TValue extends string | number = string> {
  value: TValue
  label: string
  description?: string
  disabled?: boolean
}

const {
  columns = 1,
  error = '',
  legend,
  legendHidden = false,
  name,
  options,
  required = false,
} = defineProps<{
  columns?: 1 | 2 | 3
  error?: string
  legend: string
  legendHidden?: boolean
  name?: string
  options: readonly RadioOption<string | number>[]
  required?: boolean
}>()

const model = defineModel<string | number | null>({ default: null })

const groupName = name ?? useId()
const errorId = `${groupName}-error`

const columnClass: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}
</script>

<template>
  <fieldset :aria-describedby="error ? errorId : undefined" :aria-invalid="Boolean(error) || undefined">
    <legend
      class="mb-2 flex items-center gap-1.5 text-support font-medium text-text-secondary"
      :class="{ 'sr-only': legendHidden }"
    >
      {{ legend }}
      <span v-if="required" class="text-danger-fg" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only">(required)</span>
    </legend>

    <div class="grid gap-3" :class="columnClass[columns]">
      <label
        v-for="option in options"
        :key="option.value"
        class="group relative flex cursor-pointer items-start gap-3 rounded-card border bg-surface p-4 transition-[border-color,background-color,box-shadow] duration-[var(--duration-control)] ease-[var(--ease-standard)] has-[:checked]:border-accent has-[:checked]:bg-brand-50 has-[:checked]:shadow-raised has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
        :class="error ? 'border-danger-fg' : 'border-border hover:border-border-strong'"
      >
        <input
          v-model="model"
          type="radio"
          :name="groupName"
          :value="option.value"
          :disabled="option.disabled"
          :required="required"
          class="mt-0.5 size-4.5 shrink-0 cursor-pointer appearance-none rounded-full border border-border-strong bg-surface transition-colors duration-[var(--duration-instant)] checked:border-6 checked:border-accent disabled:cursor-not-allowed"
        >

        <span class="min-w-0">
          <span class="block text-support font-semibold text-text-primary">{{ option.label }}</span>
          <span v-if="option.description" class="mt-0.5 block text-meta text-text-muted">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>

    <p v-if="error" :id="errorId" role="alert" class="mt-2 text-meta font-medium text-danger-fg">
      {{ error }}
    </p>
  </fieldset>
</template>
