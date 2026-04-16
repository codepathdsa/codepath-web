'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './StreakWidget.module.css';

// --- Types --------------------------------------------------------------------

interface StreakMilestone {
  days: number;
  label: string;
  reward: string;
  creature?: string; // creature emoji
  achieved: boolean;
}

interface DayStatus {
  date: Date;
  active: boolean;
  isToday: boolean;
  shielded: boolean; // shield was used this day
}

// --- Milestone Data -----------------------------------------------------------

const MILESTONES: StreakMilestone[] = [
  { days: 7,   label: '7-day Flame',      reward: '+250 XP + Flame Keeper badge',          creature: '🔥', achieved: false },
  { days: 14,  label: '2-week Ember',     reward: '+400 XP + Ember Keeper badge',           creature: '⚡', achieved: false },
  { days: 30,  label: '30-day Inferno',   reward: '+750 XP + Null Gremlin Evolved',         creature: '😈', achieved: false },
  { days: 60,  label: '60-day Phoenix',   reward: '+1,200 XP + Clean Code Phoenix unlocked',creature: '🦅', achieved: false },
  { days: 100, label: '100-day Legend',   reward: '+2,000 XP + Legendary profile flair',    creature: '🏔️', achieved: false },
  { days: 365, label: '365-day Immortal', reward: '+5,000 XP + Hall of Fame + rare creature',creature: '🔮', achieved: false },
];

// --- Mock data — in production this comes from Supabase streak_log ------------

const CURRENT_STREAK = 23;
const LONGEST_STREAK = 31;
const SHIELDS_REMAINING: number = 1; // Pro user: 1 shield/month
const TODAY_DONE = true;     // user already completed a challenge today

// Build last 14 days of activity (true = active, false = missed, 'shield' = shield used)
const buildWeekData = (): DayStatus[] => {
  const days: DayStatus[] = [];
  const now = new Date();

  // Simulate: current streak of 23 days, one shield used day-13
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isToday = i === 0;

    // mock: all 14 days active (streak is 23, so these 14 are all covered)
    // Day 7 ago was a shield day
    const shielded = i === 7;
    days.push({ date, active: true, isToday, shielded });
  }
  return days;
};

// --- Animated flame number ----------------------------------------------------

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    const duration = 800;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(ease(t) * value));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return <>{display}</>;
}

// --- Main Widget --------------------------------------------------------------

export default function StreakWidget() {
  const [expanded, setExpanded] = useState(false);
  const weekDays = buildWeekData();

  // Which milestone are we targeting next?
  const nextMilestone = MILESTONES.find(m => m.days > CURRENT_STREAK) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES.filter(m => m.days <= CURRENT_STREAK).pop();
  const progressToNext = prevMilestone
    ? ((CURRENT_STREAK - prevMilestone.days) / (nextMilestone.days - prevMilestone.days)) * 100
    : (CURRENT_STREAK / nextMilestone.days) * 100;

  const daysToNext = nextMilestone.days - CURRENT_STREAK;

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`${styles.card} ${TODAY_DONE ? styles.done : styles.atRisk}`}>
      {/* -- Flame pulse bg */}
      <div className={styles.flameBg} aria-hidden />

      {/* -- Main row ---------------------------------------------------- */}
      <div className={styles.mainRow}>

        {/* Flame counter */}
        <div className={styles.flameBlock}>
          <div className={styles.flameEmoji} aria-hidden>🔥</div>
          <div className={styles.streakNum}>
            <AnimatedNumber value={CURRENT_STREAK} />
          </div>
          <div className={styles.streakLabel}>day streak</div>
        </div>

        {/* Middle: mini week view */}
        <div className={styles.weekBlock}>
          <div className={styles.weekLabel}>Last 14 days</div>
          <div className={styles.weekDots}>
            {weekDays.map((d, i) => (
              <div
                key={i}
                className={`${styles.dot}
                  ${d.active && !d.shielded ? styles.dotActive : ''}
                  ${d.shielded ? styles.dotShield : ''}
                  ${d.isToday ? styles.dotToday : ''}
                  ${!d.active ? styles.dotMissed : ''}`}
                title={`${d.date.toDateString()}${d.shielded ? ' (Shield used)' : d.active ? ' ✓' : ' ✗'}`}
              >
                {d.shielded && <span className={styles.shieldMark}>🛡</span>}
              </div>
            ))}
          </div>
          <div className={styles.dayLabels}>
            {weekDays.map((d, i) => (
              <span key={i} className={`${styles.dayLabel} ${d.isToday ? styles.dayLabelToday : ''}`}>
                {dayLabels[d.date.getDay()]}
              </span>
            ))}
          </div>
        </div>

        {/* Right: next milestone progress */}
        <div className={styles.milestoneBlock}>
          <div className={styles.milestoneHeader}>
            <span className={styles.milestoneCreature}>{nextMilestone.creature}</span>
            <div>
              <div className={styles.milestoneName}>{nextMilestone.label}</div>
              <div className={styles.milestoneDays}>
                <strong>{daysToNext}</strong> day{daysToNext !== 1 ? 's' : ''} away
              </div>
            </div>
          </div>
          <div className={styles.milestoneTrack}>
            <div
              className={styles.milestoneFill}
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
          <div className={styles.milestoneReward}>{nextMilestone.reward}</div>
        </div>

        {/* Shield + expand toggle */}
        <div className={styles.rightBlock}>
          <div className={`${styles.shieldBadge} ${SHIELDS_REMAINING > 0 ? styles.shieldActive : styles.shieldEmpty}`}>
            🛡 {SHIELDS_REMAINING} shield{SHIELDS_REMAINING !== 1 ? 's' : ''}
          </div>
          {!TODAY_DONE && (
            <div className={styles.atRiskBanner}>
              ⚠ Complete a challenge before midnight to keep your streak
            </div>
          )}
          {TODAY_DONE && (
            <div className={styles.doneBanner}>✓ Streak secured today</div>
          )}
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? 'Collapse milestone view' : 'Expand milestone view'}
          >
            {expanded ? '↑ Less' : '↓ All milestones'}
          </button>
        </div>
      </div>

      {/* -- Expanded milestones panel ----------------------------------- */}
      {expanded && (
        <div className={styles.milestoneList}>
          <div className={styles.milestoneListTitle}>Streak Milestones</div>
          <div className={styles.milestoneItems}>
            {MILESTONES.map((m) => {
              const isPast = CURRENT_STREAK >= m.days;
              const isCurrent = m === nextMilestone;
              const pct = isPast ? 100 : isCurrent ? Math.round(progressToNext) : 0;
              return (
                <div
                  key={m.days}
                  className={`${styles.milestoneItem}
                    ${isPast ? styles.milestonePast : ''}
                    ${isCurrent ? styles.milestoneCurrent : ''}
                    ${!isPast && !isCurrent ? styles.milestoneFuture : ''}`}
                >
                  <div className={styles.milestoneItemIcon}>{m.creature}</div>
                  <div className={styles.milestoneItemBody}>
                    <div className={styles.milestoneItemTop}>
                      <span className={styles.milestoneItemLabel}>{m.label}</span>
                      <span className={styles.milestoneItemDays}>{m.days} days</span>
                    </div>
                    <div className={styles.milestoneItemTrack}>
                      <div className={styles.milestoneItemFill} style={{ width: `${pct}%` }} />
                    </div>
                    <div className={styles.milestoneItemReward}>{m.reward}</div>
                  </div>
                  {isPast && <div className={styles.milestoneCheck}>✓</div>}
                </div>
              );
            })}
          </div>
          <div className={styles.milestoneFooter}>
            <span>Longest streak: <strong>{LONGEST_STREAK} days</strong></span>
            {SHIELDS_REMAINING === 0 && (
              <Link href="/pricing" className={styles.upgradeLink}>
                Get more Streak Shields with Pro →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
