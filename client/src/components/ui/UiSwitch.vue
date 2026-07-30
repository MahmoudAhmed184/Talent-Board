<script setup lang="ts">
/**
 * Toggle for settings that take effect immediately.
 *
 * Only use this where there is no Save button — a switch that needs
 * confirmation should be a checkbox. Built on reka-ui so the `role="switch"`
 * semantics and keyboard handling are not re-implemented.
 */
import { useId } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'

const { description, disabled = false, label } = defineProps<{
  description?: string
  disabled?: boolean
  label: string
}>()

const model = defineModel<boolean>({ default: false })

const labelId = useId()
const descriptionId = `${labelId}-description`
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <span class="min-w-0">
      <span :id="labelId" class="block text-support font-medium text-text-primary">{{ label }}</span>
      <span v-if="description" :id="descriptionId" class="mt-0.5 block text-meta text-text-muted">
        {{ description }}
      </span>
    </span>

    <SwitchRoot
      v-model="model"
      :disabled="disabled"
      :aria-labelledby="labelId"
      :aria-describedby="description ? descriptionId : undefined"
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border border-transparent bg-border-strong transition-colors duration-[var(--duration-control)] ease-[var(--ease-standard)] data-[state=checked]:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      <SwitchThumb
        class="block size-5 translate-x-0.5 rounded-full bg-surface shadow-raised transition-transform duration-[var(--duration-control)] ease-[var(--ease-standard)] data-[state=checked]:translate-x-[1.375rem]"
      />
    </SwitchRoot>
  </div>
</template>
