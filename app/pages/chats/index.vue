<script setup lang="ts">
import { computed } from 'vue'
import ChatsHeader from '~/components/features/ChatsHeader.vue'
import ChatListItem from '~/components/features/ChatListItem.vue'
import { useChatsList } from '~/composables/useChatsList'
import { useAuth } from '~/composables/useAuth'

const { t } = useI18n()
const { chats } = useChatsList()
const { user } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))

const handleOpen = (id: string) => {
  navigateTo(`/chats/${id}`)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <ChatsHeader :title="t('chats.title')" />

    <div class="flex-1 overflow-y-auto">
      <div v-if="!isAuthenticated" class="p-6 text-center space-y-3">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:message-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">{{ t('chats.signIn.title') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('chats.signIn.desc') }}
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          type="button"
          @click="navigateTo(`/login?returnTo=${encodeURIComponent('/chats')}`)"
        >
          {{ t('chats.signIn.cta') }}
        </button>
      </div>
      <div v-else-if="!chats.length" class="p-6 text-center space-y-3">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:message-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">{{ t('chats.empty.title') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('chats.empty.desc') }}
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          type="button"
          @click="navigateTo('/')"
        >
          {{ t('chats.empty.cta') }}
        </button>
      </div>
      <div v-else class="space-y-0">
        <ChatListItem
          v-for="chat in chats"
          :key="chat.id"
          :id="chat.id"
          :title="chat.title"
          :time-ago="chat.timeAgo"
          :time-label="chat.timeLabel"
          :last-message="chat.lastMessage"
          :participants="chat.participants"
          @open="handleOpen"
        />
      </div>
    </div>
  </div>
</template>
