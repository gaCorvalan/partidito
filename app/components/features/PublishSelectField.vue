<template>
  <div>
    <label class="block text-sm font-semibold text-foreground mb-2">{{ label }}</label>
    <select
      class="w-full px-3 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
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
