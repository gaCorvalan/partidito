<script setup lang="ts">
import { computed } from 'vue'
import ProfileHeader from '~/components/features/ProfileHeader.vue'
import ProfileStatCard from '~/components/features/ProfileStatCard.vue'
import ProfileSkillCard from '~/components/features/ProfileSkillCard.vue'
import { useProfile } from '~/composables/useProfile'
import { useAuth } from '~/composables/useAuth'

const { profile, stats, skills } = useProfile()
const { user, signOut } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))

const handleEdit = () => {
  // Placeholder para futura edicion de perfil
}

const handleSignOut = async () => {
  await signOut()
  navigateTo('/')
}
</script>

<template>
  <div>
    <ProfileHeader title="Profile" @edit="handleEdit" />
  
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
          {{ isAuthenticated ? profile.name : 'Invitado' }}
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
        <h3 class="text-lg font-semibold text-foreground mb-3">Skills</h3>
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
        <label class="block text-sm font-semibold text-foreground mb-2">Location</label>
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:map-pin" class="w-4 h-4" />
          <span>{{ isAuthenticated ? profile.location : 'Sin zona' }}</span>
        </div>
      </div>

      <button
        v-if="isAuthenticated"
        class="w-full py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
        type="button"
        @click="handleSignOut"
      >
        Sign out
      </button>
      <button
        v-else
        class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        type="button"
        @click="navigateTo(`/login?returnTo=${encodeURIComponent('/profile')}`)"
      >
        Inicia sesion para personalizar tu perfil
      </button>
    </div>
  </div>
</template>
