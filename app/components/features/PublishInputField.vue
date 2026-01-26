<template>
  <div>
    <label class="block text-sm font-semibold text-foreground mb-2">{{ label }}</label>
    <component
      :is="as"
      class="w-full px-3 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      v-bind="inputAttrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string
    type?: string
    placeholder?: string
    as?: 'input' | 'textarea'
    rows?: number
  }>(),
  {
    type: 'text',
    placeholder: '',
    as: 'input'
  }
)

const inputAttrs = computed(() => {
  return props.as === 'textarea'
    ? { placeholder: props.placeholder, rows: props.rows, class: 'resize-none' }
    : { type: props.type, placeholder: props.placeholder }
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
