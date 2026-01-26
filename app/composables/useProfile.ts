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
}

export const useProfile = () => {
  const profile: ProfileData = {
    name: 'Juan Diego',
    initials: 'JD',
    location: 'Downtown'
  }

  const stats: ProfileStat[] = [
    {
      id: 'matches',
      icon: 'lucide:trophy',
      value: '12',
      label: 'Matches played',
      valueClass: 'text-2xl font-bold'
    },
    {
      id: 'area',
      icon: 'lucide:map-pin',
      value: 'Downtown',
      label: 'Area',
      valueClass: 'text-lg font-semibold'
    }
  ]

  const skills: ProfileSkill[] = [
    {
      id: 'padel',
      name: 'Padel',
      level: 'intermediate',
      progress: 66
    },
    {
      id: 'football',
      name: 'Football',
      level: 'intermediate',
      progress: 66
    }
  ]

  return { profile, stats, skills }
}
