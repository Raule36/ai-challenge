import type { RawActivity, LeaderboardEntry, FilterState } from "../data/types.ts"

function getQuarter(dateStr: string): number {
  const month = new Date(dateStr).getMonth()
  return Math.floor(month / 3) + 1
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

function inferRole(categoryBreakdown: Record<string, number>): string {
  const keys = Object.keys(categoryBreakdown).map((k) => k.toLowerCase())
  if (keys.some((k) => k.includes("training"))) return "Senior Developer"
  if (keys.some((k) => k.includes("mentor"))) return "DevOps Engineer"
  if (keys.some((k) => k.includes("community"))) return "Product Designer"
  return "Team Member"
}

export { getInitials, inferRole }

export function processLeaderboard(
  rawActivities: RawActivity[],
  filters: FilterState
): LeaderboardEntry[] {
  let filtered = rawActivities

  if (filters.year > 0) {
    filtered = filtered.filter(
      (a) => new Date(a.date).getFullYear() === filters.year
    )
  }

  if (filters.quarter > 0) {
    filtered = filtered.filter((a) => getQuarter(a.date) === filters.quarter)
  }

  if (filters.category !== "all") {
    filtered = filtered.filter((a) => a.category === filters.category)
  }

  const grouped = new Map<
    string,
    { activities: RawActivity[]; names: string[]; roles: string[]; units: string[] }
  >()

  for (const activity of filtered) {
    const key = activity.email.toLowerCase()
    if (!grouped.has(key)) {
      grouped.set(key, { activities: [], names: [], roles: [], units: [] })
    }
    const group = grouped.get(key)!
    group.activities.push(activity)
    group.names.push(activity.displayName)
    if (activity.role) group.roles.push(activity.role)
    if (activity.unit) group.units.push(activity.unit)
  }

  const entries: LeaderboardEntry[] = []

  for (const [email, group] of grouped) {
    const nameCounts = new Map<string, number>()
    for (const n of group.names) {
      nameCounts.set(n, (nameCounts.get(n) || 0) + 1)
    }
    const displayName = [...nameCounts.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0][0]

    const roleCounts = new Map<string, number>()
    for (const r of group.roles) {
      roleCounts.set(r, (roleCounts.get(r) || 0) + 1)
    }
    let role: string | undefined
    if (roleCounts.size > 0) {
      role = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    }

    if (group.units.length > 0) {
      const unitCounts = new Map<string, number>()
      for (const u of group.units) {
        unitCounts.set(u, (unitCounts.get(u) || 0) + 1)
      }
      const unit = [...unitCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0][0]
      if (role) {
        role = `${role} (${unit})`
      }
    }

    const totalScore = group.activities.reduce((sum, a) => sum + a.points, 0)

    const categoryBreakdown: Record<string, number> = {}
    for (const a of group.activities) {
      categoryBreakdown[a.category] =
        (categoryBreakdown[a.category] || 0) + a.points
    }

    const activities = [...group.activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    entries.push({
      rank: 0,
      email,
      displayName,
      role,
      totalScore,
      categoryBreakdown,
      activities,
    })
  }

  entries.sort((a, b) => b.totalScore - a.totalScore)
  entries.forEach((e, i) => {
    e.rank = i + 1
  })

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    return entries.filter(
      (e) =>
        e.displayName.toLowerCase().includes(term) ||
        (e.role && e.role.toLowerCase().includes(term))
    )
  }

  return entries
}

export function extractYears(activities: RawActivity[]): number[] {
  const years = new Set<number>()
  for (const a of activities) {
    years.add(new Date(a.date).getFullYear())
  }
  return [...years].sort((a, b) => b - a)
}

export function extractCategories(activities: RawActivity[]): string[] {
  const cats = new Set<string>()
  for (const a of activities) {
    cats.add(a.category)
  }
  return [...cats].sort()
}
