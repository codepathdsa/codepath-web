'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getCreatureForChallenge,
  TOTAL_CREATURES,
  CREATURES_BY_ID,
} from '@/lib/codex';
import { useProgress } from '@/app/hooks/useProgress';
import styles from './CaptureOverlay.module.css';

interface CaptureOverlayProps {
  challengeId: string;
  isPerfectRun?: boolean;
  timeTakenSeconds?: number;
  nextChallengeHref?: string;
  onClose: () => void;
}

const RARITY_COLOR: Record<string, string> = {
  common:   '#94a3b8',
  uncommon: '#62de61',
  rare:     '#8b5cf6',
  legendary:'#f59e0b',
};

const RARITY_LABEL: Record<string, string> = {
  common:   'Common',
  uncommon: 'Uncommon',
  rare:     'Rare',
  legendary:'Legendary',
};

const STAGE_LABEL = ['', 'Stage I', 'Stage II', 'Stage III'];

// 40 confetti pieces with deterministic-ish random values baked in
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left:  `${((i * 137.5) % 100).toFixed(1)}%`,
  delay: `${((i * 0.17) % 1.5).toFixed(2)}s`,
  color: ['#62de61','#8b5cf6','#f59e0b','#3b82f6','#ef4444','#06b6d4'][i % 6],
  size:  `${6 + (i % 5) * 2}px`,
  dur:   `${1.2 + (i % 4) * 0.25}s`,
}));

export default function CaptureOverlay({
  challengeId,
  isPerfectRun = false,
  timeTakenSeconds,
  nextChallengeHref,
  onClose,
}: CaptureOverlayProps) {
  const { capturedCodex } = useProgress();
  const creature = getCreatureForChallenge(challengeId);
  const isAlreadyCaptured = capturedCodex.has(creature.id);
  const capturedCount = capturedCodex.size + (isAlreadyCaptured ? 0 : 1);

  const evolvedTo = creature.evolvesTo ? CREATURES_BY_ID[creature.evolvesTo] : null;

  const xpEarned = isPerfectRun ? Math.round(creature.xpValue * 1.5) : creature.xpValue;

  const [phase, setPhase] = useState<'enter' | 'active'>('enter');

  useEffect(() => {
    const t = setTimeout(() => setPhase('active'), 80);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`;

  return (
    <div
      className={`${styles.backdrop} ${phase === 'active' ? styles.backdropVisible : ''}`}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`${creature.name} captured`}
    >
      {/* Confetti */}
      <div className={styles.confettiWrap} aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            className={`${styles.confettiPiece} ${phase === 'active' ? styles.confettiActive : ''}`}
            style={{
              left: c.left,
              animationDelay: c.delay,
              background: c.color,
              width: c.size,
              height: c.size,
              animationDuration: c.dur,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div
        className={`${styles.card} ${phase === 'active' ? styles.cardVisible : ''}`}
        style={{ '--creature-color': creature.color } as React.CSSProperties}
      >
        {/* Dismiss */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* Capture headline */}
        <div className={styles.captureHeader}>
          {isPerfectRun ? (
            <span className={styles.perfectBadge}>✦ PERFECT RUN</span>
          ) : null}
          <h1 className={styles.captureTitle}>
            {isAlreadyCaptured ? 'ENCOUNTERED AGAIN' : 'CAPTURED!'}
          </h1>
        </div>

        {/* Creature display */}
        <div className={styles.creatureWrap}>
          <div className={styles.glowRing} />
          <div className={styles.glowRing2} />
          {isPerfectRun && <div className={styles.shinyRing} />}
          <div className={styles.creatureIcon}>{creature.icon}</div>
          {isPerfectRun && <span className={styles.shinyBadge}>✦ Shiny</span>}
        </div>

        {/* Info */}
        <div className={styles.creatureInfo}>
          <div className={styles.creatureName}>{creature.name}</div>
          <div className={styles.creatureMeta}>
            <span
              className={styles.rarityPill}
              style={{ color: RARITY_COLOR[creature.rarity], borderColor: RARITY_COLOR[creature.rarity] + '55' }}
            >
              {RARITY_LABEL[creature.rarity]}
            </span>
            <span className={styles.stagePill}>{STAGE_LABEL[creature.stage]}</span>
            <span className={styles.domainPill}>{creature.domain.replace('-', ' ')}</span>
          </div>
          <p className={styles.creatureDesc}>{creature.description}</p>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statVal} style={{ color: '#62de61' }}>+{xpEarned}</div>
            <div className={styles.statLbl}>XP Earned</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <div className={styles.statVal}>{capturedCount}<span className={styles.statTot}>/{TOTAL_CREATURES}</span></div>
            <div className={styles.statLbl}>Codex</div>
          </div>
          {timeTakenSeconds !== undefined && (
            <>
              <div className={styles.statDivider} />
              <div className={styles.statBox}>
                <div className={styles.statVal}>{formatTime(timeTakenSeconds)}</div>
                <div className={styles.statLbl}>Time Taken</div>
              </div>
            </>
          )}
        </div>

        {/* Evolution teaser */}
        {evolvedTo && (
          <div className={styles.evolutionRow}>
            <span className={styles.evoLabel}>Evolves into</span>
            <span className={styles.evoIcon}>{evolvedTo.icon}</span>
            <span className={styles.evoName}>{evolvedTo.name}</span>
            <span className={styles.evoHint}>— solve 2 more related challenges</span>
          </div>
        )}

        {/* CTAs */}
        <div className={styles.ctaRow}>
          <Link href="/codex" className={styles.ctaSecondary} onClick={onClose}>
            View Codex →
          </Link>
          {nextChallengeHref ? (
            <Link href={nextChallengeHref} className={styles.ctaPrimary} onClick={onClose}>
              Next Challenge →
            </Link>
          ) : (
            <Link href="/challenges" className={styles.ctaPrimary} onClick={onClose}>
              More Challenges →
            </Link>
          )}
        </div>

        {/* Codex progress bar */}
        <div className={styles.codexBar}>
          <div className={styles.codexBarFill} style={{ width: `${(capturedCount / TOTAL_CREATURES) * 100}%` }} />
        </div>
        <div className={styles.codexBarLabel}>{capturedCount} / {TOTAL_CREATURES} creatures in your Codex</div>
      </div>
    </div>
  );
}
