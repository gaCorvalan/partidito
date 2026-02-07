<template>
  <div class="sticky bottom-0 w-full bg-background border-t border-border p-4 z-10">
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
