export interface PublishOption {
  label: string
  value: string
}

export interface PublishSelectField {
  id: string
  label: string
  options: PublishOption[]
  selected: string
}

export const usePublishForm = () => {
  const sportOptions: PublishOption[] = [
    { label: 'Padel', value: 'padel' },
    { label: 'Football', value: 'football' }
  ]

  const levelOptions: PublishOption[] = [
    { label: 'beginner', value: 'beginner' },
    { label: 'intermediate', value: 'intermediate' },
    { label: 'advanced', value: 'advanced' }
  ]

  const missingPlayersOptions: PublishOption[] = [
    { label: '1', value: '1' },
    { label: '2', value: '2' }
  ]

  return {
    sportOptions,
    levelOptions,
    missingPlayersOptions
  }
}
