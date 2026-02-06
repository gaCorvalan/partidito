<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import SearchHeader from '~/components/features/SearchHeader.vue'
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
const isFiltersOpen = ref(false)

const activeFiltersCount = computed(() => {
  return groups.filter((group) => group.selected !== 'all').length
})

const filterValueLabel = (groupId: string) => {
  const group = groups.find((item) => item.id === groupId)
  if (!group) return ''
  const option = group.options.find((item) => item.value === group.selected)
  return option?.label ?? ''
}

const getGroup = (groupId: string) => {
  return groups.find((item) => item.id === groupId)
}

const sportGroup = computed(() => getGroup('sport'))
const dateGroup = computed(() => getGroup('date'))
const timeGroup = computed(() => getGroup('time'))
const distanceGroup = computed(() => getGroup('distance'))
const levelGroup = computed(() => getGroup('level'))

const distanceOptions = computed(() => distanceGroup.value?.options ?? [])
const distanceIndex = computed({
  get() {
    if (!distanceGroup.value) return 0
    const index = distanceOptions.value.findIndex(
      (option) => option.value === distanceGroup.value?.selected
    )
    return index >= 0 ? index : 0
  },
  set(value: number) {
    const option = distanceOptions.value[value]
    if (option) {
      handleSelect('distance', option.value)
    }
  }
})

const summaryText = computed(() => {
  const sport = filterValueLabel('sport')
  const date = filterValueLabel('date')
  const distance = filterValueLabel('distance')
  const level = filterValueLabel('level')

  const parts = [sport, date, distance, level].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Todos los partidos'
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

    <div class="bg-background border-b border-border px-4 py-3">
      <button
        class="w-full flex items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-2 text-left"
        type="button"
        @click="isFiltersOpen = true"
      >
        <div class="min-w-0">
          <p class="text-xs text-muted-foreground">Filtros activos</p>
          <p class="text-sm font-semibold text-foreground truncate">{{ summaryText }}</p>
        </div>
        <div class="flex items-center gap-2 text-primary">
          <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
          <span class="text-xs font-semibold">Editar</span>
          <span v-if="activeFiltersCount" class="text-xs">({{ activeFiltersCount }})</span>
        </div>
      </button>
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

    <div v-if="isFiltersOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/30" @click="isFiltersOpen = false"></div>
      <div
        class="absolute inset-0 bg-background border-border flex flex-col"
      >
        <div class="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-foreground">Filtros</h2>
            <p class="text-xs text-muted-foreground">Personaliza tu busqueda</p>
          </div>
          <button
            class="text-sm font-medium text-muted-foreground"
            type="button"
            @click="isFiltersOpen = false"
          >
            Done
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <div v-if="sportGroup" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foreground">Sport</h3>
              <span class="text-xs text-muted-foreground">Elegi un deporte</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in sportGroup.options"
                :key="option.value"
                class="rounded-xl border px-3 py-3 text-xs font-semibold transition-colors"
                :class="
                  option.value === sportGroup.selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:bg-muted'
                "
                type="button"
                @click="handleSelect('sport', option.value)"
              >
                <span class="block text-xs font-medium">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <div v-if="dateGroup" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foreground">Date</h3>
              <span class="text-xs text-muted-foreground">Cuando queres jugar</span>
            </div>
            <div class="flex items-center gap-2 rounded-full bg-muted p-1">
              <button
                v-for="option in dateGroup.options"
                :key="option.value"
                class="flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="
                  option.value === dateGroup.selected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                "
                type="button"
                @click="handleSelect('date', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="timeGroup" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foreground">Time</h3>
              <span class="text-xs text-muted-foreground">Franja horaria</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in timeGroup.options"
                :key="option.value"
                class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="
                  option.value === timeGroup.selected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                "
                type="button"
                @click="handleSelect('time', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="distanceGroup" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foreground">Distance</h3>
              <span class="text-xs text-muted-foreground">Maximo en km</span>
            </div>
            <div class="space-y-3">
              <input
                v-model="distanceIndex"
                type="range"
                :min="0"
                :max="distanceOptions.length - 1"
                step="1"
                class="w-full accent-primary"
              />
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span v-for="option in distanceOptions" :key="option.value">{{ option.label }}</span>
              </div>
            </div>
          </div>

          <div v-if="levelGroup" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foreground">Level</h3>
              <span class="text-xs text-muted-foreground">Nivel de juego</span>
            </div>
            <div class="space-y-2">
              <button
                v-for="option in levelGroup.options"
                :key="option.value"
                class="w-full rounded-xl border px-4 py-3 text-left transition-colors group"
                :class="
                  option.value === levelGroup.selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:bg-muted'
                "
                type="button"
                @click="handleSelect('level', option.value)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold capitalize">{{ option.label }}</p>
                    <p
                      class="text-xs"
                      :class="
                        option.value === levelGroup.selected
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground group-hover:text-foreground/70'
                      "
                    >
                      {{
                        option.value === 'beginner'
                          ? 'Nivel inicial'
                          : option.value === 'intermediate'
                            ? 'Juego constante'
                            : option.value === 'advanced'
                              ? 'Competitivo'
                              : 'Todos los niveles'
                      }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1">
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="
                        option.value === 'beginner'
                          ? 'bg-emerald-400'
                          : option.value === levelGroup.selected
                            ? 'bg-primary-foreground/70'
                            : 'bg-muted group-hover:bg-foreground/30'
                      "
                    ></span>
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="
                        option.value === 'intermediate'
                          ? 'bg-amber-400'
                          : option.value === levelGroup.selected
                            ? 'bg-primary-foreground/70'
                            : 'bg-muted group-hover:bg-foreground/30'
                      "
                    ></span>
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="
                        option.value === 'advanced'
                          ? 'bg-rose-400'
                          : option.value === levelGroup.selected
                            ? 'bg-primary-foreground/70'
                            : 'bg-muted group-hover:bg-foreground/30'
                      "
                    ></span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
