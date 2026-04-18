import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';
import { CREATURES_BY_ID, TOTAL_CREATURES } from '@/lib/codex';
import { getMyProfile } from '@/lib/db/profile';
import { getMyCodex } from '@/lib/db/codex';
import { CopyButton } from '@/app/components/CopyButton';

// --- Rank data ----------------------------------------------------------------

const RANKS = [
  { min: 0,      max: 2000,   title: 'Intern',             color: '#8a8a8a' },
  { min: 2001,   max: 8000,   title: 'Junior Engineer',    color: '#3b82f6' },
  { min: 8001,   max: 20000,  title: 'Mid Engineer',       color: '#10b981' },
  { min: 20001,  max: 50000,  title: 'Senior Engineer',    color: '#f59e0b' },
  { min: 50001,  max: 100000, title: 'Staff Engineer',     color: '#8b5cf6' },
  { min: 100001, max: 200000, title: 'Principal',          color: '#f43f5e' },
  { min: 200001, max: Infinity,title: 'Fellow',            color: '#62de61' },
];

function getRank(xp: number) {
  return RANKS.find(r => xp >= r.min && xp <= r.max) ?? RANKS[0];
}

function getLevel(xp: number) {
  // Each level requires 10% more XP than the last, starting at 500 XP per level
  let level = 1;
  let threshold = 500;
  let accumulated = 0;
  while (accumulated + threshold <= xp) {
    accumulated += threshold;
    level++;
    threshold = Math.floor(threshold * 1.1);
  }
  const progressInLevel = xp - accumulated;
  const pct = Math.round((progressInLevel / threshold) * 100);
  return { level, progressInLevel, threshold, pct };
}

// --- Mock profile -------------------------------------------------------------

const PROFILE = {
  username:        'venkat_builds',
  displayName:     'Venkateshwaran P.',
  avatarInitials:  'VP',
  totalXP:         12450,
  currentStreak:   23,
  longestStreak:   31,
  challengesDone:  42,
  warRoomsDone:    3,
  prReviewsDone:   14,
  perfectRuns:     2,
  joinedDate:      'Jan 2026',
  track:           'SDE II',
  targetCompanies: ['Meta', 'Stripe', 'Notion'],
  topCreatureIds:  ['cache-hydra', 'n1-phantom', 'concurrency-lord', 'sql-ghost'],
};

// --- Sub-components -----------------------------------------------------------

function StatTile({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div className={styles.statTile}>
      <div className={styles.statVal} style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function ProfileCopyButton({ text, className }: { text: string; className?: string }) {
  return <CopyButton value={text} />;
}

// --- Main Page ----------------------------------------------------------------

export default async function ProfilePage() {
  const [{ profile, stats }, { captured, shiny }] = await Promise.all([
    getMyProfile(),
    getMyCodex(),
  ]);

  const totalXP = stats?.total_xp ?? 0;
  const currentStreak = stats?.current_streak ?? 0;
  const longestStreak = stats?.longest_streak ?? 0;
  const challengesDone = stats?.challenges_done ?? 0;
  const warRoomsDone = stats?.war_rooms_done ?? 0;
  const prReviewsDone = stats?.pr_reviews_done ?? 0;
  const perfectRuns = stats?.perfect_runs ?? 0;

  const username = profile?.username ?? 'you';
  const displayName = profile?.display_name ?? username;
  const avatarInitials = displayName.split(' ').map((w: string) => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
  const track = profile?.track ?? 'SDE II';
  const targetCompanies = profile?.target_companies ?? [];
  const joinedDate = 'N/A';

  const PROFILE = {
    username, displayName, avatarInitials, track, targetCompanies, joinedDate,
    totalXP, currentStreak, longestStreak, challengesDone, warRoomsDone,
    prReviewsDone, perfectRuns,
    topCreatureIds: Array.from(captured).slice(0, 4),
  };

  const rank = getRank(PROFILE.totalXP);
  const { level, progressInLevel, threshold, pct } = getLevel(PROFILE.totalXP);
  const capturedCount = [...captured].filter(id => CREATURES_BY_ID[id]).length;
  const profileUrl = `https://engprep.dev/u/${PROFILE.username}`;

  const topCreatures = PROFILE.topCreatureIds.map(id => CREATURES_BY_ID[id]).filter(Boolean);

  return (
    <div className={styles.layout}>
      {/* -- Nav ----------------------------------------------------------- */}
      <AppNav />

      <main className={styles.main}>
        {/* -- Profile hero card ----------------------------------------- */}
        <div className={styles.heroCard} style={{ '--rank-color': rank.color } as React.CSSProperties}>
          {/* Rank glow strip */}
          <div className={styles.rankStrip} />

          <div className={styles.heroInner}>
            {/* Avatar */}
            <div className={styles.avatarWrap}>
              <div className={styles.avatarGlow} />
              <div className={styles.avatar}>{PROFILE.avatarInitials}</div>
              {/* Streak flame badge */}
              <div className={styles.streakBadge}>
                🔥 {PROFILE.currentStreak}
              </div>
            </div>

            {/* Identity block */}
            <div className={styles.identity}>
              <div className={styles.displayName}>{PROFILE.displayName}</div>
              <div className={styles.username}>@{PROFILE.username}</div>

              <div className={styles.rankRow}>
                <span
                  className={styles.rankPill}
                  style={{ color: rank.color, borderColor: `${rank.color}40`, background: `${rank.color}12` }}
                >
                  {rank.title}
                </span>
                <span className={styles.trackPill}>{PROFILE.track}</span>
                <span className={styles.joinDate}>Member since {PROFILE.joinedDate}</span>
              </div>

              {/* Target companies */}
              <div className={styles.targets}>
                <span className={styles.targetsLabel}>Targeting:</span>
                {PROFILE.targetCompanies.map(c => (
                  <span key={c} className={styles.companyTag}>{c}</span>
                ))}
              </div>
            </div>

            {/* Level + XP block */}
            <div className={styles.levelBlock}>
              <div className={styles.levelLabel}>Level</div>
              <div className={styles.levelNum}>{level}</div>
              <div className={styles.xpBar}>
                <div className={styles.xpFill} style={{ width: `${pct}%` }} />
              </div>
              <div className={styles.xpText}>
                <span className={styles.xpCurrent}>{progressInLevel.toLocaleString()}</span>
                <span className={styles.xpMax}> / {threshold.toLocaleString()} XP</span>
              </div>
              <div className={styles.xpTotal}>{PROFILE.totalXP.toLocaleString()} total XP</div>
            </div>
          </div>

          {/* Share row */}
          <div className={styles.shareRow}>
            <span className={styles.shareUrl}>{profileUrl}</span>
            <CopyButton value={profileUrl} />
            <a
              href={`https://twitter.com/intent/tweet?text=I'm a ${rank.title} (Level ${level}) on @engprep_dev — ${capturedCount}/${TOTAL_CREATURES} mastery creatures captured. Can you beat me?&url=${profileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tweetBtn}
            >
              Share on 𝕏
            </a>
          </div>
        </div>

        {/* -- Stats grid -------------------------------------------------- */}
        <div className={styles.statsGrid}>
          <StatTile value={`${PROFILE.currentStreak} 🔥`} label="Current Streak" accent="#f97316" />
          <StatTile value={PROFILE.longestStreak} label="Longest Streak" />
          <StatTile value={PROFILE.challengesDone} label="Challenges Done" />
          <StatTile value={PROFILE.warRoomsDone} label="War Rooms Survived" accent="#ef4444" />
          <StatTile value={PROFILE.prReviewsDone} label="PRs Reviewed" />
          <StatTile value={`${capturedCount}/${TOTAL_CREATURES}`} label="Codex Captured" accent="#62de61" />
          <StatTile value={PROFILE.perfectRuns} label="Perfect Runs ✦" accent="gold" />
          <StatTile value={`${PROFILE.totalXP.toLocaleString()} XP`} label="Total XP" />
        </div>

        {/* -- Two-column lower layout ------------------------------------- */}
        <div className={styles.lowerGrid}>

          {/* Rank progression card */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Rank Progression</div>
            <div className={styles.rankTrack}>
              {RANKS.map((r, i) => {
                const isCurrent = r.title === rank.title;
                const isPast = RANKS.indexOf(r) < RANKS.indexOf(rank);
                return (
                  <div key={r.title} className={`${styles.rankNode} ${isCurrent ? styles.rankNodeCurrent : ''} ${isPast ? styles.rankNodePast : ''}`}>
                    <div
                      className={styles.rankDot}
                      style={{
                        background: isPast || isCurrent ? r.color : 'var(--bg-raised)',
                        borderColor: isCurrent ? r.color : isPast ? `${r.color}60` : 'var(--border-subtle)',
                        boxShadow: isCurrent ? `0 0 12px ${r.color}50` : 'none',
                      }}
                    />
                    {i < RANKS.length - 1 && (
                      <div
                        className={styles.rankLine}
                        style={{ background: isPast ? `${RANKS[i].color}50` : 'var(--border-subtle)' }}
                      />
                    )}
                    <div className={styles.rankNodeLabel} style={isCurrent ? { color: r.color } : undefined}>
                      {r.title}
                    </div>
                    {isCurrent && (
                      <div className={styles.rankYouBadge}>← YOU</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.rankNext}>
              {rank.title !== 'Fellow' && (
                <>
                  <span className={styles.rankNextLabel}>XP to next rank:</span>
                  <span className={styles.rankNextVal}>
                    {((RANKS[RANKS.indexOf(rank) + 1]?.min ?? Infinity) - totalXP).toLocaleString()} XP
                  </span>
                </>
              )}
              {rank.title === 'Fellow' && (
                <span className={styles.rankNextLabel}>🎓 Maximum rank achieved</span>
              )}
            </div>
          </div>

          {/* Top creatures */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              Top Creatures
              <Link href="/codex" className={styles.panelLink}>View Codex →</Link>
            </div>
            <div className={styles.topCreatures}>
              {topCreatures.map(c => (
                <div
                  key={c.id}
                  className={styles.topCreatureRow}
                  style={{ '--creature-color': c.color } as React.CSSProperties}
                >
                  <div className={styles.topCreatureIcon}>{c.icon}</div>
                  <div className={styles.topCreatureInfo}>
                    <div className={styles.topCreatureName}>
                      {c.name}
                      {shiny.has(c.id) && <span className={styles.shinyMark}>✦</span>}
                    </div>
                    <div className={styles.topCreatureDomain}>
                      {c.domain.replace('-', ' ')} · Stage {['I', 'II', 'III'][c.stage - 1]}
                    </div>
                  </div>
                  <div className={styles.topCreatureXP}>+{c.xpValue} XP</div>
                </div>
              ))}
            </div>
            <Link href="/codex" className={styles.viewMoreLink}>
              {capturedCount}/{TOTAL_CREATURES} captured — {TOTAL_CREATURES - capturedCount} remaining →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
