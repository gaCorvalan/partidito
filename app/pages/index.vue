<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import HomeHeader from '~/components/features/HomeHeader.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useMatches } from '~/composables/useMatches'
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

const upcomingExpanded = ref(false)
const upcomingMatches = computed(() => {
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return matches.value.filter((match) => {
        if (!match.isJoined) return false
        if (!match.date) return true
        const dateValue = new Date(match.date)
        const matchDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate())
        return matchDate >= todayDate
    })
})

const feedMatches = computed(() => {
    return matches.value.filter((match) => !match.isJoined)
})


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
    </div>
</template>
