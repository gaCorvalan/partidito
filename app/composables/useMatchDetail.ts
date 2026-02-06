import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mapMatchToItem, matchesSeed } from '~/composables/useMatches'
import { useAuth } from '~/composables/useAuth'
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
  const queryClient = useQueryClient()
  const fallbackMatch = (matchesSeed.find((item) => item.id === id) as MatchDetail) ?? (matchesSeed[0] as MatchDetail)
  const isJoined = ref(false)
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)

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

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!userId.value) {
        navigateTo('/login')
        return
      }
      if (match.value.isFull) return

      const { error } = await supabase
        .from('match_participants')
        .insert({ match_id: match.value.id, user_id: userId.value })

      if (error) throw error
    },
    onSuccess: () => {
      isJoined.value = true
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['match', id] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    }
  })

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!userId.value) {
        navigateTo('/login')
        return
      }

      const { error } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', match.value.id)
        .eq('user_id', userId.value)

      if (error) throw error
    },
    onSuccess: () => {
      isJoined.value = false
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['match', id] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    }
  })

  const toggleJoin = () => {
    if (isJoined.value) {
      leaveMutation.mutate()
    } else {
      joinMutation.mutate()
    }
  }

  return {
    match,
    isLoading: query.isLoading,
    error,
    isJoined,
    statusLabel,
    toggleJoin,
    joinStatus: computed(() => ({
      isJoining: joinMutation.isPending.value,
      isLeaving: leaveMutation.isPending.value
    })),
    refresh: query.refetch
  }
}
