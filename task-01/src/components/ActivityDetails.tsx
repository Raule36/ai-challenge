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
