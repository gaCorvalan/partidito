<script setup lang="ts">
import { computed } from 'vue'
import ChatHeader from '~/components/features/ChatHeader.vue'
import ChatMessageBubble from '~/components/features/ChatMessageBubble.vue'
import ChatComposer from '~/components/features/ChatComposer.vue'
import { useChatThread } from '~/composables/useChatThread'
import { useAuth } from '~/composables/useAuth'
import { useMatchDetail } from '~/composables/useMatchDetail'
import { useChatMessaging } from '~/composables/useChatMessaging'

const route = useRoute()
const { t } = useI18n()
const matchId = String(route.params.id)
const { title, messages } = useChatThread(matchId)
const { isJoined, permissions } = useMatchDetail(matchId)
const { sendMessage, error: chatError } = useChatMessaging()
const { user } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))
const canViewChat = computed(() => isAuthenticated.value && (isJoined.value || permissions.value.isHost))
const canWriteChat = computed(() => canViewChat.value && permissions.value.canWriteChat)

const handleBack = () => {
  navigateTo('/chats')
}

const handleSend = async (message: string) => {
  if (!canWriteChat.value) return
  await sendMessage(matchId, message, route.fullPath)
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
          <p class="text-sm font-semibold text-foreground">{{ t('chat.signIn.title') }}</p>
          <p class="text-xs text-muted-foreground">{{ t('chat.signIn.desc') }}</p>
        </div>
        <button
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          type="button"
          @click="navigateTo(`/login?returnTo=${encodeURIComponent(route.fullPath)}`)"
        >
          {{ t('chats.signIn.cta') }}
        </button>
      </div>
      <div
        v-else-if="!canViewChat"
        class="h-full flex flex-col items-center justify-center text-center space-y-3"
      >
        <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:lock" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">{{ t('chat.noAccess.title') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('chat.noAccess.desc') }}
          </p>
        </div>
      </div>
      <div
        v-else-if="!canWriteChat"
        class="h-full flex flex-col items-center justify-center text-center space-y-3"
      >
        <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:lock" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">{{ t('chat.closed.title') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('chat.closed.desc') }}
          </p>
        </div>
      </div>
      <div v-else-if="!messages.length" class="h-full flex flex-col items-center justify-center text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:messages-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">{{ t('chat.empty.title') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('chat.empty.desc') }}
          </p>
        </div>
      </div>
      <div v-else class="space-y-3">
        <ChatMessageBubble v-for="message in messages" :key="message.id" :message="message" />
      </div>
      <div v-if="chatError" class="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
        {{ chatError }}
      </div>
    </div>

    <ChatComposer v-if="canWriteChat" @send="handleSend" />
  </div>
</template>
