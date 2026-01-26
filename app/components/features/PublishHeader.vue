<template>
  <div class="sticky top-0 border-b border-border p-4 bg-background">
    <div class="flex items-center gap-3 mb-4">
      <button class="p-1 hover:bg-muted rounded-lg transition-colors" type="button" @click="$emit('back')">
        <Icon name="lucide:chevron-left" class="w-6 h-6 text-foreground" />
      </button>
      <h1 class="text-2xl font-bold">{{ title }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  back: []
}>()
</script>
