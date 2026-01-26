<template>
  <button
    class="w-full p-4 border-b border-border hover:bg-muted transition-colors text-left"
    type="button"
    @click="$emit('open', id)"
  >
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-foreground text-sm">{{ title }}</h3>
      <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
    </div>
    <div class="flex items-center gap-1 text-xs text-muted-foreground mb-2">
      <Icon name="lucide:clock" class="w-3.5 h-3.5" />
      <span>{{ timeLabel }}</span>
    </div>
    <p class="text-sm text-muted-foreground truncate">{{ lastMessage }}</p>
    <div class="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
      <Icon name="lucide:message-square" class="w-3.5 h-3.5" />
      <span>{{ participants }} in chat</span>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  timeAgo: string
  timeLabel: string
  lastMessage: string
  participants: number
}>()

defineEmits<{
  open: [id: string]
}>()
</script>
