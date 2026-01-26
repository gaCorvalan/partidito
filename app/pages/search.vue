<script setup lang="ts">
import { reactive, ref } from 'vue'
import SearchHeader from '~/components/features/SearchHeader.vue'
import FilterGroup from '~/components/features/FilterGroup.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useSearchFilters } from '~/composables/useSearchFilters'

const groups = reactive(useSearchFilters().groups)

const matches = ref([
  {
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
])

const handleSelect = (groupId: string, value: string) => {
  const group = groups.find((item) => item.id === groupId)
  if (group) {
    group.selected = value
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <SearchHeader title="Find matches" placeholder="Search by club or area" />

    <div class="bg-background border-b border-border p-4 space-y-4">
      <FilterGroup
        v-for="group in groups"
        :key="group.id"
        :label="group.label"
        :options="group.options"
        :selected="group.selected"
        @select="handleSelect(group.id, $event)"
      />
    </div>

    <div class="flex-1 overflow-y-auto">
      <div class="space-y-3 p-4">
        <p class="text-sm text-muted-foreground">{{ matches.length }} matches found</p>
        <MatchCard v-for="match in matches" :key="match.dateDisplay" :match="match" />
      </div>
    </div>
  </div>
</template>
