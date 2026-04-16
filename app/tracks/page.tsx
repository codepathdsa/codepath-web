'use client';

import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

// --- Types -------------------------------------------------------------------

interface CompanyTrack {
  slug: string;
  name: string;
  logo: string;           // emoji placeholder — replace with <Image> + real logo
  tagline: string;
  rounds: string[];       // interview format
  challengeCount: number;
  warRoomCount: number;
  avgHours: number;       // estimated prep hours
  difficulty: 'medium' | 'hard' | 'very hard';
  color: string;          // brand accent
  tags: string[];
  userProgress?: number;  // % complete (mock — comes from Supabase)
}

// --- Data --------------------------------------------------------------------

const TRACKS: CompanyTrack[] = [
  {
    slug: 'google',
    name: 'Google',
    logo: 'G',
    tagline: 'Structured problem-solving at scale. Expect ambiguity, depth, and systems thinking.',
    rounds: ['Phone Screen', 'Coding ×2', 'System Design', 'Behavioral (Googleyness)'],
    challengeCount: 28,
    warRoomCount: 3,
    avgHours: 42,
    difficulty: 'very hard',
    color: '#4285f4',
    tags: ['Distributed Systems', 'Algorithm Depth', 'Scalability'],
    userProgress: 18,
  },
  {
    slug: 'meta',
    name: 'Meta',
    logo: 'M',
    tagline: 'Fast-paced product engineering at massive scale. Speed and clarity matter.',
    rounds: ['Coding ×2', 'System Design', 'Behavioral', 'Cross-Functional'],
    challengeCount: 24,
    warRoomCount: 3,
    avgHours: 38,
    difficulty: 'hard',
    color: '#0081fb',
    tags: ['Product Thinking', 'Performance', 'Graph Problems'],
    userProgress: 0,
  },
  {
    slug: 'amazon',
    name: 'Amazon',
    logo: 'A',
    tagline: 'LP-heavy. Every interview maps to Leadership Principles. Own your execution.',
    rounds: ['OA', 'Coding ×2', 'System Design', 'Behavioral (LPs) ×2'],
    challengeCount: 26,
    warRoomCount: 4,
    avgHours: 45,
    difficulty: 'hard',
    color: '#ff9900',
    tags: ['Leadership Principles', 'Ownership', 'Distributed Scale'],
    userProgress: 35,
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    logo: 'S',
    tagline: 'Deeply technical. Expect payments domain, API design, and real production scenarios.',
    rounds: ['Take-Home', 'Coding ×2', 'System Design', 'Infrastructure', 'Cultural'],
    challengeCount: 18,
    warRoomCount: 3,
    avgHours: 34,
    difficulty: 'very hard',
    color: '#635bff',
    tags: ['Payments', 'API Design', 'Reliability'],
    userProgress: 0,
  },
  {
    slug: 'airbnb',
    name: 'Airbnb',
    logo: '✦',
    tagline: 'Strong focus on craft and UX intuition. System Design with empathy.',
    rounds: ['Phone Screen', 'Coding ×2', 'System Design', 'Cross-Functional', 'Hiring Manager'],
    challengeCount: 20,
    warRoomCount: 2,
    avgHours: 36,
    difficulty: 'hard',
    color: '#ff5a5f',
    tags: ['User Experience', 'Search Systems', 'Code Quality'],
    userProgress: 7,
  },
  {
    slug: 'linear',
    name: 'Linear',
    logo: 'L',
    tagline: 'Small team, high bar. Craft, velocity, and opinionated product thinking.',
    rounds: ['Async Take-Home', 'Technical Deep-Dive', 'CEO/Co-founder Chat'],
    challengeCount: 12,
    warRoomCount: 1,
    avgHours: 20,
    difficulty: 'hard',
    color: '#5e6ad2',
    tags: ['Craft', 'Product Eng', 'Performance'],
    userProgress: 0,
  },
  {
    slug: 'vercel',
    name: 'Vercel',
    logo: '▲',
    tagline: 'Elite DX engineers. Edge runtimes, build performance, and developer empathy.',
    rounds: ['Take-Home Project', 'Technical Review', 'System Design', 'Culture'],
    challengeCount: 10,
    warRoomCount: 1,
    avgHours: 18,
    difficulty: 'hard',
    color: '#fff',
    tags: ['Edge Computing', 'DX', 'Performance'],
    userProgress: 0,
  },
  {
    slug: 'notion',
    name: 'Notion',
    logo: 'N',
    tagline: 'Product-minded engineers building extensible systems. Balance matters.',
    rounds: ['Phone Screen', 'Coding ×2', 'System Design', 'Behavioral'],
    challengeCount: 14,
    warRoomCount: 2,
    avgHours: 28,
    difficulty: 'medium',
    color: '#fff',
    tags: ['Extensibility', 'Collaboration', 'Product Sense'],
    userProgress: 0,
  },
];

const DIFF_LABEL: Record<CompanyTrack['difficulty'], string> = {
  'medium':    'Medium',
  'hard':      'Hard',
  'very hard': 'Very Hard',
};

const DIFF_COLOR: Record<CompanyTrack['difficulty'], string> = {
  'medium':    '#10b981',
  'hard':      '#f59e0b',
  'very hard': '#ef4444',
};

// --- Page --------------------------------------------------------------------

export default function TracksPage() {
  return (
    <>
      <AppNav />
      <main className={styles.page}>

        {/* ── Hero ─────────────────────────────────────── */}
        <div className={styles.hero}>
          <span className="t-section-label">Company Tracks</span>
          <h1 className={styles.heroTitle}>Prep for the exact company you&rsquo;re targeting</h1>
          <p className={styles.heroSub}>
            Curated challenges, War Room scenarios, and interview format breakdowns — all filtered
            to match what specific companies actually ask.
          </p>
        </div>

        {/* ── Stats row ────────────────────────────────── */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statNum}>8</span>
            <span className={styles.statLabel}>Companies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>152</span>
            <span className={styles.statLabel}>Challenges</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>19</span>
            <span className={styles.statLabel}>War Rooms</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>~35h</span>
            <span className={styles.statLabel}>Avg Prep Time</span>
          </div>
        </div>

        {/* ── Track grid ───────────────────────────────── */}
        <div className={styles.grid}>
          {TRACKS.map(track => (
            <Link
              key={track.slug}
              href={`/tracks/${track.slug}`}
              className={styles.card}
              style={{ '--track-color': track.color } as React.CSSProperties}
            >
              {/* Color accent strip */}
              <div className={styles.cardStrip} />

              {/* Company header */}
              <div className={styles.cardHead}>
                <div
                  className={styles.logoBox}
                  style={{ background: `${track.color}22`, border: `1px solid ${track.color}44`, color: track.color }}
                >
                  {track.logo}
                </div>
                <div className={styles.companyInfo}>
                  <span className={styles.companyName}>{track.name}</span>
                  <span
                    className={styles.diffLabel}
                    style={{ color: DIFF_COLOR[track.difficulty] }}
                  >
                    {DIFF_LABEL[track.difficulty]}
                  </span>
                </div>
              </div>

              <p className={styles.tagline}>{track.tagline}</p>

              {/* Tags */}
              <div className={styles.tagRow}>
                {track.tags.map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>

              {/* Stats */}
              <div className={styles.cardStats}>
                <span>{track.challengeCount} challenges</span>
                <span className={styles.dot} />
                <span>{track.warRoomCount} War Rooms</span>
                <span className={styles.dot} />
                <span>~{track.avgHours}h prep</span>
              </div>

              {/* Progress bar (if started) */}
              {track.userProgress !== undefined && track.userProgress > 0 && (
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${track.userProgress}%`, background: track.color }}
                    />
                  </div>
                  <span className={styles.progressPct}>{track.userProgress}% complete</span>
                </div>
              )}

              {/* Interview rounds */}
              <div className={styles.rounds}>
                {track.rounds.map((r, i) => (
                  <span key={i} className={styles.round}>{r}</span>
                ))}
              </div>

              <div className={styles.cardCta}>
                {(track.userProgress ?? 0) > 0 ? 'Continue Track →' : 'Start Track →'}
              </div>
            </Link>
          ))}

          {/* Coming soon card */}
          <div className={`${styles.card} ${styles.cardComingSoon}`}>
            <div className={styles.csBody}>
              <span className={styles.csIcon}>🔜</span>
              <span className={styles.csTitle}>More coming</span>
              <span className={styles.csSub}>Netflix · Apple · Shopify · Figma</span>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
