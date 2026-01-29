import { computed, ref } from 'vue'
import { matchesSeed } from '~/composables/useMatches'

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
  const match = computed(
    () => (matchesSeed.find((item) => item.id === id) as MatchDetail | undefined) ?? matchesSeed[0]
  )
  const isJoined = ref(false)

  const statusLabel = computed(() => {
    return match.value.isFull ? 'Full' : `Missing ${match.value.missingPlayers}`
  })

  const toggleJoin = () => {
    if (match.value.isFull && !isJoined.value) return
    isJoined.value = !isJoined.value
  }

  return { match, isJoined, statusLabel, toggleJoin }
}
