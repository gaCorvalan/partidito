import { computed, ref } from 'vue'
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
  createdBy?: string
  isFull: boolean
  isJoined?: boolean
  participants: Array<{
    userId: string
    status: string
    isCurrentUser: boolean
    label: string
  }>
  players: string[]
}

export const useMatchDetail = (id: string) => {
  const supabase = useSupabaseClient()
  const fallbackSeed = (matchesSeed.find((item) => item.id === id) as MatchDetail) ?? (matchesSeed[0] as MatchDetail)
  const fallbackMatch: MatchDetail = {
    ...fallbackSeed,
    createdBy: undefined,
    participants: []
  }
  const { joinMatchAsync, leaveMatchAsync, removeParticipantAsync, joinStatus } = useMatchParticipation()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const route = useRoute()
  const actionError = ref<string | null>(null)

  const getStartDate = (date?: string, time?: string) => {
    if (!date || !time) return null
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    if (!year || !month || !day || hour === undefined || minute === undefined) return null
    return new Date(year, month - 1, day, hour, minute, 0, 0)
  }

  const query = useQuery({
    queryKey: ['match', id, userId.value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, sport, level, missing_players, price, date, time, venue, status, total_players, created_by, match_participants(user_id,status)')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      const mapped = mapMatchToItem(data, userId.value) as MatchDetail
      const participantRows = (data.match_participants ?? []) as Array<{ user_id: string; status?: string | null }>
      const participants = participantRows
        .filter((participant) => !participant.status || participant.status === 'joined')
        .map((participant) => ({
          userId: participant.user_id,
          status: participant.status ?? 'joined',
          isCurrentUser: participant.user_id === userId.value,
          label: participant.user_id === userId.value ? 'Tu' : `Jugador ${participant.user_id.slice(0, 6)}`
        }))

      return {
        ...mapped,
        createdBy: data.created_by as string,
        participants
      }
    },
    placeholderData: fallbackMatch
  })

  const match = computed(() => query.data.value ?? fallbackMatch)
  const isJoined = computed(() => Boolean(match.value.isJoined))
  const error = computed(() => (query.error.value ? String(query.error.value) : null))

  const statusLabel = computed(() => {
    return getMatchStatusLabel(match.value.status, match.value.missingPlayers)
  })

  const participants = computed(() => match.value.participants ?? [])
  const startDate = computed(() => getStartDate(match.value.date, match.value.time))
  const leaveDeadline = computed(() => {
    if (!startDate.value) return null
    const deadline = new Date(startDate.value)
    deadline.setHours(deadline.getHours() - 1)
    return deadline
  })
  const isBeforeLeaveDeadline = computed(() => {
    if (!leaveDeadline.value) return true
    return new Date().getTime() < leaveDeadline.value.getTime()
  })
  const isHost = computed(() => Boolean(userId.value && match.value.createdBy === userId.value))
  const permissions = computed(() => ({
    isHost: isHost.value,
    canJoin: isJoinableMatchStatus(match.value.status) && !match.value.isFull,
    canLeave: isJoinableMatchStatus(match.value.status) && isJoined.value && !isHost.value && isBeforeLeaveDeadline.value,
    canRemoveParticipants: isJoinableMatchStatus(match.value.status) && isHost.value && isBeforeLeaveDeadline.value
  }))

  const clearActionError = () => {
    actionError.value = null
  }

  const toActionErrorMessage = (value: unknown) => {
    const message = value instanceof Error ? value.message : String(value)
    return message.replace('Error: ', '')
  }

  const toggleJoin = async () => {
    clearActionError()
    if (!isJoinableMatchStatus(match.value.status)) return
    if (isJoined.value) {
      if (!permissions.value.canLeave) {
        actionError.value = 'No puedes salir en la ultima hora o si eres el creador.'
        return
      }
      try {
        await leaveMatchAsync(match.value.id, route.fullPath)
      } catch (mutationError) {
        actionError.value = toActionErrorMessage(mutationError)
      }
    } else {
      if (match.value.isFull) return
      try {
        await joinMatchAsync(match.value.id, route.fullPath)
      } catch (mutationError) {
        actionError.value = toActionErrorMessage(mutationError)
      }
    }
  }

  const removeParticipant = async (participantUserId: string) => {
    clearActionError()
    if (!permissions.value.canRemoveParticipants) {
      actionError.value = 'No tienes permiso para remover participantes en este momento.'
      return
    }
    try {
      await removeParticipantAsync(match.value.id, participantUserId, route.fullPath)
    } catch (mutationError) {
      actionError.value = toActionErrorMessage(mutationError)
    }
  }

  return {
    match,
    isLoading: query.isLoading,
    error,
    isJoined,
    participants,
    permissions,
    statusLabel,
    toggleJoin,
    removeParticipant,
    actionError,
    clearActionError,
    joinStatus,
    refresh: query.refetch
  }
}
