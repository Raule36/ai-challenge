export interface RawActivity {
  email: string
  displayName: string
  role?: string
  unit?: string
  activityName: string
  category: string
  date: string
  points: number
}

export interface LeaderboardEntry {
  rank: number
  email: string
  displayName: string
  role?: string
  totalScore: number
  categoryBreakdown: Record<string, number>
  activities: RawActivity[]
}

export interface FilterState {
  year: number
  quarter: number
  category: string
  searchTerm: string
}
