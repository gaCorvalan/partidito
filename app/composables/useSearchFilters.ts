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
  const groups: FilterGroup[] = [
    {
      id: 'sport',
      label: 'Sport',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Padel', value: 'padel' },
        { label: 'Football', value: 'football' }
      ]
    },
    {
      id: 'date',
      label: 'Date',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Tomorrow', value: 'tomorrow' },
        { label: 'Week', value: 'week' }
      ]
    },
    {
      id: 'time',
      label: 'Time',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Morning', value: 'morning' },
        { label: 'Afternoon', value: 'afternoon' },
        { label: 'Evening', value: 'evening' }
      ]
    },
    {
      id: 'distance',
      label: 'Max Distance',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: '1 km', value: '1' },
        { label: '3 km', value: '3' },
        { label: '5 km', value: '5' },
        { label: '10 km', value: '10' }
      ]
    },
    {
      id: 'level',
      label: 'Level',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' }
      ]
    }
  ]

  return { groups }
}
