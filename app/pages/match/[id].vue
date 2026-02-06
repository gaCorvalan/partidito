<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatMessageBubble from '~/components/features/ChatMessageBubble.vue'
import ChatComposer from '~/components/features/ChatComposer.vue'
import { useChatThread } from '~/composables/useChatThread'
import { useMatchDetail } from '~/composables/useMatchDetail'

const route = useRoute()
const activeTab = ref<'info' | 'chat'>('info')

const { match, isJoined, statusLabel, toggleJoin, joinStatus } = useMatchDetail(String(route.params.id))
const { messages } = useChatThread(String(route.params.id))

const joinLabel = computed(() => (isJoined.value ? 'Leave match' : 'Join match'))

const handleBack = () => {
  navigateTo('/')
}

const handleShare = () => {
  // Placeholder para compartir
}

const handleCancel = () => {
  // Placeholder para cancelar
}

const handleSend = (message: string) => {
  if (!message.trim()) return
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="sticky top-0 bg-background border-b border-border p-4">
      <div class="flex items-center justify-between">
        <button class="p-2 hover:bg-muted rounded-lg transition-colors" type="button" @click="handleBack">
          <Icon name="lucide:chevron-left" class="w-5 h-5 text-foreground" />
        </button>
        <h1 class="text-lg font-semibold text-foreground">Match details</h1>
        <button class="p-2 hover:bg-muted rounded-lg transition-colors" type="button" @click="handleShare">
          <Icon name="lucide:share-2" class="w-5 h-5 text-foreground" />
        </button>
      </div>
    </div>

    <div class="border-b border-border bg-background">
      <div class="flex">
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'"
          type="button"
          @click="activeTab = 'info'"
        >
          Info
        </button>
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="activeTab === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'"
          type="button"
          @click="activeTab = 'chat'"
        >
          Chat
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="activeTab === 'info'" class="p-4 space-y-4">
        <div class="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <h3 class="font-semibold text-sm text-foreground capitalize">{{ match.sport }} · {{ match.level }}</h3>
              <span
                class="inline-block px-2 py-1 rounded-full text-xs font-medium"
                :class="match.isFull ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700'"
              >
                {{ statusLabel }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-foreground">${{ match.price }}</p>
              <p class="text-xs text-muted-foreground">per player</p>
            </div>
          </div>
          <div class="space-y-1.5 text-sm text-card-foreground">
            <p class="font-medium">{{ match.dateDisplay }}</p>
            <div class="flex items-center gap-1 text-muted-foreground">
              <Icon name="lucide:map-pin" class="w-4 h-4" />
              <span>{{ match.location }}</span>
              <span class="text-xs">· {{ match.distance }} km</span>
            </div>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-border">
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <div
                  v-for="(player, index) in match.players"
                  :key="index"
                  class="w-7 h-7 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs text-primary font-bold"
                >
                  {{ player }}
                </div>
              </div>
              <span class="text-sm text-muted-foreground">{{ match.currentPlayers }}/{{ match.totalPlayers }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <button
            class="w-full py-3 rounded-lg font-semibold transition-opacity"
            :class="isJoined ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'"
            type="button"
            :disabled="joinStatus.isJoining || joinStatus.isLeaving || (match.isFull && !isJoined)"
            @click="toggleJoin"
          >
            {{
              joinStatus.isJoining
                ? 'Joining...'
                : joinStatus.isLeaving
                  ? 'Leaving...'
                  : joinLabel
            }}
          </button>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
              type="button"
              @click="handleShare"
            >
              Share
            </button>
            <button
              class="py-2 rounded-lg border border-border text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
              type="button"
              @click="handleCancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div v-else class="h-full flex flex-col">
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <ChatMessageBubble v-for="message in messages" :key="message.id" :message="message" />
        </div>
        <ChatComposer @send="handleSend" />
      </div>
    </div>
  </div>
</template>
