<script setup lang="ts">
import { computed } from 'vue'
import ChatsHeader from '~/components/features/ChatsHeader.vue'
import ChatListItem from '~/components/features/ChatListItem.vue'
import { useChatsList } from '~/composables/useChatsList'
import { useAuth } from '~/composables/useAuth'

const { chats } = useChatsList()
const { user } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))

const handleOpen = (id: string) => {
  navigateTo(`/chats/${id}`)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <ChatsHeader title="Chats" />

    <div class="flex-1 overflow-y-auto">
      <div v-if="!isAuthenticated" class="p-6 text-center space-y-3">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:message-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">Inicia sesion para ver tus chats</p>
          <p class="text-xs text-muted-foreground">
            Necesitas una cuenta para acceder a las conversaciones.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          type="button"
          @click="navigateTo(`/login?returnTo=${encodeURIComponent('/chats')}`)"
        >
          Iniciar sesion
        </button>
      </div>
      <div v-else-if="!chats.length" class="p-6 text-center space-y-3">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon name="lucide:message-square" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">Aun no tienes conversaciones</p>
          <p class="text-xs text-muted-foreground">
            Cuando te unas a un partido, el chat aparecera aqui.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          type="button"
          @click="navigateTo('/')"
        >
          Explorar partidos
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
