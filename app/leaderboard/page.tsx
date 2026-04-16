'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

// --- Types --------------------------------------------------------------------

interface LeaderEntry {
  rank: number;
  username: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  totalXP: number;
  weeklyXP: number;
  streak: number;
  challengesDone: number;
  warRoomsDone: number;
  perfectRuns: number;
  rank_title: string;
  rank_color: string;
  badge?: string;         // optional flair emoji
  isYou?: boolean;
  isPro: boolean;
}

type SortKey = 'totalXP' | 'weeklyXP' | 'streak' | 'challengesDone' | 'warRoomsDone';
type TimeFilter = 'allTime' | 'weekly' | 'monthly';

// --- Mock leaderboard data ----------------------------------------------------

const LEADERBOARD: LeaderEntry[] = [
  { rank: 1,  username: 'siddharth_g',   displayName: 'Siddharth G.',     initials: 'SG', avatarColor: '#8b5cf6', totalXP: 48200, weeklyXP: 2800, streak: 89,  challengesDone: 167, warRoomsDone: 34, perfectRuns: 12, rank_title: 'Senior Engineer',    rank_color: '#f59e0b', badge: '👑', isPro: true },
  { rank: 2,  username: 'priya_r',        displayName: 'Priya Raghavan',   initials: 'PR', avatarColor: '#ef4444', totalXP: 41750, weeklyXP: 3100, streak: 61,  challengesDone: 141, warRoomsDone: 28, perfectRuns: 9,  rank_title: 'Senior Engineer',    rank_color: '#f59e0b', badge: '🔥', isPro: true },
  { rank: 3,  username: 'alex_k',         displayName: 'Alex Kim',         initials: 'AK', avatarColor: '#3b82f6', totalXP: 38900, weeklyXP: 1950, streak: 44,  challengesDone: 133, warRoomsDone: 22, perfectRuns: 7,  rank_title: 'Senior Engineer',    rank_color: '#f59e0b', isPro: true },
  { rank: 4,  username: 'marina_n',       displayName: 'Marina N.',        initials: 'MN', avatarColor: '#10b981', totalXP: 33400, weeklyXP: 2200, streak: 52,  challengesDone: 120, warRoomsDone: 19, perfectRuns: 5,  rank_title: 'Mid Engineer',       rank_color: '#10b981', isPro: true },
  { rank: 5,  username: 'venkat_builds',  displayName: 'Venkateshwaran P.',initials: 'VP', avatarColor: '#62de61', totalXP: 12450, weeklyXP: 840,  streak: 23,  challengesDone: 42,  warRoomsDone: 3,  perfectRuns: 2,  rank_title: 'Mid Engineer',       rank_color: '#10b981', isYou: true, isPro: true },
  { rank: 6,  username: 'omar_s',         displayName: 'Omar Salah',       initials: 'OS', avatarColor: '#f97316', totalXP: 11800, weeklyXP: 620,  streak: 18,  challengesDone: 40,  warRoomsDone: 2,  perfectRuns: 1,  rank_title: 'Junior Engineer',    rank_color: '#3b82f6', isPro: true },
  { rank: 7,  username: 'chen_l',         displayName: 'Chen Liu',         initials: 'CL', avatarColor: '#06b6d4', totalXP: 10200, weeklyXP: 580,  streak: 14,  challengesDone: 38,  warRoomsDone: 1,  perfectRuns: 0,  rank_title: 'Junior Engineer',    rank_color: '#3b82f6', isPro: false },
  { rank: 8,  username: 'fatima_a',       displayName: 'Fatima Al-Hassan', initials: 'FA', avatarColor: '#ec4899', totalXP: 9800,  weeklyXP: 490,  streak: 11,  challengesDone: 35,  warRoomsDone: 2,  perfectRuns: 1,  rank_title: 'Junior Engineer',    rank_color: '#3b82f6', isPro: true },
  { rank: 9,  username: 'max_b',          displayName: 'Maximilian Braun', initials: 'MB', avatarColor: '#a78bfa', totalXP: 8700,  weeklyXP: 310,  streak: 9,   challengesDone: 29,  warRoomsDone: 0,  perfectRuns: 0,  rank_title: 'Junior Engineer',    rank_color: '#3b82f6', isPro: false },
  { rank: 10, username: 'ananya_p',       displayName: 'Ananya Patel',     initials: 'AP', avatarColor: '#fbbf24', totalXP: 7900,  weeklyXP: 270,  streak: 7,   challengesDone: 26,  warRoomsDone: 1,  perfectRuns: 0,  rank_title: 'Junior Engineer',    rank_color: '#3b82f6', isPro: false },
  { rank: 11, username: 'taiki_m',        displayName: 'Taiki Mori',       initials: 'TM', avatarColor: '#64748b', totalXP: 6500,  weeklyXP: 180,  streak: 5,   challengesDone: 22,  warRoomsDone: 0,  perfectRuns: 0,  rank_title: 'Junior Engineer',    rank_color: '#3b82f6', isPro: false },
  { rank: 12, username: 'daria_v',        displayName: 'Daria Volkov',     initials: 'DV', avatarColor: '#f43f5e', totalXP: 5800,  weeklyXP: 150,  streak: 3,   challengesDone: 19,  warRoomsDone: 0,  perfectRuns: 0,  rank_title: 'Intern',             rank_color: '#8a8a8a', isPro: false },
  { rank: 13, username: 'james_oc',       displayName: 'James O\'Connor',  initials: 'JO', avatarColor: '#0891b2', totalXP: 4200,  weeklyXP: 120,  streak: 2,   challengesDone: 14,  warRoomsDone: 0,  perfectRuns: 0,  rank_title: 'Intern',             rank_color: '#8a8a8a', isPro: false },
  { rank: 14, username: 'sara_ly',        displayName: 'Sara Ly',          initials: 'SL', avatarColor: '#7c3aed', totalXP: 3100,  weeklyXP: 90,   streak: 1,   challengesDone: 10,  warRoomsDone: 0,  perfectRuns: 0,  rank_title: 'Intern',             rank_color: '#8a8a8a', isPro: false },
  { rank: 15, username: 'dev_nk',         displayName: 'Dev Nkosi',        initials: 'DN', avatarColor: '#059669', totalXP: 2400,  weeklyXP: 60,   streak: 0,   challengesDone: 8,   warRoomsDone: 0,  perfectRuns: 0,  rank_title: 'Intern',             rank_color: '#8a8a8a', isPro: false },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'totalXP',       label: 'Total XP' },
  { key: 'weeklyXP',      label: 'Weekly XP' },
  { key: 'streak',        label: 'Streak' },
  { key: 'challengesDone',label: 'Challenges' },
  { key: 'warRoomsDone',  label: 'War Rooms' },
];

// --- Sub-components -----------------------------------------------------------

function PodiumCard({ entry, pos }: { entry: LeaderEntry; pos: 1 | 2 | 3 }) {
  const heights = { 1: styles.podiumFirst, 2: styles.podiumSecond, 3: styles.podiumThird };
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <div className={`${styles.podiumCard} ${heights[pos]} ${entry.isYou ? styles.podiumYou : ''}`}
      style={{ '--entry-color': entry.avatarColor } as React.CSSProperties}
    >
      <div className={styles.podiumMedal}>{medals[pos]}</div>
      <div className={styles.podiumAvatarWrap}>
        <div className={styles.podiumAvatarGlow} />
        <div className={styles.podiumAvatar} style={{ background: entry.avatarColor }}>
          {entry.initials}
        </div>
        {entry.badge && <div className={styles.podiumBadge}>{entry.badge}</div>}
      </div>
      <div className={styles.podiumName}>{entry.displayName.split(' ')[0]}</div>
      <div className={styles.podiumXP}>{entry.totalXP.toLocaleString()} XP</div>
      <div className={styles.podiumRank} style={{ color: entry.rank_color }}>
        {entry.rank_title}
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------

export default function LeaderboardPage() {
  const [sortKey, setSortKey] = useState<SortKey>('totalXP');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('allTime');
  const [search, setSearch] = useState('');

  const youEntry = LEADERBOARD.find(e => e.isYou)!;

  const sorted = useMemo(() => {
    let data = [...LEADERBOARD];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(e =>
        e.displayName.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.rank_title.toLowerCase().includes(q)
      );
    }

    if (timeFilter === 'weekly') {
      data = [...data].sort((a, b) => b.weeklyXP - a.weeklyXP);
    } else {
      data = [...data].sort((a, b) => b[sortKey] - a[sortKey]);
    }

    return data;
  }, [sortKey, timeFilter, search]);

  // Podium: always top 3 by total XP, unfiltered
  const top3 = LEADERBOARD.slice(0, 3);

  return (
    <div className={styles.layout}>
      {/* -- Nav ----------------------------------------------------------- */}
      <AppNav />

      <main className={styles.main}>

        {/* -- Page title ------------------------------------------------- */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Leaderboard</h1>
            <p className={styles.pageSubtitle}>
              1,243 engineers competing globally. Updated every hour.
            </p>
          </div>
          <div className={styles.yourRankChip}>
            <span className={styles.yourRankLabel}>Your rank</span>
            <span className={styles.yourRankNum}>#{youEntry.rank}</span>
            <span className={styles.yourRankXP}>{youEntry.totalXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* -- Podium ----------------------------------------------------- */}
        <div className={styles.podiumSection}>
          <div className={styles.podiumRow}>
            <PodiumCard entry={top3[1]} pos={2} />
            <PodiumCard entry={top3[0]} pos={1} />
            <PodiumCard entry={top3[2]} pos={3} />
          </div>
          <div className={styles.podiumBase} />
        </div>

        {/* -- Controls --------------------------------------------------- */}
        <div className={styles.controls}>
          {/* Time filter */}
          <div className={styles.timeFilter}>
            {(['allTime', 'weekly', 'monthly'] as TimeFilter[]).map(t => (
              <button
                key={t}
                className={`${styles.timeBtn} ${timeFilter === t ? styles.timeBtnActive : ''}`}
                onClick={() => setTimeFilter(t)}
              >
                {t === 'allTime' ? 'All Time' : t === 'weekly' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Sort chips */}
          <div className={styles.sortChips}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`${styles.sortChip} ${sortKey === opt.key && timeFilter !== 'weekly' ? styles.sortChipActive : ''}`}
                onClick={() => { setSortKey(opt.key); setTimeFilter('allTime'); }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            className={styles.searchInput}
            placeholder="Search engineer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* -- Table ------------------------------------------------------ */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.thead}>
                <th className={styles.thRank}>#</th>
                <th className={styles.thName}>Engineer</th>
                <th className={`${styles.thStat} ${sortKey === 'totalXP' || timeFilter === 'weekly' ? styles.thActive : ''}`}>
                  {timeFilter === 'weekly' ? 'Weekly XP' : 'Total XP'}
                </th>
                <th className={`${styles.thStat} ${sortKey === 'streak' ? styles.thActive : ''}`}>Streak</th>
                <th className={`${styles.thStat} ${sortKey === 'challengesDone' ? styles.thActive : ''}`}>Challenges</th>
                <th className={`${styles.thStat} ${sortKey === 'warRoomsDone' ? styles.thActive : ''}`}>War Rooms</th>
                <th className={styles.thStat}>Perfect</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry, idx) => {
                const displayRank = idx + 1;
                const isTop3 = entry.rank <= 3;
                return (
                  <tr
                    key={entry.username}
                    className={`${styles.row} ${entry.isYou ? styles.rowYou : ''} ${isTop3 ? styles.rowTop3 : ''}`}
                  >
                    {/* Rank */}
                    <td className={styles.tdRank}>
                      <div className={`${styles.rankNum} ${isTop3 ? styles.rankTop : ''}`}
                        style={isTop3 ? { color: entry.avatarColor } : undefined}
                      >
                        {isTop3
                          ? (['🥇','🥈','🥉'])[entry.rank - 1]
                          : displayRank
                        }
                      </div>
                    </td>

                    {/* Engineer */}
                    <td className={styles.tdName}>
                      <Link href={`/profile`} className={styles.engineerRow}>
                        <div
                          className={`${styles.avatar} ${entry.isYou ? styles.avatarYou : ''}`}
                          style={{ background: entry.avatarColor }}
                        >
                          {entry.initials}
                        </div>
                        <div className={styles.engineerInfo}>
                          <div className={styles.engineerName}>
                            {entry.displayName}
                            {entry.isYou && <span className={styles.youTag}>you</span>}
                            {entry.badge && <span className={styles.badgeEmoji}>{entry.badge}</span>}
                            {!entry.isPro && <span className={styles.freeTag}>Free</span>}
                          </div>
                          <div className={styles.engineerMeta}>
                            <span style={{ color: entry.rank_color }}>
                              {entry.rank_title}
                            </span>
                            <span className={styles.metaDot}>·</span>
                            <span className={styles.engineerHandle}>@{entry.username}</span>
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* XP */}
                    <td className={`${styles.tdStat} ${styles.tdXP}`}>
                      <span className={styles.xpVal}>
                        {(timeFilter === 'weekly' ? entry.weeklyXP : entry.totalXP).toLocaleString()}
                      </span>
                      {timeFilter === 'weekly' && entry.weeklyXP > 1000 && (
                        <span className={styles.xpHot}>🔥hot</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className={styles.tdStat}>
                      <span className={entry.streak >= 30 ? styles.streakHigh : entry.streak >= 7 ? styles.streakMed : styles.streakLow}>
                        {entry.streak > 0 ? `🔥 ${entry.streak}` : '—'}
                      </span>
                    </td>

                    {/* Challenges */}
                    <td className={styles.tdStat}>
                      <div className={styles.barCell}>
                        <span className={styles.barNum}>{entry.challengesDone}</span>
                        <div className={styles.miniBar}>
                          <div
                            className={styles.miniBarFill}
                            style={{ width: `${Math.min((entry.challengesDone / 167) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* War Rooms */}
                    <td className={styles.tdStat}>
                      {entry.warRoomsDone > 0
                        ? <span className={styles.warVal}>⚔ {entry.warRoomsDone}</span>
                        : <span className={styles.tdNone}>—</span>
                      }
                    </td>

                    {/* Perfect runs */}
                    <td className={styles.tdStat}>
                      {entry.perfectRuns > 0
                        ? <span className={styles.perfectVal}>✦ {entry.perfectRuns}</span>
                        : <span className={styles.tdNone}>—</span>
                      }
                    </td>
                  </tr>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    No engineers match &quot;{search}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* -- "Your position" sticky banner when you scroll off ---------- */}
        <div className={styles.yourPositionBar}>
          <div className={styles.yourPositionInner}>
            <div className={styles.yourPositionRank}>#{youEntry.rank}</div>
            <div className={styles.yourPositionName}>
              {youEntry.displayName}
              <span className={styles.youTag}>you</span>
            </div>
            <div className={styles.yourPositionXP}>{youEntry.totalXP.toLocaleString()} XP</div>
            <div className={styles.yourPositionStreak}>🔥 {youEntry.streak} day streak</div>
            <div className={styles.yourPositionGap}>
              Gap to #{youEntry.rank - 1}:{' '}
              <strong>{(LEADERBOARD[youEntry.rank - 2].totalXP - youEntry.totalXP).toLocaleString()} XP</strong>
            </div>
            <Link href="/challenges" className={styles.yourPositionCta}>
              Close the gap →
            </Link>
          </div>
        </div>

        {/* -- Stats section ----------------------------------------------- */}
        <div className={styles.statsSection}>
          <div className={styles.statsSectionTitle}>Platform Stats</div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚡</div>
              <div className={styles.statNum}>1,243</div>
              <div className={styles.statLabel}>Engineers competing</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏆</div>
              <div className={styles.statNum}>47,891</div>
              <div className={styles.statLabel}>Challenges solved</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚔</div>
              <div className={styles.statNum}>3,204</div>
              <div className={styles.statLabel}>War Rooms survived</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statNum}>89 days</div>
              <div className={styles.statLabel}>Longest active streak</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
