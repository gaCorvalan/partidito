export type FilterOption = {
  label: string
  value: string
}

export type FilterGroup = {
  id: string
  label: string
  options: FilterOption[]
  selected: string
}

export const useSearchFilters = () => {
  const { t } = useI18n()

  const groups: FilterGroup[] = [
    {
      id: 'sport',
      label: t('search.group.sport'),
      selected: 'all',
      options: [
        { label: t('filters.all'), value: 'all' },
        { label: t('sport.padel'), value: 'padel' },
        { label: t('sport.football'), value: 'football' }
      ]
    },
    {
      id: 'date',
      label: t('search.group.date'),
      selected: 'all',
      options: [
        { label: t('filters.all'), value: 'all' },
        { label: t('filters.today'), value: 'today' },
        { label: t('filters.tomorrow'), value: 'tomorrow' },
        { label: t('filters.week'), value: 'week' }
      ]
    },
    {
      id: 'time',
      label: t('search.group.time'),
      selected: 'all',
      options: [
        { label: t('filters.all'), value: 'all' },
        { label: t('filters.morning'), value: 'morning' },
        { label: t('filters.afternoon'), value: 'afternoon' },
        { label: t('filters.evening'), value: 'evening' }
      ]
    },
    {
      id: 'distance',
      label: t('filters.maxDistance'),
      selected: '3',
      options: [
        { label: t('filters.all'), value: 'all' },
        { label: '1 km', value: '1' },
        { label: '3 km', value: '3' },
        { label: '5 km', value: '5' },
        { label: '10 km', value: '10' }
      ]
    },
    {
      id: 'level',
      label: t('search.group.level'),
      selected: 'all',
      options: [
        { label: t('filters.all'), value: 'all' },
        { label: t('level.beginner'), value: 'beginner' },
        { label: t('level.intermediate'), value: 'intermediate' },
        { label: t('level.advanced'), value: 'advanced' }
      ]
    }
  ]

  return { groups }
}
