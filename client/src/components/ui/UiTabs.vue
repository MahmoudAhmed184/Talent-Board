<script setup lang="ts">
/**
 * Tab set with an animated active indicator.
 *
 * The indicator is a shared-layout element (motion-v `layoutId`) so it slides
 * between tabs instead of cross-fading. Arrow-key roving focus and the
 * tab/tabpanel wiring come from reka-ui.
 */
import { TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import UiBadge from './UiBadge.vue'

export interface TabItem {
  value: string
  label: string
  /** Optional count shown alongside the label, e.g. queue size. */
  count?: number
}

const { items } = defineProps<{ items: readonly TabItem[] }>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <TabsRoot v-model="model">
    <TabsList
      class="relative flex gap-1 overflow-x-auto border-b border-border"
      :aria-label="$attrs['aria-label'] as string | undefined"
    >
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        class="relative flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-t-control px-3 text-support font-semibold text-text-muted outline-none transition-colors duration-[var(--duration-control)] hover:text-text-primary data-[state=active]:text-accent"
      >
        {{ item.label }}
        <UiBadge v-if="item.count !== undefined" size="sm" tone="neutral">
          {{ item.count }}
        </UiBadge>
      </TabsTrigger>

      <!--
        reka-ui positions this element under the active trigger and animates it
        with a CSS transition driven by the same tokens as the rest of the app.
      -->
      <TabsIndicator
        class="absolute bottom-0 left-0 h-0.5 w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] rounded-pill bg-accent transition-[width,transform] duration-[var(--duration-element)] ease-[var(--ease-entrance)] motion-reduce:transition-none"
      />
    </TabsList>

    <slot />
  </TabsRoot>
</template>
