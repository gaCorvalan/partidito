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
  {
    id: 'central-football',
    title: 'Central Sports Complex',
    timeAgo: '15 min ago',
    timeLabel: 'Today 20:30',
    lastMessage: 'Anyone bringing extra shoes?',
    participants: 5
  },
  {
    id: 'city-padel',
    title: 'City Padel Courts',
    timeAgo: '1 hour ago',
    timeLabel: 'This week · Wed 17:00',
    lastMessage: 'Looking forward to playing!',
    participants: 2
  }
]

type MatchRow = {
  id: string
  venue: string
  date: string
  time: string
  match_participants?: Array<{ count: number }>
  messages?: Array<{ content: string; created_at: string }>
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

const mapChatRow = (row: MatchRow): ChatListItem => {
  const lastMessage = row.messages?.[0]
  return {
    id: row.id,
    title: row.venue,
    timeAgo: formatRelativeTime(lastMessage?.created_at),
    timeLabel: `${row.date} ${row.time}`,
    lastMessage: lastMessage?.content ?? 'Sin mensajes',
    participants: row.match_participants?.[0]?.count ?? 0
  }
}

export const useChatsList = () => {
  const supabase = useSupabaseClient()

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, venue, date, time, match_participants(count), messages(content, created_at)')
        .order('date', { ascending: true })

      if (error) {
        throw error
      }

      return (data as MatchRow[]).map(mapChatRow)
    },
    initialData: chatsSeed
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
