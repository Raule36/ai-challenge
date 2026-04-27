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
