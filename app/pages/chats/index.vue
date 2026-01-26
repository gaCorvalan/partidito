<script setup lang="ts">
import ChatsHeader from '~/components/features/ChatsHeader.vue'
import ChatListItem from '~/components/features/ChatListItem.vue'
import { useChatsList } from '~/composables/useChatsList'

const { chats } = useChatsList()

const handleOpen = (id: string) => {
  navigateTo(`/chats/${id}`)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <ChatsHeader title="Chats" />

    <div class="flex-1 overflow-y-auto">
      <div class="space-y-0">
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
