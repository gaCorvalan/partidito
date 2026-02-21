<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import PublishHeader from '~/components/features/PublishHeader.vue'
import PublishSelectField from '~/components/features/PublishSelectField.vue'
import PublishOptionGroup from '~/components/features/PublishOptionGroup.vue'
import PublishLevelGroup from '~/components/features/PublishLevelGroup.vue'
import PublishInputField from '~/components/features/PublishInputField.vue'
import PublishSubmitBar from '~/components/features/PublishSubmitBar.vue'
import { usePublishForm } from '~/composables/usePublishForm'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'
import { deriveMatchStatusFromMissing } from '~/composables/useMatchState'
import { useMatchParticipation } from '~/composables/useMatchParticipation'

type Club = {
  id: string
  name: string
  address: string | null
  zone: string | null
  city: string
}

const route = useRoute()
const { t } = useI18n()
const { sportOptions, levelOptions, missingPlayersOptions } = usePublishForm()

const sport = ref('padel')
const missingPlayers = ref('1')

const toDateInputValue = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const date = ref(toDateInputValue())
const time = ref('19:00')
const level = ref('intermediate')
const price = ref('2500')
const note = ref('')
const autoJoin = ref(true)

const isClubPickerOpen = ref(false)
const isPickerSearchPinned = ref(false)
const clubSearch = ref('')
const selectedClubId = ref<string | null>(null)
const draftSelectedClubId = ref<string | null>(null)
const submitError = ref<string | null>(null)

const supabase = useSupabaseClient()
const queryClient = useQueryClient()
const { user } = useAuth()
const userId = computed(() => user.value?.id ?? null)
const { joinMatchAsync } = useMatchParticipation()

const clubsQuery = useQuery({
  queryKey: ['clubs-active'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, address, zone, city')
      .order('name', { ascending: true })

    if (error) throw error
    return (data as Club[]) ?? []
  },
  initialData: [] as Club[],
  enabled: false
})

const clubs = computed(() => clubsQuery.data.value ?? [])

const selectedClub = computed(() => {
  if (!selectedClubId.value) return null
  return clubs.value.find((club) => club.id === selectedClubId.value) ?? null
})

const selectedClubLabel = computed(() => {
  if (!selectedClub.value) return ''
  const metadata = [selectedClub.value.zone, selectedClub.value.address].filter(Boolean).join(' · ')
  return metadata ? `${selectedClub.value.name} · ${metadata}` : selectedClub.value.name
})

const filteredClubs = computed(() => {
  const query = clubSearch.value.trim().toLowerCase()
  if (!query) return clubs.value

  return clubs.value.filter((club) => {
    const haystack = [club.name, club.zone, club.city, club.address].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(query)
  })
})

const totalPlayers = computed(() => (sport.value === 'padel' ? 4 : 8))

const openClubPicker = async () => {
  draftSelectedClubId.value = selectedClubId.value
  isClubPickerOpen.value = true
  isPickerSearchPinned.value = false
  if (process.client && !clubsQuery.isFetched.value) {
    await clubsQuery.refetch()
  }
  nextTick(() => {
    isPickerSearchPinned.value = true
  })
}

const closeClubPicker = () => {
  isClubPickerOpen.value = false
  isPickerSearchPinned.value = false
}

const confirmClubSelection = () => {
  if (!draftSelectedClubId.value) return
  selectedClubId.value = draftSelectedClubId.value
  submitError.value = null
  closeClubPicker()
}

const publishMutation = useMutation({
  mutationFn: async () => {
    if (!userId.value) {
      navigateTo(`/login?returnTo=${encodeURIComponent(route.fullPath)}`)
      return
    }

    if (!selectedClub.value) {
      throw new Error(t('create.error.clubRequired'))
    }

    const selectedMissingPlayers = Number(missingPlayers.value)
    // Si el creador se une automaticamente, creamos con un faltante extra
    // para que al ejecutar el auto-join el faltante final coincida con lo elegido.
    const missingPlayersValue = Math.min(
      selectedMissingPlayers + (autoJoin.value ? 1 : 0),
      totalPlayers.value
    )
    const snapshot = [selectedClub.value.name, selectedClub.value.zone, selectedClub.value.address]
      .filter(Boolean)
      .join(' · ')

    const { data, error } = await supabase
      .from('matches')
      .insert({
        sport: sport.value,
        level: level.value,
        date: date.value,
        time: time.value,
        venue: selectedClub.value.name,
        venue_snapshot: snapshot || selectedClub.value.name,
        club_id: selectedClub.value.id,
        price: Number(price.value),
        note: note.value || null,
        missing_players: missingPlayersValue,
        total_players: totalPlayers.value,
        status: deriveMatchStatusFromMissing(missingPlayersValue),
        created_by: userId.value
      })
      .select('id')
      .single()

    if (error) throw error

    if (data?.id && autoJoin.value) {
      await joinMatchAsync(data.id, route.fullPath)
    }

    return data
  },
  onSuccess: (data) => {
    submitError.value = null
    queryClient.invalidateQueries({ queryKey: ['matches'] })
    if (data?.id) {
      navigateTo(`/match/${data.id}`)
    }
  },
  onError: (mutationError: unknown) => {
    const message = mutationError instanceof Error ? mutationError.message : String(mutationError)
    submitError.value = message.replace('Error: ', '')
  }
})

const handleBack = () => {
  if (isClubPickerOpen.value) {
    closeClubPicker()
    return
  }
  navigateTo('/')
}

const handleSubmit = () => {
  submitError.value = null
    if (!selectedClub.value) {
    submitError.value = t('create.error.clubRequired')
    void openClubPicker()
    return
  }
  publishMutation.mutate()
}
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <PublishHeader :title="t('create.title')" @back="handleBack" />

    <div class="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:trophy" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">{{ t('create.section.setup') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('create.setup.subtitle') }}</p>
          </div>
        </div>
        <PublishSelectField :label="t('create.field.sport')" :options="sportOptions" v-model="sport" />
        <PublishOptionGroup
          :label="t('create.field.missingPlayers')"
          :options="missingPlayersOptions"
          v-model="missingPlayers"
        />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:calendar" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">{{ t('create.section.schedule') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('create.schedule.subtitle') }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <PublishInputField :label="t('create.field.date')" type="date" v-model="date" />
          <PublishInputField :label="t('create.field.time')" type="time" v-model="time" />
        </div>
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2">
          <Icon name="lucide:map-pin" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">{{ t('create.section.club') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('create.club.subtitle') }}</p>
          </div>
        </div>
        <button
          class="w-full text-left rounded-xl border border-border bg-input px-3 py-3"
          type="button"
          @click="openClubPicker"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:search" class="w-4 h-4 text-muted-foreground" />
            <div class="min-w-0 flex-1">
              <p v-if="selectedClub" class="text-sm font-medium text-foreground truncate">{{ selectedClub.name }}</p>
              <p v-else class="text-sm text-muted-foreground">{{ t('create.club.searchOrSelect') }}</p>
              <p v-if="selectedClub" class="text-xs text-muted-foreground truncate">{{ selectedClubLabel }}</p>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:signal" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">{{ t('create.section.levelPrice') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('create.levelPrice.subtitle') }}</p>
          </div>
        </div>
        <PublishLevelGroup :label="t('create.field.level')" :options="levelOptions" v-model="level" />
        <PublishInputField :label="t('create.field.price')" type="number" v-model="price" />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:sticky-note" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">{{ t('create.section.notes') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('create.notes.subtitle') }}</p>
          </div>
        </div>
        <PublishInputField
          :label="t('create.field.note')"
          :placeholder="t('create.field.notePlaceholder')"
          as="textarea"
          :rows="3"
          v-model="note"
        />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-foreground">{{ t('create.autoJoin.title') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('create.autoJoin.subtitle') }}</p>
          </div>
          <button
            class="w-11 h-6 rounded-full transition-colors"
            :class="autoJoin ? 'bg-primary' : 'bg-muted'"
            type="button"
            @click="autoJoin = !autoJoin"
          >
            <span
              class="block w-5 h-5 bg-background rounded-full transition-transform"
              :class="autoJoin ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
        </div>
      </div>

      <p v-if="submitError" class="text-xs text-destructive">{{ submitError }}</p>
    </div>

    <PublishSubmitBar :label="t('create.submit')" @submit="handleSubmit" />

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="isClubPickerOpen" class="fixed inset-0 z-50 flex justify-center">
        <div class="w-full max-w-xl h-full bg-background border-x border-border flex flex-col">
        <div class="sticky top-0 z-10 bg-background border-b border-border">
          <div class="flex items-center justify-between p-4 pb-2">
            <button class="p-2 hover:bg-muted rounded-lg transition-colors" type="button" @click="closeClubPicker">
              <Icon name="lucide:chevron-left" class="w-5 h-5 text-foreground" />
            </button>
            <h2 class="text-base font-semibold text-foreground">{{ t('create.club.pickerTitle') }}</h2>
            <button
              class="text-sm font-semibold text-primary disabled:text-muted-foreground"
              type="button"
              :disabled="!draftSelectedClubId"
              @click="confirmClubSelection"
            >
              {{ t('common.confirm') }}
            </button>
          </div>

          <div class="px-4 pb-3">
            <div
              class="relative transition-all duration-300"
              :class="isPickerSearchPinned ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
            >
              <Icon name="lucide:search" class="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="clubSearch"
                type="search"
                :placeholder="t('create.club.searchPlaceholder')"
                class="w-full rounded-xl border border-border bg-input pl-9 pr-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                :autofocus="isClubPickerOpen"
              />
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="clubsQuery.isLoading.value || clubsQuery.isFetching.value" class="space-y-2">
            <div v-for="index in 6" :key="index" class="h-16 rounded-xl bg-muted animate-pulse" />
          </div>

          <div v-else-if="clubsQuery.error.value" class="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {{ t('create.club.loadError') }}
          </div>

          <div v-else-if="!filteredClubs.length" class="rounded-xl border border-border p-4 text-sm text-muted-foreground">
            {{ t('create.club.searchEmpty') }}
          </div>

          <button
            v-for="club in filteredClubs"
            :key="club.id"
            class="w-full rounded-xl border p-3 text-left transition-colors"
            :class="draftSelectedClubId === club.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted'"
            type="button"
            @click="draftSelectedClubId = club.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-foreground truncate">{{ club.name }}</p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ [club.zone, club.address, club.city].filter(Boolean).join(' · ') }}
                </p>
              </div>
              <Icon
                :name="draftSelectedClubId === club.id ? 'lucide:check-circle-2' : 'lucide:circle'"
                class="w-4 h-4 mt-0.5"
                :class="draftSelectedClubId === club.id ? 'text-primary' : 'text-muted-foreground'"
              />
            </div>
          </button>
        </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
