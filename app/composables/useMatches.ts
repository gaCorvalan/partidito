import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export interface MatchItem {
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

export const matchesSeed: MatchItem[] = [
  {
    id: 'pacheco-padel',
    sport: 'padel',
    level: 'intermediate',
    missingPlayers: 1,
    price: 2500,
    dateDisplay: 'Today 19:00',
    location: 'Pacheco Padel Center',
    distance: 2.3,
    currentPlayers: 3,
    totalPlayers: 4,
    isFull: false,
    players: ['P', 'P', 'P']
  },
  {
    id: 'central-football',
    sport: 'football',
    level: 'beginner',
    missingPlayers: 1,
    price: 3000,
    dateDisplay: 'Today 20:30',
    location: 'Central Sports Complex',
    distance: 1.8,
    currentPlayers: 5,
    totalPlayers: 6,
    isFull: false,
    players: ['P', 'P', 'P']
  },
  {
    id: 'elite-padel',
    sport: 'padel',
    level: 'advanced',
    missingPlayers: 0,
    price: 4000,
    dateDisplay: 'Tomorrow 18:00',
    location: 'Elite Padel Club',
    distance: 3.5,
    currentPlayers: 4,
    totalPlayers: 4,
    isFull: true,
    players: ['P', 'P', 'P']
  },
  {
    id: 'municipal-football',
    sport: 'football',
    level: 'intermediate',
    missingPlayers: 4,
    price: 2800,
    dateDisplay: 'Tomorrow 19:30',
    location: 'Municipal Field',
    distance: 2.1,
    currentPlayers: 4,
    totalPlayers: 8,
    isFull: false,
    players: ['P', 'P', 'P']
  },
  {
    id: 'city-padel',
    sport: 'padel',
    level: 'beginner',
    missingPlayers: 2,
    price: 2200,
    dateDisplay: 'This week · Wed 17:00',
    location: 'City Padel Courts',
    distance: 0.9,
    currentPlayers: 2,
    totalPlayers: 4,
    isFull: false,
    players: ['P', 'P']
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
  match_participants?: Array<{ count: number }>
}

const mapMatchRow = (row: MatchRow): MatchItem => {
  const currentPlayers = row.match_participants?.[0]?.count ?? 0
  return {
    id: row.id,
    sport: row.sport,
    level: row.level,
    missingPlayers: row.missing_players,
    price: row.price,
    dateDisplay: `${row.date} ${row.time}`,
    location: row.venue,
    distance: 0,
    currentPlayers,
    totalPlayers: row.total_players,
    isFull: row.status === 'full',
    players: Array.from({ length: Math.min(currentPlayers, 3) }, () => 'P')
  }
}

export const useMatches = () => {
  const supabase = useSupabaseClient()
  const query = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('id, sport, level, missing_players, price, date, time, venue, status, total_players, match_participants(count)')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        throw error
      }

      return (data as MatchRow[]).map(mapMatchRow)
    },
    initialData: matchesSeed
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

export const mapMatchToItem = mapMatchRow
