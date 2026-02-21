export const MATCH_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  PLAYED: 'played',
  NOT_PLAYED: 'not_played',
  CANCELLED: 'cancelled'
} as const

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS]

const TERMINAL_STATUSES: MatchStatus[] = [
  MATCH_STATUS.PLAYED,
  MATCH_STATUS.NOT_PLAYED,
  MATCH_STATUS.CANCELLED
]

const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  [MATCH_STATUS.OPEN]: [MATCH_STATUS.FULL, MATCH_STATUS.PLAYED, MATCH_STATUS.NOT_PLAYED, MATCH_STATUS.CANCELLED],
  [MATCH_STATUS.FULL]: [MATCH_STATUS.OPEN, MATCH_STATUS.PLAYED, MATCH_STATUS.NOT_PLAYED, MATCH_STATUS.CANCELLED],
  [MATCH_STATUS.PLAYED]: [],
  [MATCH_STATUS.NOT_PLAYED]: [],
  [MATCH_STATUS.CANCELLED]: []
}

export const isTerminalMatchStatus = (status: MatchStatus) => TERMINAL_STATUSES.includes(status)

export const isMatchFull = (status: MatchStatus) => status === MATCH_STATUS.FULL

export const isJoinableMatchStatus = (status: MatchStatus) =>
  status === MATCH_STATUS.OPEN || status === MATCH_STATUS.FULL

export const deriveMatchStatusFromMissing = (
  missingPlayers: number,
  currentStatus?: MatchStatus
): MatchStatus => {
  if (currentStatus && isTerminalMatchStatus(currentStatus)) return currentStatus
  return missingPlayers <= 0 ? MATCH_STATUS.FULL : MATCH_STATUS.OPEN
}

export const toMatchStatus = (value: string, missingPlayers: number): MatchStatus => {
  const knownStatus = Object.values(MATCH_STATUS).find((status) => status === value) as MatchStatus | undefined
  if (!knownStatus) return deriveMatchStatusFromMissing(missingPlayers)
  if (knownStatus === MATCH_STATUS.OPEN || knownStatus === MATCH_STATUS.FULL) {
    return deriveMatchStatusFromMissing(missingPlayers)
  }
  return knownStatus
}

export const canTransitionMatchStatus = (from: MatchStatus, to: MatchStatus) => {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from].includes(to)
}

export const getMatchStatusLabel = (status: MatchStatus, missingPlayers: number) => {
  const { t } = useI18n()
  if (status === MATCH_STATUS.PLAYED) return t('match.status.played')
  if (status === MATCH_STATUS.NOT_PLAYED) return t('match.status.notPlayed')
  if (status === MATCH_STATUS.CANCELLED) return t('match.status.cancelled')
  if (status === MATCH_STATUS.FULL) return t('match.status.full')
  return t('match.status.missing', { count: missingPlayers })
}

export const getMatchStartDate = (date?: string, time?: string) => {
  if (!date || !time) return null
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || hour === undefined || minute === undefined) return null
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

export const hasMatchStarted = (date?: string, time?: string) => {
  const startDate = getMatchStartDate(date, time)
  if (!startDate) return false
  return Date.now() >= startDate.getTime()
}

export const isDiscoverableMatch = (input: {
  status: MatchStatus
  missingPlayers: number
  date?: string
  time?: string
}) => {
  if (isTerminalMatchStatus(input.status)) return false
  if (hasMatchStarted(input.date, input.time)) return false
  return input.status === MATCH_STATUS.OPEN && input.missingPlayers > 0
}

export const isHistoricalOrClosedMatch = (input: {
  status: MatchStatus
  date?: string
  time?: string
}) => {
  if (isTerminalMatchStatus(input.status)) return true
  return hasMatchStarted(input.date, input.time)
}
