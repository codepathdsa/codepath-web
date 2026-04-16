'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CREATURES_BY_ID } from '@/lib/codex';
import styles from './DailyEncounter.module.css';

// In production this data comes from Supabase (daily_encounters table).
// For now we mock a realistic encounter state.
const MOCK_ENCOUNTER = {
  challengeId: 'ENG-WAR-001',
  challengeTitle: 'The Checkout Meltdown',
  challengeType: 'War Room',
  challengeDesc:
    'CPU is pegged at 99%. Checkout failure rate climbed to 18% at 14:32. A deploy shipped at 14:28. 4,200 users affected. You have 20 minutes.',
  creatureId: '502-hydra',
  expiresAt: (() => {
    // Always expires at midnight tonight
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  })(),
  status: 'active' as 'active' | 'captured' | 'escaped',
  isRare: true,
};

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

const TYPE_BADGE = {
  'War Room':       { label: 'War Room',       cls: 'badge-war' },
  'DSA':            { label: 'Contextual DSA',  cls: 'badge-dsa' },
  'PR Review':      { label: 'PR Review',       cls: 'badge-pr' },
  'System Design':  { label: 'System Design',   cls: 'badge-design' },
  'Tribunal':       { label: 'Tribunal',        cls: 'badge-design' },
} as const;

export default function DailyEncounter() {
  const countdown = useCountdown(MOCK_ENCOUNTER.expiresAt);
  const creature = CREATURES_BY_ID[MOCK_ENCOUNTER.creatureId];
  const badge = TYPE_BADGE[MOCK_ENCOUNTER.challengeType as keyof typeof TYPE_BADGE];

  const pad = (n: number) => String(n).padStart(2, '0');

  const challengeHref = `/challenges/war-room/${MOCK_ENCOUNTER.challengeId.split('-').pop()}`;

  return (
    <div className={`${styles.card} ${MOCK_ENCOUNTER.isRare ? styles.rare : ''}`}>
      {/* Glow strip */}
      {MOCK_ENCOUNTER.isRare && <div className={styles.rareStrip} />}

      {/* Header row */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className="t-section-label">Daily Encounter</span>
          {MOCK_ENCOUNTER.isRare && (
            <span className={styles.rareBadge}>✦ RARE</span>
          )}
        </div>

        {/* Countdown */}
        <div className={styles.countdown} title="Disappears at midnight">
          <span className={styles.countdownIcon}>⏱</span>
          <span className={styles.countdownTime}>
            {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
          </span>
          <span className={styles.countdownLabel}>remaining</span>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Creature preview */}
        <div className={`${styles.creaturePreview} ${MOCK_ENCOUNTER.isRare ? styles.creatureRareGlow : ''}`}>
          <div className={styles.creatureEmoji}>{creature?.icon ?? '?'}</div>
          <div className={styles.creatureName}>{creature?.name ?? '???'}</div>
          <div className={styles.creatureXP}>+{creature?.xpValue ?? 0} XP</div>
        </div>

        {/* Challenge info */}
        <div className={styles.info}>
          <div className={styles.typeBadgeRow}>
            {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
          </div>
          <h3 className={styles.title}>{MOCK_ENCOUNTER.challengeTitle}</h3>
          <p className={styles.desc}>{MOCK_ENCOUNTER.challengeDesc}</p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className={styles.footer}>
        <div className={styles.captureNote}>
          Complete this challenge to capture{' '}
          <strong>{creature?.name}</strong> for your Codex.
        </div>
        <Link
          href={challengeHref}
          className={`btn-primary ${styles.cta}`}
        >
          Capture Now →
        </Link>
      </div>

      {/* Escaped state overlay (shown if encounter expired without completion) */}
      {MOCK_ENCOUNTER.status === 'escaped' && (
        <div className={styles.escapedOverlay}>
          <div className={styles.escapedTitle}>Encounter Escaped</div>
          <p className={styles.escapedBody}>
            This creature vanished at midnight. A new one appears tomorrow.
          </p>
        </div>
      )}
    </div>
  );
}
