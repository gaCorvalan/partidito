import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mapMatchToItem, matchesSeed } from '~/composables/useMatches'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export interface MatchDetail {
  id: string
  sport: string
  level: string
  missingPlayers: number
  price: number
  dateDisplay: string
  location: string
  distance: number
  currentPlayers: number
  totalPlayers: number
  isFull: boolean
  players: string[]
}

export const useMatchDetail = (id: string) => {
  const supabase = useSupabaseClient()
  const fallbackMatch = (matchesSeed.find((item) => item.id === id) as MatchDetail) ?? (matchesSeed[0] as MatchDetail)
  const isJoined = ref(false)

  const query = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, sport, level, missing_players, price, date, time, venue, status, total_players, match_participants(count)')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return mapMatchToItem(data) as MatchDetail
    },
    initialData: fallbackMatch
  })

  const match = computed(() => query.data.value ?? fallbackMatch)
  const error = computed(() => (query.error.value ? String(query.error.value) : null))

  const statusLabel = computed(() => {
    return match.value.isFull ? 'Full' : `Missing ${match.value.missingPlayers}`
  })

  const toggleJoin = () => {
    if (match.value.isFull && !isJoined.value) return
    isJoined.value = !isJoined.value
  }

  return {
    match,
    isLoading: query.isLoading,
    error,
    isJoined,
    statusLabel,
    toggleJoin,
    refresh: query.refetch
  }
}
