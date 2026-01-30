<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import HomeHeader from '~/components/features/HomeHeader.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useMatches } from '~/composables/useMatches'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
const filters = [
    { label: "All", value: "all" },
    { label: "Padel", value: "padel" },
    { label: "Football", value: "football" },
];

const activeFilter = ref("all");

const { matches } = useMatches()
const supabase = useSupabaseClient()
const queryClient = useQueryClient()
const userId = useRuntimeConfig().public.supabaseUserId

const joinMutation = useMutation({
    mutationFn: async (matchId: string) => {
        if (!userId) throw new Error('Usuario no configurado')
        const { error } = await supabase
            .from('match_participants')
            .insert({ match_id: matchId, user_id: userId })
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
