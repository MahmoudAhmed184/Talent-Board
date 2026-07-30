<script setup lang="ts">
/**
 * Free-text token entry, used for candidate skills.
 *
 * Tokens commit on Enter or comma and are removed with Backspace from an empty
 * field or via each token's own button — so the control is fully operable from
 * the keyboard without discovering any hidden gesture. Every change is
 * announced through a polite live region, because removing a token otherwise
 * gives a screen-reader user no feedback at all.
 */
import { computed, ref, useTemplateRef } from 'vue'
import { X } from 'lucide-vue-next'
import { AnimatePresence, motion } from 'motion-v'
import UiFormField from './UiFormField.vue'
import { chipTransition, useMotionPreset } from '../../design/motion'

const {
  error = '',
  hint = '',
  label,
  maxTags = 30,
  placeholder = 'Type a skill and press Enter',
} = defineProps<{
  error?: string
  hint?: string
  label: string
  maxTags?: number
  placeholder?: string
}>()

const model = defineModel<string[]>({ default: () => [] })

const draft = ref('')
const announcement = ref('')
const inputRef = useTemplateRef<HTMLInputElement>('input')
const chip = useMotionPreset(chipTransition)

const isFull = computed(() => model.value.length >= maxTags)

function addTag() {
  const value = draft.value.trim().replace(/,$/, '')

  if (!value || isFull.value) {
    return
  }

  // Case-insensitive de-duplication: "Vue" and "vue" are the same skill.
  const exists = model.value.some((tag) => tag.toLowerCase() === value.toLowerCase())

  if (exists) {
    announcement.value = `${value} is already in the list`
    draft.value = ''
    return
  }

  model.value = [...model.value, value]
  announcement.value = `${value} added`
  draft.value = ''
}

function removeTag(tag: string) {
  model.value = model.value.filter((item) => item !== tag)
  announcement.value = `${tag} removed`
  inputRef.value?.focus()
}

function handleBackspace() {
  if (draft.value === '' && model.value.length > 0) {
    removeTag(model.value[model.value.length - 1])
  }
}
</script>

<template>
  <UiFormField
    :label="label"
    :hint="hint || `Press Enter or comma to add. Up to ${maxTags}.`"
    :error="error"
    v-slot="{ id, describedBy, invalid }"
  >
    <div
      class="flex flex-wrap items-center gap-2 rounded-field border bg-surface p-2 transition-[border-color] duration-[var(--duration-control)] focus-within:border-accent"
      :class="invalid ? 'border-danger-fg' : 'border-border'"
      @click="inputRef?.focus()"
    >
      <AnimatePresence>
        <motion.span
          v-for="tag in model"
          :key="tag"
          layout
          class="inline-flex h-8 max-w-full items-center gap-1 rounded-pill border border-brand-200 bg-brand-100 pl-3 pr-1 text-meta font-semibold text-brand-900"
          v-bind="chip"
        >
          <span class="truncate">{{ tag }}</span>
          <button
            type="button"
            class="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--duration-instant)] hover:bg-brand-200"
            @click.stop="removeTag(tag)"
          >
            <X class="size-3.5" aria-hidden="true" />
            <span class="sr-only">Remove {{ tag }}</span>
          </button>
        </motion.span>
      </AnimatePresence>

      <input
        :id="id"
        ref="input"
        v-model="draft"
        type="text"
        :placeholder="isFull ? `Limit of ${maxTags} reached` : placeholder"
        :disabled="isFull"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        class="h-9 min-w-40 flex-1 bg-transparent px-1.5 text-support text-text-primary outline-none placeholder:text-text-faint disabled:cursor-not-allowed"
        @keydown.enter.prevent="addTag"
        @keydown="$event.key === ',' && ($event.preventDefault(), addTag())"
        @keydown.backspace="handleBackspace"
        @blur="addTag"
      >
    </div>

    <span class="sr-only" aria-live="polite">{{ announcement }}</span>
  </UiFormField>
</template>
