import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'

export interface ProfileStat {
  id: string
  icon: string
  value: string
  label: string
  valueClass?: string
}

export interface ProfileSkill {
  id: string
  name: string
  level: string
  progress: number
}

export interface ProfileData {
  name: string
  initials: string
  location: string
  avatarUrl?: string | null
}

const profileSeed: ProfileData = {
  name: 'Invitado',
  initials: 'IV',
  location: 'Bs As',
  avatarUrl: null
}

type ProfileRow = {
  full_name: string
  location: string | null
}

export const useProfile = () => {
  const { t } = useI18n()
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const statsSeed: ProfileStat[] = [
    {
      id: 'matches',
      icon: 'lucide:trophy',
      value: '12',
      label: t('profile.stats.matchesPlayed'),
      valueClass: 'text-2xl font-bold'
    },
    {
      id: 'area',
      icon: 'lucide:map-pin',
      value: 'Centro',
      label: t('profile.stats.area'),
      valueClass: 'text-lg font-semibold'
    }
  ]
  const skillsSeed: ProfileSkill[] = [
    {
      id: 'padel',
      name: t('sport.padel'),
      level: t('level.intermediate'),
      progress: 66
    },
    {
      id: 'football',
      name: t('sport.football'),
      level: t('level.intermediate'),
      progress: 66
    }
  ]

  const profileQuery = useQuery({
    queryKey: ['profile', userId.value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, location')
        .eq('id', userId.value)
        .single()

      if (error) {
        throw error
      }

      return data as ProfileRow
    },
    enabled: computed(() => Boolean(userId.value)),
    placeholderData: profileSeed
  })

  const profile = computed<ProfileData>(() => {
    const value = profileQuery.data.value
    const avatarUrl = user.value?.user_metadata?.picture ?? null
    if (!value || 'name' in value) {
      return {
        ...profileSeed,
        avatarUrl
      }
    }

    const initials = value.full_name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

    return {
      name: value.full_name,
      initials,
      location: value.location ?? t('profile.noZone'),
      avatarUrl
    }
  })

  return {
    profile,
    stats: statsSeed,
    skills: skillsSeed,
    isLoading: profileQuery.isLoading,
    error: computed(() => (profileQuery.error.value ? String(profileQuery.error.value) : null)),
    refresh: profileQuery.refetch
  }
}
