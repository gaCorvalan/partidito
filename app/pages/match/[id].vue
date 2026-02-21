<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatMessageBubble from '~/components/features/ChatMessageBubble.vue'
import ChatComposer from '~/components/features/ChatComposer.vue'
import { useChatThread } from '~/composables/useChatThread'
import { useMatchDetail } from '~/composables/useMatchDetail'
import { useChatMessaging } from '~/composables/useChatMessaging'

const route = useRoute()
const { t } = useI18n()
const activeTab = ref<'info' | 'chat'>('info')

const {
  match,
  isJoined,
  participants,
  permissions,
  statusLabel,
  toggleJoin,
  removeParticipant,
  confirmMatchResult,
  markAttendance,
  actionError,
  joinStatus
} = useMatchDetail(String(route.params.id))
const { messages } = useChatThread(String(route.params.id))
const { sendMessage, error: chatError } = useChatMessaging()

const joinLabel = computed(() => {
  if (isJoined.value && !permissions.value.canLeave) {
    return t('match.cannotLeave')
  }
  return isJoined.value ? t('match.leave') : t('match.join')
})

const removableParticipants = computed(() =>
  participants.value.filter((participant) => !participant.isCurrentUser)
)
const canViewChat = computed(() => isJoined.value || permissions.value.isHost)
const canWriteChat = computed(() => canViewChat.value && permissions.value.canWriteChat)
const closeReason = ref('')
const locationMeta = computed(() =>
  [match.value.clubZone, match.value.clubAddress, match.value.clubCity].filter(Boolean).join(' · ')
)

const handleBack = () => {
  navigateTo('/')
}

const handleSend = async (message: string) => {
  if (!canWriteChat.value) return
  await sendMessage(String(route.params.id), message, route.fullPath)
}

const handleShare = async () => {
  const shareUrl = `${window.location.origin}/match/${route.params.id}`
  const shareData = {
    title: 'Partidito',
    text: `${match.value.sport} · ${match.value.level}`,
    url: shareUrl
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl)
      return
    }

    throw new Error('No se pudo compartir este partido desde tu dispositivo.')
  } catch (shareError) {
    const message = shareError instanceof Error ? shareError.message : String(shareError)
    if (message !== 'AbortError') {
      console.error(message)
    }
  }
}

const handleRemoveParticipant = (participantUserId: string) => {
  removeParticipant(participantUserId)
}

const handleConfirmPlayed = () => {
  confirmMatchResult('played', closeReason.value)
}

const handleConfirmNotPlayed = () => {
  confirmMatchResult('not_played', closeReason.value)
}

const handleMarkAttendance = (participantUserId: string, attendanceStatus: 'attended' | 'no_show') => {
  markAttendance(participantUserId, attendanceStatus)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="sticky top-0 bg-background border-b border-border p-4">
      <div class="flex items-center justify-between">
        <button class="p-2 hover:bg-muted rounded-lg transition-colors" type="button" @click="handleBack">
          <Icon name="lucide:chevron-left" class="w-5 h-5 text-foreground" />
        </button>
        <h1 class="text-lg font-semibold text-foreground">{{ t('match.title') }}</h1>
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
          {{ t('match.tab.info') }}
        </button>
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="activeTab === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'"
          type="button"
          @click="activeTab = 'chat'"
        >
          {{ t('match.tab.chat') }}
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
              <p class="text-xs text-muted-foreground">{{ t('match.pricePerPlayer') }}</p>
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

        <div class="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{{ t('match.location') }}</p>
              <p class="text-sm font-semibold text-foreground truncate">
                {{ match.clubName || match.location || 'Sin lugar definido' }}
              </p>
              <p v-if="locationMeta" class="text-xs text-muted-foreground mt-1 truncate">{{ locationMeta }}</p>
            </div>
            <a
              v-if="match.clubMapsUrl"
              :href="match.clubMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon name="lucide:navigation" class="w-3.5 h-3.5" />
              <span>{{ t('match.location.openMap') }}</span>
            </a>
          </div>
        </div>

        <div class="space-y-2">
          <button
            v-if="permissions.canManageParticipation"
            class="w-full py-3 rounded-lg font-semibold transition-opacity"
            :class="isJoined ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'"
            type="button"
            :disabled="
              joinStatus.isJoining ||
              joinStatus.isLeaving ||
              (!permissions.canJoin && !isJoined) ||
              (isJoined && !permissions.canLeave)
            "
            @click="toggleJoin"
          >
            {{
              joinStatus.isJoining
                ? t('match.joining')
                : joinStatus.isLeaving
                  ? t('match.leaving')
                  : joinLabel
            }}
          </button>
          <p v-if="actionError" class="text-xs text-rose-500">{{ actionError }}</p>
          <p v-if="permissions.canManageParticipation && isJoined && !permissions.canLeave" class="text-xs text-muted-foreground">
            {{ t('match.leaveRestriction') }}
          </p>

          <div
            v-if="permissions.canRemoveParticipants && removableParticipants.length"
            class="rounded-lg border border-border p-3 space-y-2"
          >
            <p class="text-xs font-semibold text-foreground">{{ t('match.manageParticipants') }}</p>
            <div
              v-for="participant in removableParticipants"
              :key="participant.userId"
              class="flex items-center justify-between gap-3"
            >
              <span class="text-xs text-muted-foreground">{{ participant.label }}</span>
              <button
                class="px-2.5 py-1 rounded-md border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                type="button"
                :disabled="joinStatus.isRemoving"
                @click="handleRemoveParticipant(participant.userId)"
              >
                {{ joinStatus.isRemoving ? t('match.removing') : t('match.remove') }}
              </button>
            </div>
          </div>

          <div v-if="permissions.canConfirmResult" class="rounded-lg border border-border p-3 space-y-2">
            <p class="text-xs font-semibold text-foreground">{{ t('match.confirmStatus') }}</p>
            <input
              v-model="closeReason"
              type="text"
              :placeholder="t('match.optionalReason')"
              class="w-full rounded-md border border-border bg-input px-3 py-2 text-xs text-foreground"
            />
            <div class="grid grid-cols-2 gap-2">
              <button
                class="py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                type="button"
                :disabled="joinStatus.isClosing"
                @click="handleConfirmPlayed"
              >
                {{ joinStatus.isClosing ? t('match.save') : t('match.played') }}
              </button>
              <button
                class="py-2 rounded-lg border border-border text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                type="button"
                :disabled="joinStatus.isClosing"
                @click="handleConfirmNotPlayed"
              >
                {{ joinStatus.isClosing ? t('match.save') : t('match.notPlayed') }}
              </button>
            </div>
          </div>

          <div v-if="permissions.canMarkAttendance && participants.length" class="rounded-lg border border-border p-3 space-y-2">
            <p class="text-xs font-semibold text-foreground">{{ t('match.attendance') }}</p>
            <div
              v-for="participant in participants"
              :key="`attendance-${participant.userId}`"
              class="flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="text-xs text-foreground truncate">{{ participant.label }}</p>
                <p class="text-[11px] text-muted-foreground">
                  {{
                    participant.attendanceStatus === 'attended'
                      ? t('match.attended')
                      : participant.attendanceStatus === 'no_show'
                        ? t('match.noShow')
                        : t('match.notRecorded')
                  }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="px-2.5 py-1 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  type="button"
                  :disabled="joinStatus.isMarkingAttendance || Boolean(participant.attendanceStatus)"
                  @click="handleMarkAttendance(participant.userId, 'attended')"
                >
                  {{ t('match.attended') }}
                </button>
                <button
                  class="px-2.5 py-1 rounded-md border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  type="button"
                  :disabled="joinStatus.isMarkingAttendance || Boolean(participant.attendanceStatus)"
                  @click="handleMarkAttendance(participant.userId, 'no_show')"
                >
                  {{ t('match.noShow') }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="h-full flex flex-col">
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="!canViewChat" class="rounded-lg border border-border p-3 text-xs text-muted-foreground">
            {{ t('match.chat.mustJoin') }}
          </div>
          <div v-else-if="!canWriteChat" class="rounded-lg border border-border p-3 text-xs text-muted-foreground">
            {{ t('match.chat.closed') }}
          </div>
          <div v-else-if="chatError" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
            {{ chatError }}
          </div>
          <ChatMessageBubble v-for="message in messages" :key="message.id" :message="message" />
        </div>
        <ChatComposer v-if="canWriteChat" @send="handleSend" />
      </div>
    </div>
  </div>
</template>
