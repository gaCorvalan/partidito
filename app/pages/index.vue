<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HomeHeader from '~/components/features/HomeHeader.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { type MatchItem, useMatches } from '~/composables/useMatches'
import { useGeoLocation } from '~/composables/useGeoLocation'
import { useAuth } from '~/composables/useAuth'
import { useMatchParticipation } from '~/composables/useMatchParticipation'
import { hasMatchStarted, isDiscoverableMatch, isJoinableMatchStatus } from '~/composables/useMatchState'
const filters = [
    { label: "All", value: "all" },
    { label: "Padel", value: "padel" },
    { label: "Football", value: "football" },
];

const activeFilter = ref("all");

const route = useRoute()
const { matches } = useMatches()
const { location, status, error, requestLocation, clearLocation } = useGeoLocation()
const avatarUrl = computed(() => user.value?.user_metadata?.picture ?? null)
const userInitials = computed(() => {
    const fullName =
        user.value?.user_metadata?.full_name ||
        user.value?.user_metadata?.name ||
        user.value?.email ||
        ''
    if (!fullName) return ''
    return fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
})
const { user } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))
const { joinMatch } = useMatchParticipation()

const locationLabel = computed(() => {
    if (!location.value) return 'Ubicacion no activada'
    return location.value.placeName || `${location.value.lat.toFixed(3)}, ${location.value.lng.toFixed(3)}`
})

const upcomingExpanded = ref(false)
const didAutoExpand = ref(false)
const upcomingMatches = computed(() => {
    if (!isAuthenticated.value) return []
    return matches.value.filter((match) => {
        if (!match.isJoined) return false
        if (!isJoinableMatchStatus(match.status)) return false
        return !hasMatchStarted(match.date, match.time)
    })
})

const toStartDate = (match: MatchItem) => {
    if (!match.date || !match.time) return null
    const parsed = new Date(`${match.date}T${match.time}`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

const haversineDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRadians = (value: number) => (value * Math.PI) / 180
    const earthRadiusKm = 6371
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadiusKm * c
}

const getDistanceScore = (distanceKm: number | null) => {
    if (distanceKm === null) return 0
    const maxUsefulDistanceKm = 30
    return Math.max(0, 1 - distanceKm / maxUsefulDistanceKm)
}

const getTimeScore = (match: MatchItem) => {
    const startDate = toStartDate(match)
    if (!startDate) return 0
    const hoursUntilStart = (startDate.getTime() - Date.now()) / 3600000
    if (hoursUntilStart <= 0) return 0
    const horizonHours = 72
    return Math.max(0, 1 - Math.min(hoursUntilStart, horizonHours) / horizonHours)
}

const getSlotsScore = (match: MatchItem) => {
    if (match.totalPlayers <= 0) return 0
    return match.missingPlayers / match.totalPlayers
}

const feedMatches = computed(() => {
    const discoverable = matches.value.filter((match) =>
      isDiscoverableMatch({
        status: match.status,
        missingPlayers: match.missingPlayers,
        date: match.date,
        time: match.time
      })
    )
    const joinable = isAuthenticated.value
      ? discoverable.filter((match) => !match.isJoined)
      : discoverable

    const userLat = location.value?.lat
    const userLng = location.value?.lng
    const hasUserLocation = typeof userLat === 'number' && typeof userLng === 'number'

    const enriched = joinable.map((match) => {
      const hasClubCoordinates = typeof match.clubLat === 'number' && typeof match.clubLng === 'number'
      const distanceKm =
        hasUserLocation && hasClubCoordinates
          ? haversineDistanceKm(userLat as number, userLng as number, match.clubLat as number, match.clubLng as number)
          : null

      const score = hasUserLocation
        ? getDistanceScore(distanceKm) * 0.5 + getTimeScore(match) * 0.3 + getSlotsScore(match) * 0.2
        : getTimeScore(match) * 0.7 + getSlotsScore(match) * 0.3

      return {
        ...match,
        distance: distanceKm === null ? match.distance : Number(distanceKm.toFixed(1)),
        _score: score
      }
    })

    return enriched.sort((a, b) => {
      const scoreDiff = b._score - a._score
      if (scoreDiff !== 0) return scoreDiff

      const aStart = toStartDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER
      const bStart = toStartDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER
      return aStart - bStart
    })
})

watch(
    () => [upcomingMatches.value.length, feedMatches.value.length, isAuthenticated.value],
    ([upcomingCount, feedCount, authenticated]) => {
        if (authenticated && !didAutoExpand.value && upcomingCount > 0 && feedCount === 0) {
            upcomingExpanded.value = true
            didAutoExpand.value = true
        }
    },
    { immediate: true }
)
const handleFilterChange = (filter: string) => {
    activeFilter.value = filter;
};
</script>

<template>
    <HomeHeader
        :filters="filters"
        :active-filter="activeFilter"
        :user-initials="userInitials"
        :avatar-url="avatarUrl"
        @filter-change="handleFilterChange"
    />
    <div class="px-4 pt-4">
        <div class="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
                <p class="text-sm font-semibold text-foreground">Ubicacion</p>
                <p class="text-xs text-muted-foreground">{{ locationLabel }}</p>
                <p v-if="status === 'denied'" class="text-xs text-rose-500">Permiso denegado</p>
                <p v-else-if="error" class="text-xs text-rose-500">{{ error }}</p>
            </div>
            <div class="flex items-center gap-2">
                <button
                    class="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-60"
                    type="button"
                    :disabled="status === 'loading'"
                    @click="requestLocation"
                >
                    {{ status === 'loading' ? 'Detectando...' : location ? 'Actualizar' : 'Usar mi ubicacion' }}
                </button>
                <button
                    v-if="location"
                    class="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground"
                    type="button"
                    @click="clearLocation"
                >
                    Quitar
                </button>
            </div>
        </div>
    </div>
    <div v-if="upcomingMatches.length" class="px-4 pt-4">
        <div class="bg-card border border-border rounded-xl">
            <button
                class="w-full flex items-center justify-between text-left px-4 py-3"
                type="button"
                @click="upcomingExpanded = !upcomingExpanded"
            >
                <span class="text-sm font-semibold text-foreground">Proximos partidos</span>
                <Icon
                    :name="upcomingExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                    class="w-4 h-4 text-muted-foreground"
                />
            </button>
            <div v-if="upcomingExpanded" class="space-y-3 px-4 pb-4">
                <MatchCard
                    v-for="match in upcomingMatches"
                    :key="match.id"
                    :match="match"
                    @open="navigateTo(`/match/${match.id}`)"
                />
            </div>
        </div>
    </div>
    <div class="space-y-3 p-4">
        <MatchCard
            v-for="match in feedMatches"
            :key="match.id"
            :match="match"
            @open="navigateTo(`/match/${match.id}`)"
            @join="joinMatch(match.id, route.fullPath)"
        />
        <div v-if="!feedMatches.length && !upcomingMatches.length" class="text-center text-sm text-muted-foreground py-8">
            No hay partidos disponibles por ahora.
        </div>
    </div>
</template>
