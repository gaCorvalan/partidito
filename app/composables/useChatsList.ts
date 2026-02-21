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
    timeAgo: 'hace 2 min',
    timeLabel: 'Hoy 19:00',
    lastMessage: 'Nos vemos a las 19:00',
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

type ChatRowWithActivity = ChatRow & {
  lastActivityAt: string
}

const formatRelativeTime = (value: string | undefined, t: ReturnType<typeof useI18n>["t"]) => {
  if (!value) return t('time.justNow')
  const date = new Date(value)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return t('time.justNow')
  if (diffMinutes < 60) return t('time.minAgo', { count: diffMinutes })
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours === 1) return t('time.hourAgo')
  return t('time.hoursAgo', { count: diffHours })
}

const formatTimeLabel = (
  dateValue: string,
  timeValue: string,
  t: ReturnType<typeof useI18n>["t"],
  locale: "es" | "en"
) => {
  const target = new Date(`${dateValue}T${timeValue}`)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const diffDays = Math.floor((targetDay.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return t('time.todayAt', { time: timeValue })
  if (diffDays === 1) return t('time.tomorrowAt', { time: timeValue })
  if (diffDays > 1 && diffDays < 7) {
    const weekday = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-AR', { weekday: 'short' }).format(target)
    return t('time.thisWeekAt', { weekday, time: timeValue })
  }

  return `${dateValue} ${timeValue}`
}

const mapChatRow = (
  row: ChatRow,
  t: ReturnType<typeof useI18n>["t"],
  locale: "es" | "en"
): ChatListItem => {
  const lastActivityAt = row.last_message_at ?? `${row.date}T${row.time}`

  return {
    id: row.match_id,
    title: row.venue,
    timeAgo: formatRelativeTime(lastActivityAt, t),
    timeLabel: formatTimeLabel(row.date, row.time, t, locale),
    lastMessage: row.last_message ?? t('chat.noMessages'),
    participants: row.participants
  }
}

const toTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export const useChatsList = () => {
  const supabase = useSupabaseClient()
  const { t, locale } = useI18n()

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

      const rowsWithActivity = (data as ChatRow[]).map((row) => ({
        ...row,
        lastActivityAt: row.last_message_at ?? `${row.date}T${row.time}`
      })) as ChatRowWithActivity[]

      return rowsWithActivity
        .sort((a, b) => {
          const diff = toTimestamp(b.lastActivityAt) - toTimestamp(a.lastActivityAt)
          if (diff !== 0) return diff
          return a.match_id.localeCompare(b.match_id)
        })
        .map((row) => mapChatRow(row, t, locale.value))
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
