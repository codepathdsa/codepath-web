import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import { CopyShareBtn } from '@/app/components/CopyShareBtn';
import { getPublicProfile } from '@/lib/db/profile';
import { sql } from '@/lib/db';
import { CREATURES_BY_ID } from '@/lib/codex';

// --- Rank helpers ---
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

// --- Sub-components ---
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

// --- Main Page ---

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;
  const { profile, stats } = await getPublicProfile(username);
  
  if (!profile) {
    notFound();
  }

  // Fetch codex
  const [codex, activities] = await Promise.all([
    sql`SELECT * FROM user_codex WHERE user_id = ${profile.id}`,
    sql`SELECT * FROM user_activities WHERE user_id = ${profile.id} ORDER BY created_at DESC LIMIT 10`
  ]);
  
  const rank = getRank(stats?.total_xp ?? 0);
  const nextRank = getNextRank(stats?.total_xp ?? 0);
  const profileUrl = `https://engprep.dev/u/${profile.username}`;

  const xpToNext = nextRank ? nextRank.min - (stats?.total_xp ?? 0) : 0;
  const progressPct = nextRank
    ? Math.round((((stats?.total_xp ?? 0) - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  // Process codex to get top creatures
  const ObjectKeys = Object.keys(CREATURES_BY_ID);
  const codexTotal = ObjectKeys.length;
  const codexCaptured = codex?.length ?? 0;
  
  const capturedCreatures = (codex ?? []).map(entry => {
    const creatureMeta = CREATURES_BY_ID[entry.creature_id];
    if (!creatureMeta) return null;
    return {
      emoji: creatureMeta.icon,
      name: creatureMeta.name,
      stage: creatureMeta.stage,
      isShiny: entry.is_shiny,
      xpValue: creatureMeta.xpValue
    };
  }).filter(Boolean) as { emoji: string; name: string; stage: number; isShiny: boolean; xpValue: number }[];

  // Sort by highest xpValue to find "Top Creatures"
  capturedCreatures.sort((a, b) => b.xpValue - a.xpValue);
  const topCreatures = capturedCreatures.slice(0, 4);

  const displayName = profile.display_name || profile.username;
  const avatarInitials = displayName.substring(0, 2).toUpperCase();

  // Process recentActivity
  const recentActivity = (activities ?? []).map((ev: any) => ({
    type: ev.type,
    badge: ev.type === 'war' ? 'badge-war' : ev.type === 'dsa' ? 'badge-dsa' : ev.type === 'pr' ? 'badge-pr' : 'badge-design',
    title: ev.title,
    date: new Date(ev.created_at).toLocaleDateString(),
    xp: ev.xp,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          engprep<span className={styles.cursor} />
        </Link>
        <div className={styles.headerRight}>
          <Link href="/challenges" className={styles.headerLink}>Try EngPrep →</Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.heroCard} style={{ '--rank-color': rank.color } as React.CSSProperties}>
          <div className={styles.rankGlow} />

          <div className={styles.heroTop}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar} style={{ background: rank.color + '22', borderColor: rank.color }}>
                {avatarInitials}
              </div>
              <div className={styles.streakOverlay}>🔥 {stats?.current_streak ?? 0}</div>
            </div>

            <div className={styles.identity}>
              <div className={styles.displayName}>{displayName}</div>
              <div className={styles.usernameTag}>@{profile.username}</div>
              <div className={styles.rankBadge} style={{ background: rank.color + '22', color: rank.color }}>
                {rank.title}
              </div>
              {profile.is_premium && (
                <span className="badge badge-pro" style={{ marginTop: '4px' }}>PRO</span>
              )}
            </div>

            <div className={styles.shareWrap}>
              <CopyShareBtn url={profileUrl} />
            </div>
          </div>

          <div className={styles.xpSection}>
            <div className={styles.xpRow}>
              <span className={styles.xpValue}>{(stats?.total_xp ?? 0).toLocaleString()} XP</span>
              {nextRank && (
                <span className={styles.xpToNext}>
                  {xpToNext.toLocaleString()} XP to {nextRank.title}
                </span>
              )}
            </div>
            <div className={styles.xpBar}>
              <div className={styles.xpBarFill} style={{ width: `${progressPct}%`, background: rank.color }} />
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statVal}>{stats?.challenges_done ?? 0}</div>
              <div className={styles.statLabel}>Challenges</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{stats?.war_rooms_done ?? 0}</div>
              <div className={styles.statLabel}>War Rooms</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{stats?.current_streak ?? 0}d</div>
              <div className={styles.statLabel}>Streak</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal} style={{ color: '#f59e0b' }}>{stats?.perfect_runs ?? 0}</div>
              <div className={styles.statLabel}>Perfect Runs</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>
                {codexCaptured}
                <span className={styles.statSlash}> / {codexTotal}</span>
              </div>
              <div className={styles.statLabel}>Codex</div>
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Creatures</h2>
          <div className={styles.creaturesGrid}>
            {topCreatures.map((c, i) => (
              <div key={i} className={`${styles.creatureCard} ${c.isShiny ? styles.creatureShiny : ''}`}>
                <div className={styles.creatureEmoji}>{c.emoji}</div>
                <div className={styles.creatureName}>{c.name}</div>
                <StarStage stage={c.stage} isShiny={c.isShiny} />
                {c.isShiny && <div className={styles.shinyTag}>✦ SHINY</div>}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            {recentActivity.length > 0 ? recentActivity.map((ev, i) => (
              <div key={i} className={styles.activityItem}>
                <span className={`badge ${ev.badge}`}>{ev.type.toUpperCase()}</span>
                <span className={styles.activityTitle}>{ev.title}</span>
                <span className={styles.activityDate}>{ev.date}</span>
                <span className={styles.activityXp}>+{ev.xp} XP</span>
              </div>
            )) : <p className={styles.emptyState}>No recent activity found.</p>}
          </div>
        </section>

        <div className={styles.ctaCard}>
          <div className={styles.ctaText}>
            <span className={styles.ctaBold}>Build your own engineering profile.</span>
            {' '}Level up. Capture creatures. Survive the War Room.
          </div>
          <Link href="/signup" className="btn-primary">Start for free →</Link>
        </div>

        <div className={styles.footer}>
          <Link href="/" className={styles.footerLogo}>engprep</Link>
          <span className={styles.footerTagline}>The anti-LeetCode interview platform.</span>
        </div>
      </main>
    </div>
  );
}
