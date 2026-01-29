<script setup lang="ts">
import { ref } from 'vue'
import HomeHeader from '~/components/features/HomeHeader.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useMatches } from '~/composables/useMatches'
const filters = [
    { label: "All", value: "all" },
    { label: "Padel", value: "padel" },
    { label: "Football", value: "football" },
];

const activeFilter = ref("all");

const { matches } = useMatches()

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
        />
    </div>
</template>
