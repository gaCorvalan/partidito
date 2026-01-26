<template>
  <div
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-background border-t border-border md:left-0 md:translate-x-0 md:max-w-none"
  >
    <button
      class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
      type="button"
      @click="$emit('submit')"
    >
      {{ label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

defineEmits<{
  submit: []
}>()
</script>
