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

const joinMutation = useMutation({
    mutationFn: async (matchId: string) => {
        if (!userId.value) {
            navigateTo('/login')
            return
        }
        const { error } = await supabase
            .from('match_participants')
            .insert({ match_id: matchId, user_id: userId.value })
        if (error) throw error
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['matches'] })
        queryClient.invalidateQueries({ queryKey: ['chats'] })
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
    <div class="space-y-3 p-4">
        <MatchCard
            v-for="match in matches"
            :key="match.id"
            :match="match"
            @open="navigateTo(`/match/${match.id}`)"
            @join="joinMutation.mutate(match.id)"
        />
    </div>
</template>
