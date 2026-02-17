import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'

export type ChatMessageType = 'system' | 'incoming' | 'outgoing'

export interface ChatMessage {
  id: string
  type: ChatMessageType
  author?: string
  text: string
  time?: string
}

type MessageRow = {
  id: string
  type: 'user' | 'system'
  user_id: string | null
  content: string
  created_at: string
  profiles?: { full_name: string } | null
}

const messagesSeed: Array<ChatMessage & { matchId: string }> = [
  {
    id: 'system-1',
    matchId: 'pacheco-padel',
    type: 'system',
    text: 'Juan joined the match'
  },
]

const formatTime = (value: string) => {
  const date = new Date(value)
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

const mapMessageRow = (row: MessageRow, currentUserId?: string | null): ChatMessage => {
  if (row.type === 'system') {
    return {
      id: row.id,
      type: 'system',
      text: row.content
    }
  }

  const author = row.profiles?.full_name ?? 'Usuario'
  const type = row.user_id && currentUserId && row.user_id === currentUserId ? 'outgoing' : 'incoming'

  return {
    id: row.id,
    type,
    author: type === 'outgoing' ? 'You' : author,
    text: row.content,
    time: formatTime(row.created_at)
  }
}

export const useChatThread = (matchId: string) => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const title = 'Match Chat'

  const seed = messagesSeed.filter((message) => message.matchId === matchId)

  const query = useQuery({
    queryKey: ['chat', matchId, userId.value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, type, user_id, content, created_at, profiles(full_name)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return (data as MessageRow[]).map((row) => mapMessageRow(row, userId.value))
    },
    placeholderData: seed
  })

  const messages = computed(() => query.data.value ?? seed)
  const error = computed(() => (query.error.value ? String(query.error.value) : null))

  return {
    title,
    messages,
    isLoading: query.isLoading,
    error,
    refresh: query.refetch
  }
}
