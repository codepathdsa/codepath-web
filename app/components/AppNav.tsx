'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AppNav.module.css';

export default function AppNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        engprep<span className={styles.cursor} />
      </Link>

      <div className={styles.links}>
        <Link href="/dashboard"   className={`${styles.link} ${active('/dashboard')   ? styles.active : ''}`}>Dashboard</Link>
        <Link href="/challenges"  className={`${styles.link} ${active('/challenges')  ? styles.active : ''}`}>Challenges</Link>
        <Link href="/raid"        className={`${styles.link} ${active('/raid')        ? styles.active : ''}`}>
          <span className={styles.raidDot} />Raid
        </Link>
        <Link href="/leaderboard" className={`${styles.link} ${active('/leaderboard') ? styles.active : ''}`}>Leaderboard</Link>
        <Link href="/codex"       className={`${styles.link} ${active('/codex')       ? styles.active : ''}`}>Codex</Link>
        <Link href="/tracks"      className={`${styles.link} ${active('/tracks')      ? styles.active : ''}`}>Tracks</Link>
        <Link href="/roadmap"     className={`${styles.link} ${active('/roadmap')     ? styles.active : ''}`}>Roadmap</Link>
        <Link href="/pricing"     className={`${styles.link} ${active('/pricing')     ? styles.active : ''}`}>Pricing</Link>
      </div>

      <div className={styles.right}>
        <div className={styles.xpPill}>
          <span>&#9889;</span>
          <span>2,480 XP</span>
        </div>
        <div className={styles.streakPill}>
          <span>&#128293;</span>
          <span>12d</span>
        </div>

        {/* Notification bell */}
        <Link
          href="/notifications"
          className={`${styles.bellBtn} ${active('/notifications') ? styles.bellActive : ''}`}
          title="Notifications"
          aria-label="Notifications (3 unread)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.bellBadge}>3</span>
        </Link>

        <div className={styles.avatarMenu}>
          <Link href="/profile" className={styles.avatar}>VP</Link>
          <div className={styles.avatarDropdown}>
            <Link href="/profile"  className={styles.dropItem}>Profile</Link>
            <Link href="/settings" className={styles.dropItem}>Settings</Link>
            <div className={styles.dropDivider} />
            <Link href="/u/venkat_builds" className={styles.dropItem}>Public profile ↗</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
