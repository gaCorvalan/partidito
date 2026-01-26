<template>
  <div v-if="message.type === 'system'" class="flex justify-center">
    <p class="text-xs text-muted-foreground text-center px-3 py-1 bg-muted rounded-full">
      {{ message.text }}
    </p>
  </div>
  <div v-else :class="wrapperClass">
    <div :class="containerClass">
      <p class="text-xs text-muted-foreground px-3">{{ message.author }}</p>
      <div :class="bubbleClass">
        <p class="text-sm break-words">{{ message.text }}</p>
      </div>
      <p class="text-xs text-muted-foreground px-3">{{ message.time }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChatThread'

const props = defineProps<{
  message: ChatMessage
}>()

const wrapperClass = computed(() => {
  return props.message.type === 'outgoing'
    ? 'flex justify-end'
    : 'flex justify-start'
})

const containerClass = computed(() => {
  return props.message.type === 'outgoing'
    ? 'max-w-xs space-y-0.5 items-end flex flex-col'
    : 'max-w-xs space-y-0.5 items-start flex flex-col'
})

const bubbleClass = computed(() => {
  return props.message.type === 'outgoing'
    ? 'px-4 py-2 rounded-2xl bg-primary text-primary-foreground rounded-br-none'
    : 'px-4 py-2 rounded-2xl bg-muted text-foreground rounded-bl-none'
})
</script>
