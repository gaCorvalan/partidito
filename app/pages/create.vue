<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import PublishHeader from '~/components/features/PublishHeader.vue'
import PublishSelectField from '~/components/features/PublishSelectField.vue'
import PublishOptionGroup from '~/components/features/PublishOptionGroup.vue'
import PublishLevelGroup from '~/components/features/PublishLevelGroup.vue'
import PublishInputField from '~/components/features/PublishInputField.vue'
import PublishSubmitBar from '~/components/features/PublishSubmitBar.vue'
import { usePublishForm } from '~/composables/usePublishForm'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { sportOptions, dateOptions, levelOptions, missingPlayersOptions } = usePublishForm()

const sport = ref('padel')
const missingPlayers = ref('1')
const date = ref('today')
const time = ref('19:00')
const venue = ref('')
const level = ref('intermediate')
const price = ref('2500')
const note = ref('')
const autoJoin = ref(true)

const supabase = useSupabaseClient()
const queryClient = useQueryClient()
const userId = computed(() => user.value?.id ?? null)
const { user } = useAuth()

const resolvedDate = computed(() => {
  const base = new Date()
  if (date.value === 'tomorrow') {
    base.setDate(base.getDate() + 1)
  }
  if (date.value === 'week') {
    base.setDate(base.getDate() + 3)
  }
  return base.toISOString().slice(0, 10)
})

const totalPlayers = computed(() => (sport.value === 'padel' ? 4 : 8))

const publishMutation = useMutation({
  mutationFn: async () => {
    if (!userId.value) {
      navigateTo(`/login?returnTo=${encodeURIComponent(route.fullPath)}`)
      return
    }

    const { data, error } = await supabase
      .from('matches')
      .insert({
        sport: sport.value,
        level: level.value,
        date: resolvedDate.value,
        time: time.value,
        venue: venue.value || 'Sin lugar',
        price: Number(price.value),
        note: note.value || null,
        missing_players: Number(missingPlayers.value),
        total_players: totalPlayers.value,
        status: 'open',
        created_by: userId.value
      })
      .select('id')
      .single()

    if (error) throw error
    if (data?.id && autoJoin.value) {
      await supabase
        .from('match_participants')
        .insert({ match_id: data.id, user_id: userId.value })

      const userName =
        user.value?.user_metadata?.full_name ||
        user.value?.user_metadata?.name ||
        user.value?.email ||
        'Usuario'

      await supabase.from('messages').insert({
        match_id: data.id,
        user_id: userId.value,
        type: 'system',
        content: `${userName} creo el partido`
      })
    }

    return data
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['matches'] })
    if (data?.id) {
      navigateTo(`/match/${data.id}`)
    }
  }
})

const handleBack = () => {
  navigateTo('/')
}

const handleSubmit = () => {
  publishMutation.mutate()
}
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <PublishHeader title="Create match" @back="handleBack" />

    <div class="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:trophy" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">Match setup</p>
            <p class="text-xs text-muted-foreground">Define el deporte y los cupos.</p>
          </div>
        </div>
        <PublishSelectField label="Sport" :options="sportOptions" v-model="sport" />
        <PublishOptionGroup
          label="Missing Players"
          :options="missingPlayersOptions"
          v-model="missingPlayers"
        />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:calendar" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">Schedule</p>
            <p class="text-xs text-muted-foreground">Elige fecha y hora.</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <PublishSelectField label="Date" :options="dateOptions" v-model="date" />
          <PublishInputField label="Time" type="time" v-model="time" />
        </div>
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:map-pin" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">Location</p>
            <p class="text-xs text-muted-foreground">Indica el lugar del partido.</p>
          </div>
        </div>
        <PublishInputField label="Venue" placeholder="e.g., Central Courts" v-model="venue" />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:signal" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">Level & price</p>
            <p class="text-xs text-muted-foreground">Define el nivel y el costo.</p>
          </div>
        </div>
        <PublishLevelGroup label="Level" :options="levelOptions" v-model="level" />
        <PublishInputField label="Price per Player (COP)" type="number" v-model="price" />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:sticky-note" class="w-4 h-4 text-primary" />
          <div>
            <p class="text-sm font-semibold text-foreground">Notes</p>
            <p class="text-xs text-muted-foreground">Detalles opcionales para los jugadores.</p>
          </div>
        </div>
        <PublishInputField
          label="Note (optional)"
          placeholder="Add any details about the match..."
          as="textarea"
          :rows="3"
          v-model="note"
        />
      </div>

      <div class="bg-card border border-border rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-foreground">Unirme automaticamente</p>
            <p class="text-xs text-muted-foreground">El creador se suma al partido.</p>
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
    </div>

    <PublishSubmitBar label="Publish match" @submit="handleSubmit" />
  </div>
</template>
