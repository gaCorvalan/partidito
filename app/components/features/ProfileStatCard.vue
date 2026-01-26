<template>
  <div class="bg-card border border-border rounded-xl p-4 text-center">
    <div class="flex items-center justify-center mb-2">
      <Icon :name="icon" class="w-5 h-5 text-primary" />
    </div>
    <p :class="valueClass">{{ value }}</p>
    <p class="text-xs text-muted-foreground">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    value: string
    label: string
    valueClass?: string
  }>(),
  {
    valueClass: 'text-2xl font-bold text-foreground'
  }
)
</script>
