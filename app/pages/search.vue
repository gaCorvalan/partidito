<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import SearchHeader from '~/components/features/SearchHeader.vue'
import FilterGroup from '~/components/features/FilterGroup.vue'
import MatchCard from '~/components/features/MatchCard.vue'
import { useSearchFilters } from '~/composables/useSearchFilters'
import { useMatches } from '~/composables/useMatches'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const groups = reactive(useSearchFilters().groups)
const { matches } = useMatches()
const supabase = useSupabaseClient()
const { user } = useAuth()
const queryClient = useQueryClient()
const userId = computed(() => user.value?.id ?? null)

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
          @join="joinMutation.mutate(match.id)"
        />
      </div>
    </div>
  </div>
</template>
