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
  const { t } = useI18n()

  const sportOptions: PublishOption[] = [
    { label: t('sport.padel'), value: 'padel' },
    { label: t('sport.football'), value: 'football' }
  ]

  const levelOptions: PublishOption[] = [
    { label: t('level.beginner'), value: 'beginner' },
    { label: t('level.intermediate'), value: 'intermediate' },
    { label: t('level.advanced'), value: 'advanced' }
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
