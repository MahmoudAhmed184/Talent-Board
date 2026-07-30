<script setup lang="ts">
/**
 * Search field with a clear affordance.
 *
 * Emits `submit` on Enter so it can be used inside or outside a `<form>`, and
 * announces the clear action rather than relying on the icon alone.
 */
import { computed, useId, useTemplateRef } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { fieldClasses, type ControlSize } from './variants'

const {
  disabled = false,
  label,
  labelHidden = true,
  name,
  placeholder = 'Search',
  size = 'md',
  tone = 'light',
} = defineProps<{
  disabled?: boolean
  /** Accessible name. Hidden by default because the icon plus placeholder
   *  already reads correctly for sighted users. */
  label: string
  labelHidden?: boolean
  name?: string
  placeholder?: string
  size?: ControlSize
  /** `dark` inverts the field for use inside the dark navigation band. */
  tone?: 'light' | 'dark'
}>()

const emit = defineEmits<{ submit: []; clear: [] }>()

const model = defineModel<string>({ default: '' })
const inputId = useId()
const inputRef = useTemplateRef<HTMLInputElement>('input')

const hasValue = computed(() => model.value.length > 0)

const toneClasses = computed(() =>
  tone === 'dark'
    ? 'border-border-inverse bg-ink-800 text-text-inverse placeholder:text-text-inverse-muted hover:border-muted-600'
    : '',
)

function clear() {
  model.value = ''
  emit('clear')
  inputRef.value?.focus()
}
</script>

<template>
  <div class="relative">
    <label :for="inputId" :class="labelHidden ? 'sr-only' : 'mb-1.5 block text-support font-medium'">
      {{ label }}
    </label>

    <Search
      class="pointer-events-none absolute left-3.5 size-4 -translate-y-1/2 text-text-faint"
      :class="[labelHidden ? 'top-1/2' : 'top-[calc(50%+0.9rem)]', tone === 'dark' ? 'text-text-inverse-muted' : '']"
      aria-hidden="true"
    />

    <input
      :id="inputId"
      ref="input"
      v-model="model"
      type="search"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[fieldClasses(size, false, true), toneClasses, hasValue ? 'pr-11' : '']"
      @keydown.enter.prevent="emit('submit')"
    >

    <button
      v-if="hasValue"
      type="button"
      class="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-text-muted transition-colors duration-[var(--duration-instant)] hover:bg-surface-sunken hover:text-text-primary"
      :class="[
        labelHidden ? '' : 'top-[calc(50%+0.9rem)]',
        tone === 'dark' ? 'text-text-inverse-muted hover:bg-ink-700 hover:text-text-inverse' : '',
      ]"
      @click="clear"
    >
      <X class="size-4" aria-hidden="true" />
      <span class="sr-only">Clear search</span>
    </button>
  </div>
</template>
