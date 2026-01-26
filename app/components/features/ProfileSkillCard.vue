<template>
  <div class="bg-card border border-border rounded-xl p-4">
    <div class="flex items-center justify-between mb-2">
      <span class="font-semibold text-foreground capitalize">{{ name }}</span>
      <span class="text-sm px-3 py-1 bg-primary/20 text-primary rounded-full capitalize font-medium">
        {{ level }}
      </span>
    </div>
    <div class="w-full bg-muted rounded-full h-2">
      <div class="bg-primary h-2 rounded-full" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  level: string
  progress: number
}>()
</script>
