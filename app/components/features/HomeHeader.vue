<template>
  <div class="sticky top-0 bg-background border-b border-border p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-balance">PlayMatch</h1>
      <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {{ userInitials }}
      </div>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="$emit('filter-change', filter.value)"
        :class="[
          'px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors',
          activeFilter === filter.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-secondary'
        ]"
      >
        {{ filter.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  filters: Array<{ label: string; value: string }>
  activeFilter: string
}>()

const userInitials = 'JD'

defineEmits<{
  'filter-change': [value: string]
}>()
</script>
