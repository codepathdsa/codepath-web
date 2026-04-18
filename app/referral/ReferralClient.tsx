'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';
import type { ReferralRow } from '@/lib/db/referrals';

// --- Types --------------------------------------------------------------------

interface ReferralEntry {
  initials: string;
  color: string;
  displayName: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'converted';
  plan: 'free' | 'pro' | 'legendary';
  xpEarned: number;
  daysAgo: number;
}

interface Milestone {
  count: number;
  label: string;
  reward: string;
  icon: string;
  xp: number;
  color: string;
}

interface ReferralClientProps {
  referralCode: string;
  referrals: ReferralRow[];
}

// --- Data (static) -----------------------------------------------------------

const BASE_URL = 'https://engprep.dev/signup?ref=';

const AVATAR_COLORS = ['#8b5cf6','#3b82f6','#10b981','#f97316','#ec4899','#06b6d4','#ef4444','#fbbf24'];

const MILESTONES: Milestone[] = [
  { count: 1,  label: '1 referral',  reward: '7 days Pro free',    icon: '🌱', xp: 250,  color: '#62de61' },
  { count: 3,  label: '3 referrals', reward: '30 days Pro free',   icon: '🔥', xp: 700,  color: '#f97316' },
  { count: 5,  label: '5 referrals', reward: 'Exclusive creature', icon: '🐉', xp: 1500, color: '#8b5cf6' },
  { count: 10, label: '10 referrals',reward: 'Legendary badge',    icon: '⚔',  xp: 3000, color: '#f59e0b' },
  { count: 25, label: '25 referrals',reward: '1 year Pro free',    icon: '👑', xp: 7500, color: '#ef4444' },
];

// --- Sub-components -----------------------------------------------------------

function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);

  useEffect(() => {
    const duration = 900;
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const p = Math.min((timestamp - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return <>{val.toLocaleString()}{suffix}</>;
}

// --- Main Page ----------------------------------------------------------------

export default function ReferralClient({ referralCode, referrals }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'rewards'>('friends');
  const [linkType, setLinkType] = useState<'link' | 'code'>('link');

  // Convert DB referrals to display format
  const REFERRED_USERS: ReferralEntry[] = referrals.map((r, i) => {
    const name = r.referred_display_name ?? r.referred_email?.split('@')[0] ?? 'Unknown';
    const initials = name.split(' ').map((w: string) => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
    const daysAgo = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
    return {
      initials,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      displayName: name,
      joinedDate: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: r.status as ReferralEntry['status'],
      plan: 'free' as const,
      xpEarned: r.status === 'converted' ? 250 : r.status === 'signed_up' ? 100 : 0,
      daysAgo,
    };
  });

  const TOTAL_REFERRALS  = REFERRED_USERS.length;
  const CONVERTED        = REFERRED_USERS.filter(u => u.status === 'converted').length;
  const PENDING          = REFERRED_USERS.filter(u => u.status === 'pending').length;
  const TOTAL_XP_EARNED  = REFERRED_USERS.reduce((s, u) => s + u.xpEarned, 0);
  const CURRENT_MILESTONE = MILESTONES.findIndex(m => m.count > TOTAL_REFERRALS);
  const ACTIVE_MILESTONE  = MILESTONES[CURRENT_MILESTONE] ?? MILESTONES[MILESTONES.length - 1];
  const PREV_MILESTONE    = MILESTONES[CURRENT_MILESTONE - 1] ?? null;
  const MILESTONE_PROGRESS = PREV_MILESTONE
    ? ((TOTAL_REFERRALS - PREV_MILESTONE.count) / (ACTIVE_MILESTONE.count - PREV_MILESTONE.count)) * 100
    : (TOTAL_REFERRALS / ACTIVE_MILESTONE.count) * 100;

  const referralUrl = `${BASE_URL}${referralCode}`;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — ignore
    }
  };

  const tweetText = encodeURIComponent(
    `I've been grinding ${TOTAL_REFERRALS} engineers through @engprep — the best interview prep that actually simulates real P0s.\n\nJoin me: ${referralUrl}`
  );

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;

  const statusColors: Record<string, string> = {
    converted: '#62de61',
    active:    '#f59e0b',
    pending:   '#6b7280',
  };

  const planColors: Record<string, string> = {
    pro:       '#8b5cf6',
    legendary: '#f59e0b',
    free:      '#6b7280',
  };

  return (
    <div className={styles.layout}>
      {/* -- Nav ----------------------------------------------------------- */}
      <AppNav />

      <main className={styles.main}>

        {/* -- Hero --------------------------------------------------------- */}
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>Referral Program</div>
          <h1 className={styles.heroTitle}>
            Invite engineers.<br />
            <span className={styles.heroAccent}>Stack XP. Earn Pro.</span>
          </h1>
          <p className={styles.heroSub}>
            For every engineer you refer who joins — you both get rewarded.<br />
            No limits. Every tier unlocks a bigger reward.
          </p>
        </div>

        {/* -- Stats row ---------------------------------------------------- */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Referred',   value: TOTAL_REFERRALS, suffix: '',    color: '#62de61' },
            { label: 'Converted to Pro', value: CONVERTED,       suffix: '',    color: '#8b5cf6' },
            { label: 'Pending',          value: PENDING,         suffix: '',    color: '#f59e0b' },
            { label: 'XP Earned',        value: TOTAL_XP_EARNED, suffix: ' XP', color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className={styles.statCard} style={{ '--stat-color': s.color } as React.CSSProperties}>
              <div className={styles.statValue}>
                <AnimatedCount target={s.value} suffix={s.suffix} />
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* -- Milestone progress ------------------------------------------- */}
        <div className={styles.milestoneCard}>
          <div className={styles.milestoneHead}>
            <div>
              <div className={styles.milestoneLabel}>Next Milestone</div>
              <div className={styles.milestoneTitle}>
                {ACTIVE_MILESTONE.icon} {ACTIVE_MILESTONE.label}
                <span className={styles.milestoneReward}>{ACTIVE_MILESTONE.reward}</span>
              </div>
            </div>
            <div className={styles.milestoneXp}>+{ACTIVE_MILESTONE.xp.toLocaleString()} XP</div>
          </div>

          <div className={styles.milestoneTrackWrap}>
            <div className={styles.milestoneTrack}>
              <div
                className={styles.milestoneFill}
                style={{ width: `${Math.min(MILESTONE_PROGRESS, 100)}%`, '--ms-color': ACTIVE_MILESTONE.color } as React.CSSProperties}
              />
            </div>
            <div className={styles.milestoneCounter}>
              {TOTAL_REFERRALS} / {ACTIVE_MILESTONE.count}
            </div>
          </div>

          {/* All milestones ladder */}
          <div className={styles.ladder}>
            {MILESTONES.map((m, i) => {
              const done = TOTAL_REFERRALS >= m.count;
              const isCurrent = i === CURRENT_MILESTONE;
              return (
                <div key={m.count} className={`${styles.ladderStep} ${done ? styles.ladderDone : ''} ${isCurrent ? styles.ladderCurrent : ''}`}>
                  <div className={styles.ladderDot} style={{ '--ld-color': m.color } as React.CSSProperties}>
                    {done ? '✓' : m.count}
                  </div>
                  <div className={styles.ladderInfo}>
                    <div className={styles.ladderTitle}>{m.icon} {m.label}</div>
                    <div className={styles.ladderReward}>{m.reward} · +{m.xp.toLocaleString()} XP</div>
                  </div>
                  {isCurrent && <div className={styles.ladderYou}>← next</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* -- Share card --------------------------------------------------- */}
        <div className={styles.shareCard}>
          <div className={styles.shareHead}>
            <div className={styles.shareTitle}>Your referral link</div>
            <div className={styles.shareToggle}>
              <button
                className={`${styles.toggleBtn} ${linkType === 'link' ? styles.toggleActive : ''}`}
                onClick={() => setLinkType('link')}
              >
                Link
              </button>
              <button
                className={`${styles.toggleBtn} ${linkType === 'code' ? styles.toggleActive : ''}`}
                onClick={() => setLinkType('code')}
              >
                Code
              </button>
            </div>
          </div>

          <div className={styles.linkRow}>
            <div className={styles.linkBox}>
              <span className={styles.linkText}>
                {linkType === 'link' ? referralUrl : referralCode}
              </span>
            </div>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
              onClick={() => handleCopy(linkType === 'link' ? referralUrl : referralCode)}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div className={styles.shareActions}>
            <a
              href={`https://twitter.com/intent/tweet?text=${tweetText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.shareBtn} ${styles.shareBtnX}`}
            >
              Share on 𝕏
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.shareBtn} ${styles.shareBtnLinkedIn}`}
            >
              Share on LinkedIn
            </a>
            <button
              className={`${styles.shareBtn} ${styles.shareBtnWhatsApp}`}
              onClick={() => handleCopy(`Hey! I've been using engprep to prep for interviews — real P0 scenarios, creatures, the works. Join with my link and we both get rewarded: ${referralUrl}`)}
            >
              {copied ? '✓ Copied message' : 'Copy for WhatsApp'}
            </button>
          </div>

          <div className={styles.doubleReward}>
            <span className={styles.doubleIcon}>🎁</span>
            <span>
              <strong>Double-sided reward:</strong> Your referred friend also gets{' '}
              <strong>7 days Pro free</strong> when they sign up with your link.
            </span>
          </div>
        </div>

        {/* -- Tabs: friends / rewards --------------------------------------- */}
        <div className={styles.tabsRow}>
          <button
            className={`${styles.tab} ${activeTab === 'friends' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Your Referrals
            <span className={styles.tabCount}>{TOTAL_REFERRALS}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'rewards' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards Breakdown
          </button>
        </div>

        {/* -- Friends table ------------------------------------------------ */}
        {activeTab === 'friends' && (
          <div className={styles.referralTable}>
            <div className={styles.tableHead}>
              <span>Engineer</span>
              <span>Joined</span>
              <span>Plan</span>
              <span>Status</span>
              <span className={styles.colRight}>XP earned</span>
            </div>
            {REFERRED_USERS.map((u, i) => (
              <div key={i} className={styles.tableRow}>
                <div className={styles.rowUser}>
                  <div className={styles.rowAvatar} style={{ background: u.color }}>{u.initials}</div>
                  <div>
                    <div className={styles.rowName}>{u.displayName}</div>
                    <div className={styles.rowMeta}>{u.daysAgo}d ago</div>
                  </div>
                </div>
                <span className={styles.rowDate}>{u.joinedDate}</span>
                <span className={styles.rowPlan} style={{ color: planColors[u.plan] }}>
                  {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                </span>
                <span className={styles.rowStatus} style={{ color: statusColors[u.status] }}>
                  {u.status === 'converted' ? '✓ Pro' : u.status === 'active' ? '● Active' : '○ Pending'}
                </span>
                <span className={styles.rowXp}>
                  {u.xpEarned > 0 ? `+${u.xpEarned} XP` : '—'}
                </span>
              </div>
            ))}
            <div className={styles.tableFoot}>
              <span className={styles.tableFootLeft}>
                {CONVERTED} converted · {PENDING} pending · {TOTAL_REFERRALS - CONVERTED - PENDING} active
              </span>
              <span className={styles.tableFootRight}>
                Total earned: +{TOTAL_XP_EARNED} XP
              </span>
            </div>
          </div>
        )}

        {/* -- Rewards breakdown -------------------------------------------- */}
        {activeTab === 'rewards' && (
          <div className={styles.rewardsGrid}>
            {MILESTONES.map((m, i) => {
              const done = TOTAL_REFERRALS >= m.count;
              return (
                <div
                  key={m.count}
                  className={`${styles.rewardCard} ${done ? styles.rewardDone : ''}`}
                  style={{ '--rc-color': m.color } as React.CSSProperties}
                >
                  <div className={styles.rewardIcon}>{m.icon}</div>
                  <div className={styles.rewardMilestone}>{m.label}</div>
                  <div className={styles.rewardName}>{m.reward}</div>
                  <div className={styles.rewardXp}>+{m.xp.toLocaleString()} XP</div>
                  {done
                    ? <div className={styles.rewardUnlocked}>✓ Unlocked</div>
                    : <div className={styles.rewardLocked}>{m.count - TOTAL_REFERRALS} more to go</div>
                  }
                </div>
              );
            })}
          </div>
        )}

        {/* -- How it works ------------------------------------------------- */}
        <div className={styles.howCard}>
          <div className={styles.howTitle}>How it works</div>
          <div className={styles.howSteps}>
            {[
              { n: '01', label: 'Share your link',    sub: 'Copy your personal referral link or code and share it with engineers you know.' },
              { n: '02', label: 'They sign up',       sub: 'Your friend signs up through your link and gets 7 days Pro free automatically.' },
              { n: '03', label: 'You earn rewards',   sub: 'Once they complete registration, your XP lands immediately. Pro days stack.' },
              { n: '04', label: 'Unlock milestones',  sub: 'Hit 1, 3, 5, 10, and 25 referrals for escalating rewards — including a 1-year Pro pass.' },
            ].map(s => (
              <div key={s.n} className={styles.howStep}>
                <div className={styles.howNum}>{s.n}</div>
                <div>
                  <div className={styles.howStepLabel}>{s.label}</div>
                  <div className={styles.howStepSub}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
