<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import HomeHeader from '~/components/features/HomeHeader.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useMatches } from '~/composables/useMatches'
import { useGeoLocation } from '~/composables/useGeoLocation'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'
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
const supabase = useSupabaseClient()
const { user } = useAuth()
const queryClient = useQueryClient()
const userId = computed(() => user.value?.id ?? null)
const isAuthenticated = computed(() => Boolean(user.value))

const locationLabel = computed(() => {
    if (!location.value) return 'Ubicacion no activada'
    return location.value.placeName || `${location.value.lat.toFixed(3)}, ${location.value.lng.toFixed(3)}`
})

const upcomingExpanded = ref(false)
const didAutoExpand = ref(false)
const upcomingMatches = computed(() => {
    if (!isAuthenticated.value) return []
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return matches.value.filter((match) => {
        if (!match.isJoined) return false
        if (!match.date) return true
        const [year, month, day] = match.date.split('-').map(Number)
        const matchDate = new Date(year, month - 1, day)
        return matchDate >= todayDate
    })
})

const feedMatches = computed(() => {
    if (!isAuthenticated.value) return matches.value
    return matches.value.filter((match) => !match.isJoined)
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


const joinMutation = useMutation({
    mutationFn: async (matchId: string) => {
        if (!userId.value) {
            navigateTo(`/login?returnTo=${encodeURIComponent(route.fullPath)}`)
            return
        }
        const { error } = await supabase
            .from('match_participants')
            .insert({ match_id: matchId, user_id: userId.value })
        if (error) throw error

        const userName =
            user.value?.user_metadata?.full_name ||
            user.value?.user_metadata?.name ||
            user.value?.email ||
            'Usuario'

        await supabase.from('messages').insert({
            match_id: matchId,
            user_id: userId.value,
            type: 'system',
            content: `${userName} se unio al partido`
        })

        const matchItem = matches.value.find((item) => item.id === matchId)
        if (matchItem) {
            const nextMissing = Math.max(matchItem.missingPlayers - 1, 0)
            await supabase
                .from('matches')
                .update({
                    missing_players: nextMissing,
                    status: nextMissing === 0 ? 'full' : 'open'
                })
                .eq('id', matchId)
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['matches'] })
        queryClient.invalidateQueries({ queryKey: ['chats'] })
        queryClient.invalidateQueries({ queryKey: ['chat'] })
    }
})

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
            @join="joinMutation.mutate(match.id)"
        />
        <div v-if="!feedMatches.length && !upcomingMatches.length" class="text-center text-sm text-muted-foreground py-8">
            No hay partidos disponibles por ahora.
        </div>
    </div>
</template>
