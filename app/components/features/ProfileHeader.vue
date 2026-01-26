<template>
  <div class="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <button
      class="p-2 hover:bg-muted rounded-lg transition-colors"
      type="button"
      @click="$emit('edit')"
    >
      <Icon name="lucide:pencil" class="w-5 h-5 text-foreground" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  edit: []
}>()
</script>
