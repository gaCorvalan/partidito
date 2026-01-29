<script setup lang="ts">
import ChatHeader from '~/components/features/ChatHeader.vue'
import ChatMessageBubble from '~/components/features/ChatMessageBubble.vue'
import ChatComposer from '~/components/features/ChatComposer.vue'
import { useChatThread } from '~/composables/useChatThread'

const { title, messages } = useChatThread(String(route.params.id))

const handleBack = () => {
  navigateTo('/chats')
}

const handleSend = (message: string) => {
  if (!message.trim()) return
}
</script>

<template>
  <div class="h-full flex flex-col">
    <ChatHeader :title="title" @back="handleBack" />

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <ChatMessageBubble v-for="message in messages" :key="message.id" :message="message" />
    </div>

    <ChatComposer @send="handleSend" />
  </div>
</template>
