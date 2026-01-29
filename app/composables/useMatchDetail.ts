import { computed, ref } from 'vue'
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
  const match = ref<MatchDetail>(matchesSeed[0] as MatchDetail)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isJoined = ref(false)

  const fetchMatch = async () => {
    isLoading.value = true
    error.value = null

    const { data, error: requestError } = await supabase
      .from('matches')
      .select('id, sport, level, missing_players, price, date, time, venue, status, total_players, match_participants(count)')
      .eq('id', id)
      .single()

    if (requestError) {
      error.value = requestError.message
      match.value = (matchesSeed.find((item) => item.id === id) as MatchDetail) ?? (matchesSeed[0] as MatchDetail)
    } else if (data) {
      match.value = mapMatchToItem(data) as MatchDetail
    }

    isLoading.value = false
  }

  const statusLabel = computed(() => {
    return match.value.isFull ? 'Full' : `Missing ${match.value.missingPlayers}`
  })

  const toggleJoin = () => {
    if (match.value.isFull && !isJoined.value) return
    isJoined.value = !isJoined.value
  }

  fetchMatch()

  return { match, isLoading, error, isJoined, statusLabel, toggleJoin, refresh: fetchMatch }
}
