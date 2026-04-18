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

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'totalXP',       label: 'Total XP' },
  { key: 'weeklyXP',      label: 'Weekly XP' },
  { key: 'streak',        label: 'Streak' },
  { key: 'challengesDone',label: 'Challenges' },
  { key: 'warRoomsDone',  label: 'War Rooms' },
];

// --- Props -------------------------------------------------------------------

interface LeaderboardClientProps {
  initialData: LeaderEntry[];
  myId: string | null;
}

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

export default function LeaderboardClient({ initialData, myId }: LeaderboardClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalXP');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('allTime');
  const [search, setSearch] = useState('');

  const LEADERBOARD = initialData;
  const youEntry = LEADERBOARD.find(e => e.isYou) ?? LEADERBOARD[0];

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
          {youEntry && (
            <div className={styles.yourRankChip}>
              <span className={styles.yourRankLabel}>Your rank</span>
              <span className={styles.yourRankNum}>#{youEntry.rank}</span>
              <span className={styles.yourRankXP}>{youEntry.totalXP.toLocaleString()} XP</span>
            </div>
          )}
        </div>

        {top3.length >= 3 && (
          <div className={styles.podiumSection}>
            <div className={styles.podiumRow}>
              <PodiumCard entry={top3[1]} pos={2} />
              <PodiumCard entry={top3[0]} pos={1} />
              <PodiumCard entry={top3[2]} pos={3} />
            </div>
            <div className={styles.podiumBase} />
          </div>
        )}

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
        {youEntry && (
          <div className={styles.yourPositionBar}>
            <div className={styles.yourPositionInner}>
              <div className={styles.yourPositionRank}>#{youEntry.rank}</div>
              <div className={styles.yourPositionName}>
                {youEntry.displayName}
                <span className={styles.youTag}>you</span>
              </div>
              <div className={styles.yourPositionXP}>{youEntry.totalXP.toLocaleString()} XP</div>
              <div className={styles.yourPositionStreak}>🔥 {youEntry.streak} day streak</div>
              {youEntry.rank > 1 && LEADERBOARD[youEntry.rank - 2] && (
                <div className={styles.yourPositionGap}>
                  Gap to #{youEntry.rank - 1}:{' '}
                  <strong>{(LEADERBOARD[youEntry.rank - 2].totalXP - youEntry.totalXP).toLocaleString()} XP</strong>
                </div>
              )}
              <Link href="/challenges" className={styles.yourPositionCta}>
                Close the gap →
              </Link>
            </div>
          </div>
        )}

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
