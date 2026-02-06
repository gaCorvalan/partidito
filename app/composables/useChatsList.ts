import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export interface ChatListItem {
  id: string
  title: string
  timeAgo: string
  timeLabel: string
  lastMessage: string
  participants: number
}

const chatsSeed: ChatListItem[] = [
  {
    id: 'pacheco-padel',
    title: 'Pacheco Padel Center',
    timeAgo: '2 min ago',
    timeLabel: 'Today 19:00',
    lastMessage: 'See you at 7pm!',
    participants: 3
  },
]

type ChatRow = {
  match_id: string
  venue: string
  date: string
  time: string
  participants: number
  last_message: string | null
  last_message_at: string | null
}

const formatRelativeTime = (value?: string) => {
  if (!value) return 'Just now'
  const date = new Date(value)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  const diffHours = Math.floor(diffMinutes / 60)
  return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
}

const formatTimeLabel = (dateValue: string, timeValue: string) => {
  const target = new Date(`${dateValue}T${timeValue}`)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const diffDays = Math.floor((targetDay.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return `Today ${timeValue}`
  if (diffDays === 1) return `Tomorrow ${timeValue}`
  if (diffDays > 1 && diffDays < 7) {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(target)
    return `This week · ${weekday} ${timeValue}`
  }

  return `${dateValue} ${timeValue}`
}

const mapChatRow = (row: ChatRow): ChatListItem => {
  return {
    id: row.match_id,
    title: row.venue,
    timeAgo: formatRelativeTime(row.last_message_at ?? undefined),
    timeLabel: formatTimeLabel(row.date, row.time),
    lastMessage: row.last_message ?? 'Sin mensajes',
    participants: row.participants
  }
}

export const useChatsList = () => {
  const supabase = useSupabaseClient()

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_chats')
        .select('match_id, venue, date, time, participants, last_message, last_message_at')
        .order('date', { ascending: true })

      if (error) {
        throw error
      }

      return (data as ChatRow[]).map(mapChatRow)
    },
    placeholderData: chatsSeed
  })

  const chats = computed(() => query.data.value ?? chatsSeed)
  const error = computed(() => (query.error.value ? String(query.error.value) : null))

  return {
    chats,
    isLoading: query.isLoading,
    error,
    refresh: query.refetch
  }
}
