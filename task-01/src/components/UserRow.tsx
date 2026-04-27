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
