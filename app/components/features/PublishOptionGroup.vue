<template>
  <div>
    <label class="block text-sm font-semibold text-foreground mb-2">{{ label }}</label>
    <div class="flex gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          'flex-1 py-2 rounded-lg font-medium transition-colors',
          option.value === modelValue
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-secondary'
        ]"
        type="button"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublishOption } from '~/composables/usePublishForm'

defineProps<{
  label: string
  options: PublishOption[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
