import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'
import { type MatchStatus, isMatchFull, toMatchStatus } from '~/composables/useMatchState'

export interface MatchItem {
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
  clubLat?: number | null
  clubLng?: number | null
  players: string[]
}

export const matchesSeed: MatchItem[] = [
  {
    id: 'pacheco-padel',
    sport: 'padel',
    level: 'intermediate',
    missingPlayers: 1,
    price: 2500,
    dateDisplay: 'Today 19:00',
    date: '2026-02-06',
    time: '19:00',
    location: 'Pacheco Padel Center',
    distance: 2.3,
    currentPlayers: 3,
    totalPlayers: 4,
    status: 'open',
    isFull: false,
    clubLat: null,
    clubLng: null,
    players: ['P', 'P', 'P']
  }
]

type MatchRow = {
  id: string
  sport: string
  level: string
  missing_players: number
  price: number
  date: string
  time: string
  venue: string
  status: string
  total_players: number
  created_by?: string
  clubs?: { name?: string | null; lat?: number | null; lng?: number | null } | null
  match_participants?: Array<{ user_id: string; status?: string | null }>
}

const mapMatchRow = (row: MatchRow, currentUserId?: string | null): MatchItem => {
  const participants = row.match_participants ?? []
  const activeParticipants = participants.filter(
    (participant) => !participant.status || participant.status === 'joined'
  )
  // Cupos y estado del partido se definen por total_players/missing_players.
  // match_participants solo refleja usuarios registrados en la app.
  const currentPlayers = Math.max(row.total_players - row.missing_players, 0)
  const status = toMatchStatus(row.status, row.missing_players)
  const isJoined = currentUserId
    ? activeParticipants.some((participant) => participant.user_id === currentUserId)
    : false
  return {
    id: row.id,
    sport: row.sport,
    level: row.level,
    missingPlayers: row.missing_players,
    price: row.price,
    dateDisplay: `${row.date} ${row.time}`,
    date: row.date,
    time: row.time,
    location: row.clubs?.name ?? row.venue,
    distance: 0,
    currentPlayers,
    totalPlayers: row.total_players,
    status,
    createdBy: row.created_by,
    isFull: isMatchFull(status),
    isJoined,
    clubLat: row.clubs?.lat ?? null,
    clubLng: row.clubs?.lng ?? null,
    players: Array.from({ length: Math.min(currentPlayers, 3) }, () => 'P')
  }
}

export const useMatches = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const query = useQuery({
    queryKey: ['matches', userId.value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          'id, sport, level, missing_players, price, date, time, venue, status, total_players, created_by, clubs(name,lat,lng), match_participants(user_id,status)'
        )
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        throw error
      }

      return (data as MatchRow[]).map((row) => mapMatchRow(row, userId.value))
    },
    placeholderData: matchesSeed
  })

  const matches = computed(() => query.data.value ?? matchesSeed)
  const error = computed(() => (query.error.value ? String(query.error.value) : null))

  return {
    matches,
    isLoading: query.isLoading,
    error,
    refresh: query.refetch
  }
}

export const mapMatchToItem = (row: MatchRow, currentUserId?: string | null) => mapMatchRow(row, currentUserId)
