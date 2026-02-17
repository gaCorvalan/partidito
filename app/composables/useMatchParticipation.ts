import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '~/composables/useAuth'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export const useMatchParticipation = () => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['matches'] })
    queryClient.invalidateQueries({ queryKey: ['match'] })
    queryClient.invalidateQueries({ queryKey: ['chats'] })
    queryClient.invalidateQueries({ queryKey: ['chat'] })
  }

  const ensureAuthenticated = (returnTo: string) => {
    if (userId.value) return true
    navigateTo(`/login?returnTo=${encodeURIComponent(returnTo)}`)
    return false
  }

  const joinMutation = useMutation({
    mutationFn: async ({ matchId, returnTo }: { matchId: string; returnTo: string }) => {
      if (!ensureAuthenticated(returnTo)) return
      const { error } = await supabase.rpc('join_match', { p_match_id: matchId })
      if (error) throw error
    },
    onSuccess: refreshQueries
  })

  const leaveMutation = useMutation({
    mutationFn: async ({ matchId, returnTo }: { matchId: string; returnTo: string }) => {
      if (!ensureAuthenticated(returnTo)) return
      const { error } = await supabase.rpc('leave_match', { p_match_id: matchId })
      if (error) throw error
    },
    onSuccess: refreshQueries
  })

  const joinMatch = (matchId: string, returnTo: string) => {
    joinMutation.mutate({ matchId, returnTo })
  }

  const leaveMatch = (matchId: string, returnTo: string) => {
    leaveMutation.mutate({ matchId, returnTo })
  }

  const joinMatchAsync = (matchId: string, returnTo: string) =>
    joinMutation.mutateAsync({ matchId, returnTo })

  const leaveMatchAsync = (matchId: string, returnTo: string) =>
    leaveMutation.mutateAsync({ matchId, returnTo })

  return {
    joinMatch,
    leaveMatch,
    joinMatchAsync,
    leaveMatchAsync,
    joinStatus: computed(() => ({
      isJoining: joinMutation.isPending.value,
      isLeaving: leaveMutation.isPending.value
    }))
  }
}
