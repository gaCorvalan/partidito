<template>
  <div class="sticky top-0 bg-background border-b border-border p-4">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
