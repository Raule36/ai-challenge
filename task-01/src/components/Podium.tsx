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

  const positionMap = new Map<string, number>()
  top3.forEach((e, i) => positionMap.set(e.email, i))

  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className={styles.podium}>
      {ordered.map((entry) => {
        const pos = positionMap.get(entry.email)!
        const avatarSize = AVATAR_SIZES[pos]
        const badgeSize = BADGE_SIZES[pos]
        const role =
          entry.role || inferRole(entry.categoryBreakdown)

        return (
          <div
            key={entry.email}
            className={`${styles.podiumColumn} ${RANK_CLASS[pos]}`}
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
