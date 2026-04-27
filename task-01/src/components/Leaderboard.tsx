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
