# Leaderboard Replica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-perfect React replica of a SharePoint leaderboard web part with filters, podium, expandable user rows, and fictional data.

**Architecture:** Single-page React app. A root `Leaderboard` component owns all state (items, filters, expandedEmail). Child components (`Header`, `FilterBar`, `Podium`, `UserRow`, `ActivityDetails`) are pure/presentational. Processing logic lives in a utility module. Data comes from a static JSON import.

**Tech Stack:** React 19, TypeScript 6, Vite 8, @fluentui/react (Dropdown, SearchBox, Icon, TooltipHost, Spinner, MessageBar), date-fns, CSS Modules.

---

## File Structure

```
task-01/src/
├── data/
│   ├── types.ts                        # RawActivity, LeaderboardEntry, FilterState types
│   └── activities.json                 # 15-20 fictional people, ~80 activities
├── utils/
│   ├── processLeaderboard.ts           # Filter, group, sort, rank logic
│   └── categoryMeta.ts                 # Icon mapping + badge color logic
├── components/
│   ├── Header.tsx
│   ├── Header.module.css
│   ├── FilterBar.tsx
│   ├── FilterBar.module.css
│   ├── Podium.tsx
│   ├── Podium.module.css
│   ├── UserRow.tsx
│   ├── UserRow.module.css
│   ├── ActivityDetails.tsx
│   ├── ActivityDetails.module.css
│   ├── Leaderboard.tsx
│   └── Leaderboard.module.css
├── App.tsx
├── App.css                             # Empty (reset only in index.css)
├── index.css                           # Minimal reset
└── main.tsx                            # initializeIcons() + render
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `task-01/package.json`

- [ ] **Step 1: Install @fluentui/react and date-fns**

```bash
cd task-01 && npm install @fluentui/react date-fns
```

- [ ] **Step 2: Verify build still works**

```bash
cd task-01 && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add task-01/package.json task-01/package-lock.json
git commit -m "feat(task-01): add @fluentui/react and date-fns dependencies"
```

---

## Task 2: Types and Mock Data

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/activities.json`

- [ ] **Step 1: Create type definitions**

Create `src/data/types.ts`:

```ts
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
```

- [ ] **Step 2: Create mock data JSON**

Create `src/data/activities.json` — an array of ~80 `RawActivity` objects. Requirements:
- 18 fictional people with unique emails (`first.last@example.com`)
- Names: space/sci-fi themed (e.g., "Zara Voss", "Kael Orion", "Lyra Chen")
- Units: "Starship Division", "Quantum Lab", "Nebula Operations", "Stellar Academy", "Cosmic Research"
- Roles: "Warp Field Engineer", "Stellar Cartographer", "Quantum Analyst", "Nebula Architect", "Plasma Researcher", etc.
- Categories: "Training", "Contribution", "Community", "Innovation", "Documentation"
- Dates: ISO strings across 2024-01 to 2025-12, spread across all quarters
- Points: 5-50, with top 3 people having ~200-350 total, others 30-180
- Each person has 3-8 activities

Here is the complete JSON (abbreviated in plan — full data in implementation):

```json
[
  {
    "email": "zara.voss@example.com",
    "displayName": "Zara Voss",
    "role": "Warp Field Engineer",
    "unit": "Starship Division",
    "activityName": "Advanced Warp Theory Certification",
    "category": "Training",
    "date": "2025-11-15",
    "points": 45
  },
  ...
]
```

The implementor must generate the full dataset of ~80 activities for 18 people ensuring:
- Top scorer ~340 points, second ~280, third ~240
- Remaining 15 people range from 180 down to 35
- Every category has at least 10 activities total
- Every quarter of 2024 and 2025 has activities
- At least 3 people have a `unit` field, at least 2 have no `role`

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add task-01/src/data/
git commit -m "feat(task-01): add types and mock activity data"
```

---

## Task 3: Processing Utilities

**Files:**
- Create: `src/utils/processLeaderboard.ts`
- Create: `src/utils/categoryMeta.ts`

- [ ] **Step 1: Create category metadata utility**

Create `src/utils/categoryMeta.ts`:

```ts
export function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes("training") || lower.includes("education")) return "Education"
  if (lower.includes("knowledge") || lower.includes("book")) return "ReadingMode"
  if (lower.includes("mentor") || lower.includes("people")) return "People"
  if (lower.includes("project") || lower.includes("work")) return "WorkItem"
  if (lower.includes("community") || lower.includes("social")) return "Group"
  if (lower.includes("presentation") || lower.includes("speaking")) return "Presentation"
  if (lower.includes("innovation") || lower.includes("idea")) return "Lightbulb"
  if (lower.includes("contribution")) return "GitGraph"
  if (lower.includes("documentation") || lower.includes("article")) return "Article"
  return "Emoji2"
}

export function getCategoryBadgeClass(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes("training")) return "categoryTraining"
  if (lower.includes("contribution")) return "categoryContribution"
  if (lower.includes("community")) return "categoryCommunity"
  return "categoryDefault"
}
```

- [ ] **Step 2: Create leaderboard processing utility**

Create `src/utils/processLeaderboard.ts`:

```ts
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
```

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add task-01/src/utils/
git commit -m "feat(task-01): add leaderboard processing and category utilities"
```

---

## Task 4: Header Component

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Header.module.css`

- [ ] **Step 1: Create Header CSS Module**

Create `src/components/Header.module.css`:

```css
.header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin: 0 auto 32px;
  max-width: 1200px;
}

.headerContent {
  flex: 1;
}

.headerContent h2 {
  color: #0f172a;
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 8px;
}

.headerContent p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .header {
    margin-bottom: 24px;
  }
  .headerContent h2 {
    font-size: 24px;
  }
}
```

- [ ] **Step 2: Create Header component**

Create `src/components/Header.tsx`:

```tsx
import styles from "./Header.module.css"

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h2>Leaderboard</h2>
        <p>Top performers based on contributions and activity</p>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add task-01/src/components/Header.tsx task-01/src/components/Header.module.css
git commit -m "feat(task-01): add Header component"
```

---

## Task 5: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/FilterBar.module.css`

- [ ] **Step 1: Create FilterBar CSS Module**

Create `src/components/FilterBar.module.css`:

```css
.filterBar {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  margin: 0 auto 24px;
  max-width: 1200px;
  padding: 20px 24px;
  transition: all 0.2s;
}

.filterBar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.search {
  flex: 1;
  min-width: 250px;
}

@media (max-width: 768px) {
  .filterBar {
    align-items: stretch;
    flex-direction: column;
    padding: 16px;
  }
  .filters {
    flex-direction: column;
    width: 100%;
  }
  .search {
    min-width: unset;
    width: 100%;
  }
}
```

- [ ] **Step 2: Create FilterBar component**

Create `src/components/FilterBar.tsx`:

```tsx
import { Dropdown, SearchBox } from "@fluentui/react"
import type { IDropdownOption } from "@fluentui/react"
import type { FilterState } from "../data/types.ts"
import styles from "./FilterBar.module.css"

interface FilterBarProps {
  filters: FilterState
  years: number[]
  categories: string[]
  onFilterChange: (filters: FilterState) => void
}

export default function FilterBar({
  filters,
  years,
  categories,
  onFilterChange,
}: FilterBarProps) {
  const yearOptions: IDropdownOption[] = [
    { key: 0, text: "All Years" },
    ...years.map((y) => ({ key: y, text: String(y) })),
  ]

  const quarterOptions: IDropdownOption[] = [
    { key: 0, text: "All Quarters" },
    { key: 1, text: "Q1" },
    { key: 2, text: "Q2" },
    { key: 3, text: "Q3" },
    { key: 4, text: "Q4" },
  ]

  const categoryOptions: IDropdownOption[] = [
    { key: "all", text: "All Categories" },
    ...categories.map((c) => ({ key: c, text: c })),
  ]

  return (
    <div className={styles.filterBar}>
      <div className={styles.filters}>
        <Dropdown
          selectedKey={filters.year}
          options={yearOptions}
          onChange={(_e, option) =>
            option && onFilterChange({ ...filters, year: option.key as number })
          }
          styles={{ dropdown: { width: 120 } }}
        />
        <Dropdown
          selectedKey={filters.quarter}
          options={quarterOptions}
          onChange={(_e, option) =>
            option &&
            onFilterChange({ ...filters, quarter: option.key as number })
          }
          styles={{ dropdown: { width: 120 } }}
        />
        <Dropdown
          selectedKey={filters.category}
          options={categoryOptions}
          onChange={(_e, option) =>
            option &&
            onFilterChange({ ...filters, category: option.key as string })
          }
          styles={{ dropdown: { width: 150 } }}
        />
      </div>
      <div className={styles.search}>
        <SearchBox
          placeholder="Search employee..."
          value={filters.searchTerm}
          onChange={(_e, newValue) =>
            onFilterChange({ ...filters, searchTerm: newValue || "" })
          }
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add task-01/src/components/FilterBar.tsx task-01/src/components/FilterBar.module.css
git commit -m "feat(task-01): add FilterBar component with dropdowns and search"
```

---

## Task 6: Podium Component

**Files:**
- Create: `src/components/Podium.tsx`
- Create: `src/components/Podium.module.css`

- [ ] **Step 1: Create Podium CSS Module**

Create `src/components/Podium.module.css` — full CSS from the original source analysis:

```css
.podium {
  align-items: flex-end;
  display: flex;
  gap: 24px;
  justify-content: center;
  margin: 0 auto 64px;
  max-width: 900px;
  padding: 32px 8px;
}

.podiumColumn {
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 280px;
  position: relative;
  width: 100%;
}

.podiumRank1 {
  margin-top: -32px;
  order: 2;
}

.podiumRank2 {
  order: 1;
}

.podiumRank3 {
  order: 3;
}

.podiumUser {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  position: relative;
  z-index: 10;
}

.podiumAvatarContainer {
  margin-bottom: 12px;
  position: relative;
}

.podiumAvatar {
  align-items: center;
  background-position: 50%;
  background-size: cover;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #fff;
  display: flex;
  font-weight: 700;
  justify-content: center;
}

.podiumRank1 .podiumAvatar {
  background-color: #86efac;
  border: 4px solid #fbbf24;
  color: #166534;
}

.podiumRank2 .podiumAvatar {
  background-color: #cbd5e1;
  border: 4px solid #fff;
  color: #1e293b;
}

.podiumRank3 .podiumAvatar {
  background-color: #5eead4;
  border: 4px solid #fff;
  color: #134e4a;
}

.podiumAvatar span {
  font-size: 24px;
}

.podiumRank1 .podiumAvatar span {
  font-size: 32px;
}

.podiumRankBadge {
  align-items: center;
  border: 4px solid #fff;
  border-radius: 50%;
  bottom: -8px;
  color: #fff;
  display: flex;
  font-weight: 700;
  justify-content: center;
  position: absolute;
  right: -4px;
}

.podiumRank1 .podiumRankBadge {
  background: #eab308;
  font-size: 18px;
}

.podiumRank2 .podiumRankBadge {
  background: #94a3b8;
  font-size: 14px;
}

.podiumRank3 .podiumRankBadge {
  background: #92400e;
  font-size: 14px;
}

.podiumName {
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
  text-align: center;
}

.podiumRank1 .podiumName {
  font-size: 24px;
}

.podiumRole {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px;
}

.podiumScore {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  font-size: 18px;
  font-weight: 700;
  gap: 6px;
  padding: 6px 16px;
}

.podiumRank1 .podiumScore {
  background: #fef9c3;
  border-color: #fde047;
  color: #ca8a04;
  font-size: 20px;
  padding: 8px 20px;
}

.podiumRank2 .podiumScore,
.podiumRank3 .podiumScore {
  color: #0ea5e9;
}

.podiumScore i {
  font-size: 16px;
}

.podiumRank1 .podiumScore i {
  font-size: 18px;
}

.podiumBlock {
  align-items: flex-start;
  background: linear-gradient(180deg, #e2e8f0, #cbd5e1);
  border-radius: 12px 12px 0 0;
  border-top: 2px solid #cbd5e1;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding-top: 16px;
  position: relative;
  width: 100%;
}

.podiumRank1 .podiumBlock {
  background: linear-gradient(180deg, #fef3c7, #fde68a);
  border-top-color: #fde047;
  height: 160px;
}

.podiumRank2 .podiumBlock {
  height: 128px;
}

.podiumRank3 .podiumBlock {
  height: 96px;
}

.podiumBlockTop {
  height: 2px;
  inset: 0 0 auto 0;
  position: absolute;
}

.podiumRank1 .podiumBlockTop {
  background: #fde047;
}

.podiumRank2 .podiumBlockTop,
.podiumRank3 .podiumBlockTop {
  background: #cbd5e1;
}

.podiumRankNumber {
  color: rgba(148, 163, 184, 0.2);
  font-size: 96px;
  font-weight: 900;
  position: relative;
  user-select: none;
}

.podiumRank1 .podiumRankNumber {
  color: rgba(234, 179, 8, 0.2);
  font-size: 112px;
}

.podiumRank3 .podiumRankNumber {
  top: -16px;
}

@media (max-width: 768px) {
  .podium {
    align-items: center;
    flex-direction: column;
    margin-bottom: 32px;
  }
  .podiumRank1 {
    margin-top: 0;
    order: 1;
  }
  .podiumRank2 {
    order: 2;
  }
  .podiumRank1 .podiumBlock {
    height: 140px;
  }
  .podiumRank2 .podiumBlock {
    height: 96px;
  }
  .podiumRank3 .podiumBlock {
    height: 64px;
  }
}
```

- [ ] **Step 2: Create Podium component**

Create `src/components/Podium.tsx`:

```tsx
import { Icon } from "@fluentui/react"
import type { LeaderboardEntry } from "../data/types.ts"
import { getInitials, inferRole } from "../utils/processLeaderboard.ts"
import styles from "./Podium.module.css"

interface PodiumProps {
  top3: LeaderboardEntry[]
}

const RANK_CLASS = [styles.podiumRank1, styles.podiumRank2, styles.podiumRank3]
const AVATAR_SIZES = [112, 80, 80]
const BADGE_SIZES = [40, 32, 32]

export default function Podium({ top3 }: PodiumProps) {
  if (top3.length === 0) return null

  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className={styles.podium}>
      {ordered.map((entry) => {
        const idx = entry.rank - 1
        const avatarSize = AVATAR_SIZES[idx]
        const badgeSize = BADGE_SIZES[idx]
        const role =
          entry.role || inferRole(entry.categoryBreakdown)

        return (
          <div
            key={entry.email}
            className={`${styles.podiumColumn} ${RANK_CLASS[idx]}`}
          >
            <div className={styles.podiumUser}>
              <div className={styles.podiumAvatarContainer}>
                <div
                  className={styles.podiumAvatar}
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <span>{getInitials(entry.displayName)}</span>
                </div>
                <div
                  className={styles.podiumRankBadge}
                  style={{ width: badgeSize, height: badgeSize }}
                >
                  {entry.rank}
                </div>
              </div>
              <h3 className={styles.podiumName}>{entry.displayName}</h3>
              <p className={styles.podiumRole}>{role}</p>
              <div className={styles.podiumScore}>
                <Icon iconName="FavoriteStarFill" />
                <span>{entry.totalScore}</span>
              </div>
            </div>
            <div className={styles.podiumBlock}>
              <div className={styles.podiumBlockTop} />
              <span className={styles.podiumRankNumber}>{entry.rank}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add task-01/src/components/Podium.tsx task-01/src/components/Podium.module.css
git commit -m "feat(task-01): add Podium component with rank-specific styling"
```

---

## Task 7: ActivityDetails Component

**Files:**
- Create: `src/components/ActivityDetails.tsx`
- Create: `src/components/ActivityDetails.module.css`

- [ ] **Step 1: Create ActivityDetails CSS Module**

Create `src/components/ActivityDetails.module.css`:

```css
.details {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 24px;
}

.detailsTitle {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0 0 16px;
  text-transform: uppercase;
}

.tableWrapper {
  overflow-x: auto;
}

.activityTable {
  border-collapse: collapse;
  width: 100%;
}

.activityTable thead tr {
  border-bottom: 2px solid #e2e8f0;
}

.activityTable thead th {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 12px 8px;
  text-align: left;
  text-transform: uppercase;
}

.activityTable thead th:last-child {
  text-align: right;
}

.activityTable tbody tr {
  transition: background-color 0.2s;
}

.activityTable tbody tr:hover {
  background: #f1f5f9;
}

.activityTable tbody td {
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  padding: 16px 8px;
}

.activityTable tbody tr:last-child td {
  border-bottom: none;
}

.activityName {
  color: #1e293b;
  font-weight: 600;
}

.categoryBadge {
  align-items: center;
  border-radius: 12px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
}

.categoryTraining {
  background: #dbeafe;
  color: #1e40af;
}

.categoryContribution {
  background: #f3e8ff;
  color: #6b21a8;
}

.categoryCommunity {
  background: #dcfce7;
  color: #166534;
}

.categoryDefault {
  background: #e2e8f0;
  color: #475569;
}

.activityDate {
  color: #64748b;
}

.activityPoints {
  color: #0ea5e9;
  font-weight: 700;
  text-align: right;
}

@media (max-width: 768px) {
  .details {
    padding: 16px;
  }
}
```

- [ ] **Step 2: Create ActivityDetails component**

Create `src/components/ActivityDetails.tsx`:

```tsx
import { format } from "date-fns"
import type { RawActivity } from "../data/types.ts"
import { getCategoryBadgeClass } from "../utils/categoryMeta.ts"
import styles from "./ActivityDetails.module.css"

interface ActivityDetailsProps {
  activities: RawActivity[]
}

export default function ActivityDetails({
  activities,
}: ActivityDetailsProps) {
  return (
    <div className={styles.details}>
      <h4 className={styles.detailsTitle}>Recent Activity</h4>
      <div className={styles.tableWrapper}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Category</th>
              <th>Date</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, i) => (
              <tr key={i}>
                <td className={styles.activityName}>
                  {activity.activityName}
                </td>
                <td>
                  <span
                    className={`${styles.categoryBadge} ${
                      styles[getCategoryBadgeClass(activity.category)]
                    }`}
                  >
                    {activity.category}
                  </span>
                </td>
                <td className={styles.activityDate}>
                  {format(new Date(activity.date), "dd-MMM-yyyy")}
                </td>
                <td className={styles.activityPoints}>
                  +{activity.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

Note: The `styles[getCategoryBadgeClass(...)]` dynamic lookup works because CSS Modules exports an object where keys are class names. The `getCategoryBadgeClass` function returns strings like `"categoryTraining"` that match the CSS class names.

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add task-01/src/components/ActivityDetails.tsx task-01/src/components/ActivityDetails.module.css
git commit -m "feat(task-01): add ActivityDetails component with category badges"
```

---

## Task 8: UserRow Component

**Files:**
- Create: `src/components/UserRow.tsx`
- Create: `src/components/UserRow.module.css`

- [ ] **Step 1: Create UserRow CSS Module**

Create `src/components/UserRow.module.css`:

```css
.userRowContainer {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.userRowContainer:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.expanded {
  border-color: #0ea5e9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.row {
  padding: 20px 24px;
}

.rowMain {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.rowLeft {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 24px;
}

.rank {
  color: #94a3b8;
  font-size: 24px;
  font-weight: 700;
  min-width: 32px;
  text-align: center;
}

.avatar {
  align-items: center;
  background-color: #fbbf24;
  background-position: 50%;
  background-size: cover;
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 700;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.name {
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.role {
  color: #64748b;
  font-size: 14px;
}

.rowRight {
  align-items: center;
  display: flex;
  gap: 24px;
}

.categoryStats {
  align-items: center;
  display: flex;
  gap: 24px;
}

.categoryStat {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.categoryStatIcon {
  color: #0ea5e9;
  font-size: 20px;
}

.categoryStatCount {
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.totalSection {
  align-items: flex-end;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 24px;
}

.totalLabel {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.score {
  align-items: center;
  color: #0ea5e9;
  display: flex;
  font-size: 24px;
  font-weight: 700;
  gap: 6px;
}

.score i {
  font-size: 28px;
}

.expandButton {
  align-items: center;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  color: #0ea5e9;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 8px;
  transition: background 0.2s;
}

.expandButton:hover {
  background: #e2e8f0;
}

.expandButton i {
  font-size: 20px;
}

.expanded .expandButton {
  background: #e0f2fe;
}

@media (max-width: 768px) {
  .row {
    padding: 16px;
  }
  .rowMain {
    flex-direction: column;
    gap: 12px;
  }
  .rowLeft {
    gap: 16px;
    width: 100%;
  }
  .rowRight {
    border-top: 1px solid #e2e8f0;
    justify-content: space-between;
    padding-top: 12px;
    width: 100%;
  }
  .categoryStats {
    gap: 16px;
  }
  .totalSection {
    display: none;
  }
}
```

- [ ] **Step 2: Create UserRow component**

Create `src/components/UserRow.tsx`:

```tsx
import { Icon, TooltipHost } from "@fluentui/react"
import type { LeaderboardEntry } from "../data/types.ts"
import { getInitials } from "../utils/processLeaderboard.ts"
import { getCategoryIcon } from "../utils/categoryMeta.ts"
import ActivityDetails from "./ActivityDetails.tsx"
import styles from "./UserRow.module.css"

interface UserRowProps {
  entry: LeaderboardEntry
  isExpanded: boolean
  onToggleExpand: (email: string) => void
}

export default function UserRow({
  entry,
  isExpanded,
  onToggleExpand,
}: UserRowProps) {
  const containerClass = `${styles.userRowContainer} ${
    isExpanded ? styles.expanded : ""
  }`

  return (
    <div className={containerClass}>
      <div className={styles.row}>
        <div className={styles.rowMain}>
          <div className={styles.rowLeft}>
            <span className={styles.rank}>{entry.rank}</span>
            <div className={styles.avatar}>
              <span>{getInitials(entry.displayName)}</span>
            </div>
            <div className={styles.info}>
              <h3 className={styles.name}>{entry.displayName}</h3>
              <span className={styles.role}>
                {entry.role || "Team Member"}
              </span>
            </div>
          </div>
          <div className={styles.rowRight}>
            <div className={styles.categoryStats}>
              {Object.entries(entry.categoryBreakdown).map(
                ([category, count]) => (
                  <TooltipHost content={category} key={category}>
                    <div className={styles.categoryStat}>
                      <Icon
                        iconName={getCategoryIcon(category)}
                        className={styles.categoryStatIcon}
                      />
                      <span className={styles.categoryStatCount}>
                        {count}
                      </span>
                    </div>
                  </TooltipHost>
                )
              )}
            </div>
            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>TOTAL</span>
              <div className={styles.score}>
                <Icon iconName="FavoriteStarFill" />
                <span>{entry.totalScore}</span>
              </div>
            </div>
            <button
              className={styles.expandButton}
              aria-label={isExpanded ? "Collapse" : "Expand"}
              onClick={() => onToggleExpand(entry.email)}
            >
              <Icon
                iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
              />
            </button>
          </div>
        </div>
      </div>
      {isExpanded && <ActivityDetails activities={entry.activities} />}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add task-01/src/components/UserRow.tsx task-01/src/components/UserRow.module.css
git commit -m "feat(task-01): add UserRow component with expand/collapse and category stats"
```

---

## Task 9: Leaderboard Root Component

**Files:**
- Create: `src/components/Leaderboard.tsx`
- Create: `src/components/Leaderboard.module.css`

- [ ] **Step 1: Create Leaderboard CSS Module**

Create `src/components/Leaderboard.module.css`:

```css
.leaderboard {
  background: #f8fafc;
  color: #0f172a;
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Oxygen,
    Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  min-height: 100vh;
  padding: 24px;
  transition: background-color 0.3s, color 0.3s;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
  max-width: 1200px;
}

@media (max-width: 768px) {
  .leaderboard {
    padding: 16px;
  }
}
```

- [ ] **Step 2: Create Leaderboard component**

Create `src/components/Leaderboard.tsx`:

```tsx
import { useState, useMemo } from "react"
import { MessageBar } from "@fluentui/react"
import type { FilterState } from "../data/types.ts"
import type { RawActivity } from "../data/types.ts"
import rawActivities from "../data/activities.json"
import {
  processLeaderboard,
  extractYears,
  extractCategories,
} from "../utils/processLeaderboard.ts"
import Header from "./Header.tsx"
import FilterBar from "./FilterBar.tsx"
import Podium from "./Podium.tsx"
import UserRow from "./UserRow.tsx"
import styles from "./Leaderboard.module.css"

const DEFAULT_FILTERS: FilterState = {
  year: 0,
  quarter: 0,
  category: "all",
  searchTerm: "",
}

export default function Leaderboard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)

  const activities = rawActivities as RawActivity[]
  const years = useMemo(() => extractYears(activities), [activities])
  const categories = useMemo(() => extractCategories(activities), [activities])
  const items = useMemo(
    () => processLeaderboard(activities, filters),
    [activities, filters]
  )

  const top3 = items.slice(0, 3)

  function handleToggleExpand(email: string) {
    setExpandedEmail((prev) => (prev === email ? null : email))
  }

  return (
    <section className={styles.leaderboard}>
      <Header />
      <FilterBar
        filters={filters}
        years={years}
        categories={categories}
        onFilterChange={setFilters}
      />
      {items.length > 0 && <Podium top3={top3} />}
      {items.length === 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <MessageBar>
            No activities found matching the current filters.
          </MessageBar>
        </div>
      )}
      <div className={styles.list}>
        {items.map((entry) => (
          <UserRow
            key={entry.email}
            entry={entry}
            isExpanded={expandedEmail === entry.email}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd task-01 && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add task-01/src/components/Leaderboard.tsx task-01/src/components/Leaderboard.module.css
git commit -m "feat(task-01): add Leaderboard root component wiring all children"
```

---

## Task 10: Wire Up App Entry Point

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/index.css`

- [ ] **Step 1: Update main.tsx to initialize Fluent UI icons**

Replace contents of `src/main.tsx`:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { initializeIcons } from "@fluentui/react"
import "./index.css"
import App from "./App.tsx"

initializeIcons()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 2: Update App.tsx**

Replace contents of `src/App.tsx`:

```tsx
import Leaderboard from "./components/Leaderboard.tsx"

function App() {
  return <Leaderboard />
}

export default App
```

- [ ] **Step 3: Update index.css with minimal reset**

Replace contents of `src/index.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 4: Clear App.css**

Empty the file `src/App.css` (remove all contents).

- [ ] **Step 5: Verify build**

```bash
cd task-01 && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Verify dev server**

```bash
cd task-01 && npm run dev
```

Open `http://localhost:5173` in browser. Verify:
- Header shows "Leaderboard" title and subtitle
- Filter bar has 3 dropdowns (Year, Quarter, Category) and a search box
- Podium shows top 3 with rank 2 left, rank 1 center (elevated), rank 3 right
- Below podium, all users listed in cards with rank, avatar, name, role, category icons, total score
- Clicking expand chevron opens activity detail table
- Filters work: changing year/quarter/category re-sorts; search filters by name/role
- Responsive: at ≤768px, layout stacks vertically

- [ ] **Step 7: Commit**

```bash
git add task-01/src/main.tsx task-01/src/App.tsx task-01/src/App.css task-01/src/index.css
git commit -m "feat(task-01): wire up app entry point with Fluent UI icon initialization"
```
