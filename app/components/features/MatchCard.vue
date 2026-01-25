<template>
  <div class="bg-card border border-border rounded-2xl p-4 space-y-3 hover:shadow-md transition-shadow cursor-pointer">
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <h3 class="font-semibold text-sm text-foreground capitalize">{{ match.sport }} · {{ match.level }}</h3>
        <span
          :class="[
            'inline-block px-2 py-1 rounded-full text-xs font-medium',
            match.isFull
              ? 'bg-muted text-muted-foreground'
              : 'bg-green-100 text-green-700'
          ]"
        >
          {{ match.isFull ? 'Full' : `${match.missingPlayers} Missing` }}
        </span>
      </div>
      <div class="text-right">
        <p class="text-sm font-semibold text-foreground">${{ match.price }}</p>
        <p class="text-xs text-muted-foreground">per player</p>
      </div>
    </div>
    <div class="space-y-1.5 text-sm text-card-foreground">
      <p class="font-medium">{{ match.dateDisplay }}</p>
      <div class="flex items-center gap-1 text-muted-foreground">
        <Icon name="lucide:map-pin" class="w-4 h-4" />
        <span>{{ match.location }}</span>
        <span class="text-xs">· {{ match.distance }} km</span>
      </div>
    </div>
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <div class="flex items-center gap-2">
        <div class="flex -space-x-2">
          <div
            v-for="(player, index) in match.players.slice(0, 3)"
            :key="index"
            class="w-7 h-7 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs text-primary font-bold"
          >
            {{ player }}
          </div>
        </div>
        <span class="text-sm text-muted-foreground">{{ match.currentPlayers }}/{{ match.totalPlayers }}</span>
      </div>
      <button
        :disabled="match.isFull"
        :class="[
          'px-4 py-1.5 rounded-lg font-medium text-sm transition-colors',
          match.isFull
            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        ]"
      >
        {{ match.isFull ? 'Full' : 'Join' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Match {
  sport: string
  level: string
  missingPlayers: number
  price: number
  dateDisplay: string
  location: string
  distance: number
  currentPlayers: number
  totalPlayers: number
  isFull: boolean
  players: string[]
}

defineProps<{
  match: Match
}>()
</script>
