<template>
  <div class="sticky top-0 bg-background border-b border-border p-4 space-y-4">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <div class="relative">
      <Icon
        name="lucide:search"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5"
      />
      <input
        type="text"
        :placeholder="placeholder"
        class="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  placeholder: string
}>()
</script>
