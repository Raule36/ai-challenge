# Leaderboard Page — Design Spec

## Overview

Replicate Leaderboard web part as a standalone React + Vite + TypeScript app in `task-01/`. The replica must match all UI elements, filters, sorting, and interactive behavior of the original. All data (names, titles, departments, activities) must be fictional.

## Stack

- React 19 + TypeScript + Vite (existing boilerplate in `task-01/`)
- `@fluentui/react` — Dropdown, SearchBox, Spinner, MessageBar, Icon, TooltipHost
- `date-fns` — date formatting (`dd-MMM-yyyy`)
- CSS Modules (`.module.css`) — scoped styles replicating original exactly

## Data

### Source

Static JSON file at `src/data/leaderboard.json`. Imported directly, no async loading.

### Raw Activity Record Schema

```ts
interface RawActivity {
  email: string
  displayName: string
  role?: string
  unit?: string
  activityName: string
  category: string
  date: string          // ISO date string
  points: number
}
```

### Processed Leaderboard Entry

```ts
interface LeaderboardEntry {
  rank: number
  email: string
  displayName: string
  role?: string
  totalScore: number
  categoryBreakdown: Record<string, number>
  activities: RawActivity[]   // sorted by date descending
}
```

### Mock Data Requirements

- 15-20 fictional people with invented names
- Fictional departments/units (e.g., "Starship Division", "Quantum Lab", "Nebula Operations")
- Fictional roles (e.g., "Warp Field Engineer", "Stellar Cartographer")
- Activities spanning 2024-2025 across categories: Training, Contribution, Community, and one or two more
- Point values ranging from 5 to 50 per activity, creating meaningful score differentiation

## Component Hierarchy

```
App
  └── Leaderboard
        ├── Header
        ├── FilterBar
        ├── Podium
        └── UserList
              └── UserRow[]
                    └── ActivityDetails
```

## Components

### Leaderboard (root state owner)

State:
```ts
{
  items: LeaderboardEntry[]
  filters: {
    year: number           // 0 = all years
    quarter: number        // 0 = all quarters, 1-4
    category: string       // "all" = all categories
    searchTerm: string
  }
  expandedEmail: string | null
}
```

On mount: load JSON, extract unique years/categories, process into leaderboard entries.

On filter change: re-process from raw activities (no re-import).

### Header

- `<header>` with `<h2>` title ("Leaderboard") and `<p>` subtitle ("Top performers based on contributions and activity")
- Max-width 1200px, centered

### FilterBar

- Container: white card with border, rounded corners, shadow, max-width 1200px
- Left side (`.filters`): 3 Fluent UI Dropdowns
  - Year (width 120px): "All Years" + unique years from data, sorted descending
  - Quarter (width 120px): "All Quarters", "Q1", "Q2", "Q3", "Q4"
  - Category (width 150px): "All Categories" + unique categories, sorted ascending
- Right side (`.search`): Fluent UI SearchBox, placeholder "Search employee...", min-width 250px
- Responsive: stacks vertically at ≤768px

### Podium

- Shows top 3 entries (or fewer if less data)
- DOM order: rank 2, rank 1, rank 3
- CSS `order` property: rank 2=1, rank 1=2, rank 3=3
- Rank 1 is elevated (margin-top: -32px) with larger avatar (112px vs 80px)

Each podium column:
- Avatar circle with initials (no photos), rank-specific colors:
  - Rank 1: bg #86efac, border 4px #fbbf24, text #166534
  - Rank 2: bg #cbd5e1, border 4px #fff, text #1e293b
  - Rank 3: bg #5eead4, border 4px #fff, text #134e4a
- Rank badge (positioned bottom-right of avatar):
  - Rank 1: bg #eab308, 40px, font 18px
  - Rank 2: bg #94a3b8, 32px, font 14px
  - Rank 3: bg #92400e, 32px, font 14px
- Display name, role, score pill (with star icon)
- Podium block (gradient background, rank-specific heights: 160/128/96px)
- Large faded rank number inside block

Role inference on podium (original behavior): if no role, infer from category breakdown keywords (training→"Senior Developer", mentor→"DevOps Engineer", community→"Product Designer", else→"Team Member"). Since all mock data includes roles, this rarely triggers but must be implemented for completeness.

Responsive (≤768px): stacks vertically, rank 1 first, reduced block heights.

### UserRow

Shows ALL items including top 3. Each row is a white card.

Left side:
- Rank number (gray, 24px font)
- Avatar circle (56px, amber #fbbf24 bg, white initials)
- Name (18px bold) and role (14px gray, defaults to "Team Member")

Right side:
- Category stats: icon + count for each category in breakdown, with TooltipHost showing category name
- Total section: "TOTAL" label + score with star icon (hidden on mobile)
- Expand/collapse button (chevron icon, circular bg)

Expanded state:
- Border color changes to #0ea5e9
- Shows ActivityDetails below
- Only one row expanded at a time

### ActivityDetails

- Background #f8fafc, top border
- Title "RECENT ACTIVITY" (uppercase, small, gray)
- Table with columns: Activity, Category, Date, Points
- Category badges with color coding:
  - Training → blue (#dbeafe / #1e40af)
  - Contribution → purple (#f3e8ff / #6b21a8)
  - Community → green (#dcfce7 / #166534)
  - Default → gray (#e2e8f0 / #475569)
- Date formatted as "dd-MMM-yyyy"
- Points prefixed with "+"
- Row hover highlight

## Processing Logic

1. Filter raw activities by year (if set), quarter (if set), category (if set)
2. Group by email (lowercase)
3. For each person: sum points, build category breakdown, collect activities
4. If person has unit, role becomes "Role (Unit)"
5. Sort by totalScore descending
6. Assign 1-based rank
7. If searchTerm set, filter by displayName or role (case-insensitive includes)

## Category Icon Mapping

| Category keyword | Fluent UI Icon |
|---|---|
| training, education | Education |
| knowledge, book | ReadingMode |
| mentor, people | People |
| project, work | WorkItem |
| community, social | Group |
| presentation, speaking | Presentation |
| innovation, idea | Lightbulb |
| contribution | GitGraph |
| documentation, article | Article |
| default | Emoji2 |

## Styling

All CSS replicates the original exactly:
- Font: Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif
- Page bg: #f8fafc
- Primary text: #0f172a
- Secondary text: #64748b
- Accent: #0ea5e9
- Borders: #e2e8f0
- Cards: white, 12px border-radius, subtle shadow
- Single responsive breakpoint at max-width 768px
- Transitions: all .2s on interactive elements

Full CSS rules are documented in the source analysis and must be replicated exactly per class.

## What Is NOT Included

- Theme toggle (CSS exists in original but button is not rendered)
- CSV/Excel data fetching
- Auto-refresh timer
- Any features not present in the original
