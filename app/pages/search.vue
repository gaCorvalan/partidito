<script setup lang="ts">
import { reactive } from 'vue'
import SearchHeader from '~/components/features/SearchHeader.vue'
import FilterGroup from '~/components/features/FilterGroup.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useSearchFilters } from '~/composables/useSearchFilters'
import { useMatches } from '~/composables/useMatches'

const groups = reactive(useSearchFilters().groups)

const { matches } = useMatches()

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
        <MatchCard
          v-for="match in matches"
          :key="match.id"
          :match="match"
          @open="navigateTo(`/match/${match.id}`)"
        />
      </div>
    </div>
  </div>
</template>
