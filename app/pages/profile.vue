<script setup lang="ts">
import { computed } from 'vue'
import ProfileHeader from '~/components/features/ProfileHeader.vue'
import ProfileStatCard from '~/components/features/ProfileStatCard.vue'
import ProfileSkillCard from '~/components/features/ProfileSkillCard.vue'
import { useProfile } from '~/composables/useProfile'
import { useAuth } from '~/composables/useAuth'
import { useMatches } from '~/composables/useMatches'
import { isTerminalMatchStatus, MATCH_STATUS } from '~/composables/useMatchState'

const { t } = useI18n()
const { profile, stats, skills } = useProfile()
const { user, signOut } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))
const { matches } = useMatches()

const handleEdit = () => {
  // Placeholder para futura edicion de perfil
}

const handleSignOut = async () => {
  await signOut()
  navigateTo('/')
}

const closedStatusLabel = {
  [MATCH_STATUS.PLAYED]: t('match.status.played'),
  [MATCH_STATUS.NOT_PLAYED]: t('match.status.notPlayed'),
  [MATCH_STATUS.CANCELLED]: t('match.status.cancelled')
} as const

const matchHistory = computed(() => {
  if (!user.value) return []
  return matches.value
    .filter((match) => isTerminalMatchStatus(match.status))
    .filter((match) => match.isJoined || match.createdBy === user.value?.id)
    .sort((a, b) => `${b.date ?? ''}${b.time ?? ''}`.localeCompare(`${a.date ?? ''}${a.time ?? ''}`))
})
</script>

<template>
  <div>
    <ProfileHeader :title="t('profile.title')" @edit="handleEdit" />
  
    <div class="p-4 space-y-6">
      <div class="flex flex-col items-center space-y-4">
      <div
        class="w-20 h-20 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-3xl font-bold overflow-hidden"
      >
        <img
          v-if="profile.avatarUrl && isAuthenticated"
          :src="profile.avatarUrl"
          :alt="profile.name"
          class="w-full h-full object-cover"
        />
        <Icon v-else-if="!isAuthenticated" name="lucide:user" class="w-8 h-8" />
        <span v-else>
          {{ profile.initials }}
        </span>
      </div>
        <h2 class="text-2xl font-bold text-foreground">
          {{ isAuthenticated ? profile.name : t('profile.guest') }}
        </h2>
      </div>
  
      <div class="grid grid-cols-2 gap-4" :class="!isAuthenticated ? 'opacity-50' : ''">
        <ProfileStatCard
          v-for="stat in stats"
          :key="stat.id"
          :icon="stat.icon"
          :value="stat.value"
          :label="stat.label"
          :value-class="stat.valueClass"
        />
      </div>
  
      <div :class="!isAuthenticated ? 'opacity-50' : ''">
        <h3 class="text-lg font-semibold text-foreground mb-3">{{ t('profile.skills') }}</h3>
        <div class="space-y-3">
          <ProfileSkillCard
            v-for="skill in skills"
            :key="skill.id"
            :name="skill.name"
            :level="skill.level"
            :progress="skill.progress"
          />
        </div>
      </div>
  
      <div :class="!isAuthenticated ? 'opacity-50' : ''">
        <label class="block text-sm font-semibold text-foreground mb-2">{{ t('profile.location') }}</label>
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:map-pin" class="w-4 h-4" />
          <span>{{ isAuthenticated ? profile.location : t('profile.noZone') }}</span>
        </div>
      </div>

      <div :class="!isAuthenticated ? 'opacity-50' : ''">
        <h3 class="text-lg font-semibold text-foreground mb-3">{{ t('profile.history') }}</h3>
        <div v-if="!isAuthenticated" class="text-sm text-muted-foreground">
          {{ t('profile.history.signIn') }}
        </div>
        <div v-else-if="!matchHistory.length" class="text-sm text-muted-foreground">
          {{ t('profile.history.empty') }}
        </div>
        <div v-else class="space-y-2">
          <button
            v-for="match in matchHistory"
            :key="match.id"
            class="w-full rounded-lg border border-border bg-card p-3 text-left hover:bg-muted transition-colors"
            type="button"
            @click="navigateTo(`/match/${match.id}`)"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-foreground capitalize">{{ match.sport }} · {{ match.level }}</p>
              <span class="text-xs text-muted-foreground">
                {{ closedStatusLabel[match.status as keyof typeof closedStatusLabel] }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ match.dateDisplay }} · {{ match.location }}</p>
          </button>
        </div>
      </div>

      <button
        v-if="isAuthenticated"
        class="w-full py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
        type="button"
        @click="handleSignOut"
      >
        {{ t('profile.signOut') }}
      </button>
      <button
        v-else
        class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        type="button"
        @click="navigateTo(`/login?returnTo=${encodeURIComponent('/profile')}`)"
      >
        {{ t('profile.signInCta') }}
      </button>
    </div>
  </div>
</template>
