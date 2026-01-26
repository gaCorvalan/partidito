<template>
  <div>
    <label class="block text-sm font-semibold text-foreground mb-2">{{ label }}</label>
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          option.value === selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-secondary'
        ]"
        type="button"
        @click="$emit('select', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilterOption } from '~/composables/useSearchFilters'

defineProps<{
  label: string
  options: FilterOption[]
  selected: string
}>()

defineEmits<{
  select: [value: string]
}>()
</script>
