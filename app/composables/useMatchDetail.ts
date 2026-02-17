import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mapMatchToItem, matchesSeed } from '~/composables/useMatches'
import { useAuth } from '~/composables/useAuth'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import {
  getMatchStatusLabel,
  isJoinableMatchStatus,
  type MatchStatus
} from '~/composables/useMatchState'
import { useMatchParticipation } from '~/composables/useMatchParticipation'

export interface MatchDetail {
  id: string
  sport: string
  level: string
  missingPlayers: number
  price: number
  dateDisplay: string
  date?: string
  time?: string
  location: string
  distance: number
  currentPlayers: number
  totalPlayers: number
  status: MatchStatus
  isFull: boolean
  isJoined?: boolean
  players: string[]
}

export const useMatchDetail = (id: string) => {
  const supabase = useSupabaseClient()
  const fallbackMatch = (matchesSeed.find((item) => item.id === id) as MatchDetail) ?? (matchesSeed[0] as MatchDetail)
  const { joinMatch, leaveMatch, joinStatus } = useMatchParticipation()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const route = useRoute()

  const query = useQuery({
    queryKey: ['match', id, userId.value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, sport, level, missing_players, price, date, time, venue, status, total_players, match_participants(user_id)')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return mapMatchToItem(data, userId.value) as MatchDetail
    },
    placeholderData: fallbackMatch
  })

  const match = computed(() => query.data.value ?? fallbackMatch)
  const isJoined = computed(() => Boolean(match.value.isJoined))
  const error = computed(() => (query.error.value ? String(query.error.value) : null))

  const statusLabel = computed(() => {
    return getMatchStatusLabel(match.value.status, match.value.missingPlayers)
  })

  const toggleJoin = () => {
    if (!isJoinableMatchStatus(match.value.status)) return
    if (isJoined.value) {
      leaveMatch(match.value.id, route.fullPath)
    } else {
      if (match.value.isFull) return
      joinMatch(match.value.id, route.fullPath)
    }
  }

  return {
    match,
    isLoading: query.isLoading,
    error,
    isJoined,
    statusLabel,
    toggleJoin,
    joinStatus,
    refresh: query.refetch
  }
}
