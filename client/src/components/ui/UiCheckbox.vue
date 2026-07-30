<script setup lang="ts">
/**
 * Checkbox built on the native input so keyboard, form submission, and
 * indeterminate state all behave without re-implementation. The visual box is
 * a sibling element; the input itself stays in the accessibility tree.
 */
import { useId } from 'vue'
import { Check, Minus } from 'lucide-vue-next'

const {
  description,
  disabled = false,
  indeterminate = false,
  label,
  name,
  value,
} = defineProps<{
  /** Supporting line rendered under the label. */
  description?: string
  disabled?: boolean
  indeterminate?: boolean
  label: string
  name?: string
  value?: string | number
}>()

const model = defineModel<boolean | Array<string | number>>({ default: false })

const inputId = useId()
const descriptionId = `${inputId}-description`
</script>

<template>
  <div class="flex items-start gap-3">
    <span class="relative flex size-5 shrink-0 items-center justify-center">
      <input
        :id="inputId"
        v-model="model"
        type="checkbox"
        :name="name"
        :value="value"
        :disabled="disabled"
        :indeterminate="indeterminate"
        :aria-describedby="description ? descriptionId : undefined"
        class="peer size-5 cursor-pointer appearance-none rounded-[0.3rem] border border-border-strong bg-surface transition-colors duration-[var(--duration-instant)] checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent disabled:cursor-not-allowed disabled:bg-surface-sunken"
      >
      <Minus
        v-if="indeterminate"
        class="pointer-events-none absolute size-3.5 text-text-inverse"
        aria-hidden="true"
      />
      <Check
        v-else
        class="pointer-events-none absolute size-3.5 text-text-inverse opacity-0 transition-opacity duration-[var(--duration-instant)] peer-checked:opacity-100"
        aria-hidden="true"
      />
    </span>

    <span class="min-w-0">
      <label
        :for="inputId"
        class="block cursor-pointer text-support font-medium text-text-primary"
        :class="{ 'cursor-not-allowed text-text-faint': disabled }"
      >
        {{ label }}
      </label>
      <span v-if="description" :id="descriptionId" class="mt-0.5 block text-meta text-text-muted">
        {{ description }}
      </span>
    </span>
  </div>
</template>
