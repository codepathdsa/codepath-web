'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.css';

// --- Rank helpers -------------------------------------------------------------

const RANKS = [
  { min: 0,       max: 2000,    title: 'Intern',          color: '#8a8a8a', level: 1 },
  { min: 2001,    max: 8000,    title: 'Junior Engineer', color: '#3b82f6', level: 2 },
  { min: 8001,    max: 20000,   title: 'Mid Engineer',    color: '#10b981', level: 3 },
  { min: 20001,   max: 50000,   title: 'Senior Engineer', color: '#f59e0b', level: 4 },
  { min: 50001,   max: 100000,  title: 'Staff Engineer',  color: '#8b5cf6', level: 5 },
  { min: 100001,  max: 200000,  title: 'Principal',       color: '#f43f5e', level: 6 },
  { min: 200001,  max: Infinity, title: 'Fellow',         color: '#62de61', level: 7 },
];

function getRank(xp: number) {
  return RANKS.find(r => xp >= r.min && xp <= r.max) ?? RANKS[0];
}

function getNextRank(xp: number) {
  const idx = RANKS.findIndex(r => xp >= r.min && xp <= r.max);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

// --- Mock public profile data ------------------------------------------------
// In production: fetch from Supabase by username param.

const MOCK_PUBLIC_PROFILES: Record<string, {
  username: string;
  displayName: string;
  avatarInitials: string;
  totalXP: number;
  streak: number;
  longestStreak: number;
  challengesDone: number;
  warRoomsDone: number;
  prReviewsDone: number;
  perfectRuns: number;
  codexCaptured: number;
  codexTotal: number;
  track: string;
  joinedDate: string;
  isPro: boolean;
  isLegendary?: boolean;
  topCreatures: { emoji: string; name: string; stage: number; isShiny: boolean }[];
  recentActivity: { type: string; title: string; xp: number; badge: string; date: string }[];
}> = {
  'venkat_builds': {
    username: 'venkat_builds',
    displayName: 'Venkateshwaran P.',
    avatarInitials: 'VP',
    totalXP: 12450,
    streak: 23,
    longestStreak: 31,
    challengesDone: 42,
    warRoomsDone: 3,
    prReviewsDone: 14,
    perfectRuns: 2,
    codexCaptured: 18,
    codexTotal: 120,
    track: 'SDE II',
    joinedDate: 'Jan 2026',
    isPro: true,
    topCreatures: [
      { emoji: '⚡', name: 'Cache Hydra',       stage: 3, isShiny: false },
      { emoji: '👁', name: 'N+1 Phantom',        stage: 2, isShiny: false },
      { emoji: '💀', name: 'Concurrency Lord',   stage: 2, isShiny: true },
      { emoji: '👻', name: 'SQL Ghost',          stage: 1, isShiny: false },
    ],
    recentActivity: [
      { type: 'war',    title: 'Checkout Meltdown',              xp: 400, badge: 'badge-war', date: 'Apr 16' },
      { type: 'pr',     title: 'N+1 Connection Pool Leak',       xp: 250, badge: 'badge-pr',  date: 'Apr 15' },
      { type: 'dsa',    title: 'Payment System Double-Billing',  xp: 175, badge: 'badge-dsa', date: 'Apr 14' },
      { type: 'design', title: 'Global Rate Limiter Design',     xp: 350, badge: 'badge-design', date: 'Apr 12' },
    ],
  },
  'siddharth_g': {
    username: 'siddharth_g',
    displayName: 'Siddharth G.',
    avatarInitials: 'SG',
    totalXP: 48200,
    streak: 89,
    longestStreak: 89,
    challengesDone: 167,
    warRoomsDone: 34,
    prReviewsDone: 62,
    perfectRuns: 12,
    codexCaptured: 87,
    codexTotal: 120,
    track: 'Staff',
    joinedDate: 'Oct 2025',
    isPro: true,
    topCreatures: [
      { emoji: '⚡', name: 'Cache Hydra',       stage: 3, isShiny: true },
      { emoji: '🐉', name: 'Consensus Oracle',  stage: 3, isShiny: false },
      { emoji: '🔥', name: 'Gateway Kraken',    stage: 3, isShiny: true },
      { emoji: '👑', name: 'Uptime Titan',      stage: 3, isShiny: false },
    ],
    recentActivity: [
      { type: 'war',    title: 'Kafka Split-Brain Cascade',        xp: 600, badge: 'badge-war',    date: 'Apr 16' },
      { type: 'design', title: 'Multi-Region Failover Architecture',xp: 500, badge: 'badge-design', date: 'Apr 15' },
      { type: 'pr',     title: 'Memory Leak in Goroutine Pool',    xp: 300, badge: 'badge-pr',     date: 'Apr 14' },
      { type: 'dsa',    title: 'Circular Dependency Detector',     xp: 225, badge: 'badge-dsa',    date: 'Apr 13' },
    ],
  },
};

const FALLBACK_PROFILE = MOCK_PUBLIC_PROFILES['venkat_builds'];

// --- Sub-components ----------------------------------------------------------

function StarStage({ stage, isShiny }: { stage: number; isShiny: boolean }) {
  return (
    <div className={styles.stageStars}>
      {[1, 2, 3].map(s => (
        <span
          key={s}
          className={`${styles.star} ${s <= stage ? (isShiny ? styles.starShiny : styles.starFilled) : styles.starEmpty}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CopyShareBtn({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={styles.shareBtn} onClick={handle}>
      {copied ? '✓ Link Copied!' : '⎘ Share Profile'}
    </button>
  );
}

// --- Main page ---------------------------------------------------------------

export default function PublicProfilePage() {
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : 'venkat_builds';

  const profile = MOCK_PUBLIC_PROFILES[username] ?? FALLBACK_PROFILE;
  const rank = getRank(profile.totalXP);
  const nextRank = getNextRank(profile.totalXP);
  const profileUrl = `https://engprep.dev/u/${profile.username}`;

  const xpToNext = nextRank ? nextRank.min - profile.totalXP : 0;
  const progressPct = nextRank
    ? Math.round(((profile.totalXP - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  return (
    <div className={styles.page}>
      {/* Minimal header — this is a public page, no need for the full AppNav */}
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          engprep<span className={styles.cursor} />
        </Link>
        <div className={styles.headerRight}>
          <Link href="/challenges" className={styles.headerLink}>Try EngPrep →</Link>
        </div>
      </header>

      <main className={styles.main}>

        {/* -- Profile Hero Card ----------------------------------------- */}
        <div
          className={styles.heroCard}
          style={{ '--rank-color': rank.color } as React.CSSProperties}
        >
          {/* Rank glow top border */}
          <div className={styles.rankGlow} />

          <div className={styles.heroTop}>
            {/* Avatar */}
            <div className={styles.avatarWrap}>
              <div className={styles.avatar} style={{ background: rank.color + '22', borderColor: rank.color }}>
                {profile.avatarInitials}
              </div>
              <div className={styles.streakOverlay}>🔥 {profile.streak}</div>
            </div>

            {/* Identity */}
            <div className={styles.identity}>
              <div className={styles.displayName}>{profile.displayName}</div>
              <div className={styles.usernameTag}>@{profile.username}</div>
              <div className={styles.rankBadge} style={{ background: rank.color + '22', color: rank.color }}>
                {rank.title}
              </div>
              {profile.isPro && (
                <span className="badge badge-pro" style={{ marginTop: '4px' }}>PRO</span>
              )}
            </div>

            {/* Share button */}
            <div className={styles.shareWrap}>
              <CopyShareBtn url={profileUrl} />
            </div>
          </div>

          {/* XP Progress bar */}
          <div className={styles.xpSection}>
            <div className={styles.xpRow}>
              <span className={styles.xpValue}>{profile.totalXP.toLocaleString()} XP</span>
              {nextRank && (
                <span className={styles.xpToNext}>
                  {xpToNext.toLocaleString()} XP to {nextRank.title}
                </span>
              )}
            </div>
            <div className={styles.xpBar}>
              <div
                className={styles.xpBarFill}
                style={{ width: `${progressPct}%`, background: rank.color }}
              />
            </div>
          </div>

          {/* Quick stats row */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statVal}>{profile.challengesDone}</div>
              <div className={styles.statLabel}>Challenges</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{profile.warRoomsDone}</div>
              <div className={styles.statLabel}>War Rooms</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{profile.streak}d</div>
              <div className={styles.statLabel}>Streak</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal} style={{ color: '#f59e0b' }}>{profile.perfectRuns}</div>
              <div className={styles.statLabel}>Perfect Runs</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>
                {profile.codexCaptured}
                <span className={styles.statSlash}> / {profile.codexTotal}</span>
              </div>
              <div className={styles.statLabel}>Codex</div>
            </div>
          </div>
        </div>

        {/* -- Top Creatures -------------------------------------------- */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Creatures</h2>
          <div className={styles.creaturesGrid}>
            {profile.topCreatures.map((c, i) => (
              <div key={i} className={`${styles.creatureCard} ${c.isShiny ? styles.creatureShiny : ''}`}>
                <div className={styles.creatureEmoji}>{c.emoji}</div>
                <div className={styles.creatureName}>{c.name}</div>
                <StarStage stage={c.stage} isShiny={c.isShiny} />
                {c.isShiny && <div className={styles.shinyTag}>✦ SHINY</div>}
              </div>
            ))}
          </div>
        </section>

        {/* -- Recent Activity ------------------------------------------- */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            {profile.recentActivity.map((ev, i) => (
              <div key={i} className={styles.activityItem}>
                <span className={`badge ${ev.badge}`}>{ev.type.toUpperCase()}</span>
                <span className={styles.activityTitle}>{ev.title}</span>
                <span className={styles.activityDate}>{ev.date}</span>
                <span className={styles.activityXp}>+{ev.xp} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* -- CTA -------------------------------------------------------- */}
        <div className={styles.ctaCard}>
          <div className={styles.ctaText}>
            <span className={styles.ctaBold}>Build your own engineering profile.</span>
            {' '}Level up. Capture creatures. Survive the War Room.
          </div>
          <Link href="/signup" className="btn-primary">Start for free →</Link>
        </div>

        {/* -- Footer ----------------------------------------------------- */}
        <div className={styles.footer}>
          <Link href="/" className={styles.footerLogo}>engprep</Link>
          <span className={styles.footerTagline}>The anti-LeetCode interview platform.</span>
        </div>
      </main>
    </div>
  );
}
