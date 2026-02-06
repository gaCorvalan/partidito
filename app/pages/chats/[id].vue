<script setup lang="ts">
import { computed } from 'vue'
import ChatHeader from '~/components/features/ChatHeader.vue'
import ChatMessageBubble from '~/components/features/ChatMessageBubble.vue'
import ChatComposer from '~/components/features/ChatComposer.vue'
import { useChatThread } from '~/composables/useChatThread'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { title, messages } = useChatThread(String(route.params.id))
const { user } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))

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

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="!isAuthenticated" class="h-full flex flex-col items-center justify-center text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:messages-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">Inicia sesion para chatear</p>
          <p class="text-xs text-muted-foreground">Necesitas una cuenta para participar.</p>
        </div>
        <button
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          type="button"
          @click="navigateTo(`/login?returnTo=${encodeURIComponent(route.fullPath)}`)"
        >
          Iniciar sesion
        </button>
      </div>
      <div v-else-if="!messages.length" class="h-full flex flex-col items-center justify-center text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:messages-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">Aun no hay mensajes</p>
          <p class="text-xs text-muted-foreground">
            Inicia la conversacion y organiza el partido.
          </p>
        </div>
      </div>
      <div v-else class="space-y-3">
        <ChatMessageBubble v-for="message in messages" :key="message.id" :message="message" />
      </div>
    </div>

    <ChatComposer v-if="isAuthenticated" @send="handleSend" />
  </div>
</template>
