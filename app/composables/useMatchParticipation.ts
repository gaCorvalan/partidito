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

  const removeMutation = useMutation({
    mutationFn: async ({
      matchId,
      participantUserId,
      returnTo
    }: {
      matchId: string
      participantUserId: string
      returnTo: string
    }) => {
      if (!ensureAuthenticated(returnTo)) return
      const { error } = await supabase.rpc('remove_participant', {
        p_match_id: matchId,
        p_user_id: participantUserId
      })
      if (error) throw error
    },
    onSuccess: refreshQueries
  })

  const closeMutation = useMutation({
    mutationFn: async ({
      matchId,
      status,
      reason,
      returnTo
    }: {
      matchId: string
      status: 'played' | 'not_played'
      reason?: string
      returnTo: string
    }) => {
      if (!ensureAuthenticated(returnTo)) return
      const { error } = await supabase.rpc('close_match_manual', {
        p_match_id: matchId,
        p_status: status,
        p_reason: reason?.trim() ? reason.trim() : null
      })
      if (error) throw error
    },
    onSuccess: refreshQueries
  })

  const attendanceMutation = useMutation({
    mutationFn: async ({
      matchId,
      participantUserId,
      attendanceStatus,
      returnTo
    }: {
      matchId: string
      participantUserId: string
      attendanceStatus: 'attended' | 'no_show'
      returnTo: string
    }) => {
      if (!ensureAuthenticated(returnTo)) return
      const { error } = await supabase.rpc('mark_attendance', {
        p_match_id: matchId,
        p_user_id: participantUserId,
        p_attendance_status: attendanceStatus
      })
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

  const removeParticipantAsync = (matchId: string, participantUserId: string, returnTo: string) =>
    removeMutation.mutateAsync({ matchId, participantUserId, returnTo })

  const closeMatchManualAsync = (
    matchId: string,
    status: 'played' | 'not_played',
    reason: string | undefined,
    returnTo: string
  ) => closeMutation.mutateAsync({ matchId, status, reason, returnTo })

  const markAttendanceAsync = (
    matchId: string,
    participantUserId: string,
    attendanceStatus: 'attended' | 'no_show',
    returnTo: string
  ) => attendanceMutation.mutateAsync({ matchId, participantUserId, attendanceStatus, returnTo })

  return {
    joinMatch,
    leaveMatch,
    joinMatchAsync,
    leaveMatchAsync,
    removeParticipantAsync,
    closeMatchManualAsync,
    markAttendanceAsync,
    joinStatus: computed(() => ({
      isJoining: joinMutation.isPending.value,
      isLeaving: leaveMutation.isPending.value,
      isRemoving: removeMutation.isPending.value,
      isClosing: closeMutation.isPending.value,
      isMarkingAttendance: attendanceMutation.isPending.value
    }))
  }
}
