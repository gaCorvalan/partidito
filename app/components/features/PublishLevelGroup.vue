<template>
  <div>
    <label class="block text-sm font-semibold text-foreground mb-2">{{ label }}</label>
    <div class="space-y-2">
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          'w-full py-2 px-3 rounded-lg font-medium text-sm transition-colors text-left capitalize',
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
