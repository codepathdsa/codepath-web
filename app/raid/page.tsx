'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

// --- Types --------------------------------------------------------------------

interface RaidPhase {
  id: number;
  title: string;
  subtitle: string;
  log: string;      // terminal line seeded for this phase
  duration: number; // seconds this phase lasts in the countdown
}

interface Participant {
  initials: string;
  color: string;
  name: string;
  action: string;
  xp: number;
  solved: boolean;
}

// --- Raid scenario data -------------------------------------------------------

const RAID = {
  id: 'RAID-2026-W15',
  title: 'Global Payment Rail Meltdown',
  subtitle: 'Stripe webhook fan-out collapsed the DB connection pool across 6 regions. $2.4M in revenue blocked.',
  severity: 'P0',
  companies: ['Stripe', 'Shopify', 'Brex'],
  startDate: 'Friday, Apr 18, 2026 · 18:00 UTC',
  endDate: 'Sunday, Apr 20, 2026 · 18:00 UTC',
  xpReward: 1500,
  rareDrop: '💳 Webhook Phantom',   // creature unlocked for solvers
  participants: 847,
  solved: 312,
  timeLeft: { days: 2, hours: 23, mins: 41, secs: 17 },
  solved_pct: 37,
};

const PHASES: RaidPhase[] = [
  {
    id: 1,
    title: 'Alert Triage',
    subtitle: 'Identify the failing service from PagerDuty alerts',
    log: '[PAGERDUTY] P0 — payment-processor latency > 30s · 6 regions affected',
    duration: 180,
  },
  {
    id: 2,
    title: 'Log Investigation',
    subtitle: 'Trace the root cause through distributed logs',
    log: '[FATAL] pgbouncer: pool exhausted — 14,500 / 14,500 connections held',
    duration: 300,
  },
  {
    id: 3,
    title: 'Hypothesis',
    subtitle: 'Form a theory and pick the correct fix',
    log: '[INFO] webhook-dispatcher: fan-out goroutine spawning 1 conn per event (unbounded)',
    duration: 240,
  },
  {
    id: 4,
    title: 'Remediation',
    subtitle: 'Apply the fix and verify recovery',
    log: '[ACTION] Apply semaphore-bounded dispatcher + emergency pgbouncer config reload',
    duration: 120,
  },
];

const OPTIONS = [
  {
    id: 'A',
    title: 'Restart pgbouncer across all regions',
    sub: 'systemctl restart pgbouncer',
    why: 'Symptom treatment — connections are immediately re-exhausted. Buys 30s, not a fix.',
    isCorrect: false,
  },
  {
    id: 'B',
    title: 'Increase max_connections in postgres.conf',
    sub: 'ALTER SYSTEM SET max_connections = 50000;',
    why: 'Wrong layer — this increases DB-side connections, not the pool limit. Crashes Postgres memory.',
    isCorrect: false,
  },
  {
    id: 'C',
    title: 'Rate-limit Stripe webhook ingestion to 50 RPS',
    sub: 'nginx rate_limit_zone webhook 50r/s',
    why: 'Reduces fan-out pressure but drops legitimate webhooks. Revenue impact continues.',
    isCorrect: false,
  },
  {
    id: 'D',
    title: 'Apply semaphore-bounded dispatcher + pgbouncer reload',
    sub: 'patch: semaphore(maxConcurrent=200) + pgbouncer pool_size=200',
    why: 'Correct — caps goroutine fan-out at 200, matches pgbouncer pool size. Recovery in <2 min.',
    isCorrect: true,
  },
];

const LIVE_PARTICIPANTS: Participant[] = [
  { initials: 'SG', color: '#8b5cf6', name: 'Siddharth G.',    action: 'solved the raid',          xp: 1500, solved: true },
  { initials: 'PR', color: '#ef4444', name: 'Priya R.',         action: 'in Phase 3',               xp: 0,    solved: false },
  { initials: 'AK', color: '#3b82f6', name: 'Alex K.',          action: 'solved the raid',          xp: 1500, solved: true },
  { initials: 'MN', color: '#10b981', name: 'Marina N.',        action: 'in Phase 2',               xp: 0,    solved: false },
  { initials: 'OS', color: '#f97316', name: 'Omar S.',          action: 'solved the raid',          xp: 1500, solved: true },
  { initials: 'CL', color: '#06b6d4', name: 'Chen L.',          action: 'just joined',              xp: 0,    solved: false },
  { initials: 'FA', color: '#ec4899', name: 'Fatima A.',        action: 'in Phase 4',               xp: 0,    solved: false },
  { initials: 'VP', color: '#62de61', name: 'Venkateshwaran P.', action: 'reviewing logs…',         xp: 0,    solved: false },
];

// --- Helpers ------------------------------------------------------------------

function pad(n: number) { return String(n).padStart(2, '0'); }

function useCountdown(initial: { days: number; hours: number; mins: number; secs: number }) {
  const [t, setT] = useState(initial);

  useEffect(() => {
    const id = setInterval(() => {
      setT(prev => {
        let { days, hours, mins, secs } = prev;
        secs--;
        if (secs < 0) { secs = 59; mins--; }
        if (mins < 0) { mins = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return t;
}

// --- Terminal log stream ------------------------------------------------------

const STREAM_LOGS = [
  { text: '[PAGERDUTY] P0 FIRING — payment-processor · region: us-east-1, eu-west-1, ap-southeast-1', type: 'error' },
  { text: '[DATADOG] latency p99 = 34,212ms (threshold: 500ms)', type: 'warning' },
  { text: '[FATAL] pgbouncer[us-east]: pool exhausted 14500/14500', type: 'error' },
  { text: '[FATAL] pgbouncer[eu-west]: pool exhausted 14500/14500', type: 'error' },
  { text: '[ERROR] webhook-dispatcher: context deadline exceeded after 30000ms', type: 'error' },
  { text: '[ERROR] order-service: failed to acquire db connection (attempt 1/3)', type: 'error' },
  { text: '[ERROR] order-service: failed to acquire db connection (attempt 2/3)', type: 'error' },
  { text: '[ERROR] order-service: failed to acquire db connection (attempt 3/3) — giving up', type: 'error' },
  { text: '[WARN]  stripe-ingest: received 14,832 webhook events in 60s window (normal: ~200)', type: 'warning' },
  { text: '[INFO]  webhook-dispatcher: spawning goroutine per event — no concurrency limit configured', type: 'normal' },
  { text: '[DEBUG] goroutine count: 14,201 (threshold: 1,000)', type: 'warning' },
  { text: '[ERROR] prometheus-scrape: target payment-processor unhealthy', type: 'error' },
  { text: '[WARN]  load-balancer: removing unhealthy backend payment-processor-3', type: 'warning' },
  { text: '[FATAL] payment-processor-3: OOM killed — goroutine stack overflow', type: 'error' },
  { text: 'Type "help" for investigation commands — or jump straight to hypotheses below.', type: 'system' },
];

type LogType = 'error' | 'warning' | 'normal' | 'system' | 'success';
interface LogLine { text: string; type: LogType; }

// --- Main Page ----------------------------------------------------------------

export default function RaidPage() {
  const countdown = useCountdown(RAID.timeLeft);
  const isExpired = countdown.days === 0 && countdown.hours === 0 && countdown.mins === 0 && countdown.secs === 0;

  // Terminal state
  const [logs, setLogs] = useState<LogLine[]>([
    { text: '[SYSTEM] Weekly Raid initialized — scenario: Global Payment Rail Meltdown', type: 'system' },
    { text: '[SYSTEM] 847 engineers actively investigating. Good luck.', type: 'system' },
  ]);
  const [cmdInput, setCmdInput] = useState('');
  const termRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [currentPhase, setCurrentPhase] = useState(0);   // 0-indexed into PHASES
  const [phasesDone, setPhasesDone] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [raidSolved, setRaidSolved] = useState(false);
  const [revealedExplanations, setRevealedExplanations] = useState<string[]>([]);

  // Stream logs on mount
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < STREAM_LOGS.length) {
        const entry = STREAM_LOGS[i];
        setLogs(prev => [...prev, { text: entry.text, type: entry.type as LogType }]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 380);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [logs]);

  // Terminal command handler
  const handleCmd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const cmd = cmdInput.trim().toLowerCase();
    setCmdInput('');

    const responses: Record<string, LogLine[]> = {
      help: [
        { text: 'Available commands:', type: 'system' },
        { text: '  db status     — check pgbouncer connection pool', type: 'normal' },
        { text: '  metrics       — show live p99 latency and error rate', type: 'normal' },
        { text: '  goroutines    — inspect goroutine count', type: 'normal' },
        { text: '  webhook stats — show recent webhook volume', type: 'normal' },
        { text: '  clear         — clear terminal', type: 'normal' },
      ],
      'db status': [
        { text: '$ pgbouncer-console -c "show pools"', type: 'normal' },
        { text: '  database=payment-processor pool_size=14500 used=14500 free=0 waiting=8432', type: 'error' },
      ],
      metrics: [
        { text: '$ curl https://metrics.internal/payment-processor/summary', type: 'normal' },
        { text: '  p50_ms=28440  p99_ms=34212  error_rate=62.4%  rps=3201', type: 'error' },
      ],
      goroutines: [
        { text: '$ dlv attach $(pgrep webhook-dispatcher) — goroutines', type: 'normal' },
        { text: '  active goroutines: 14,201  (limit: none configured)', type: 'error' },
        { text: '  top offender: db.(*Pool).Acquire blocked for avg 28s', type: 'warning' },
      ],
      'webhook stats': [
        { text: '$ kafka-consumer-groups.sh --describe --group stripe-ingest', type: 'normal' },
        { text: '  topic=webhooks  partition=0  offset=1,441,932  lag=14,832', type: 'warning' },
      ],
      clear: 'CLEAR' as unknown as LogLine[],
    };

    setLogs(prev => [...prev, { text: `$ ${cmdInput.trim() || cmd}`, type: 'normal' }]);

    if (cmd === 'clear') {
      setLogs([{ text: 'Terminal cleared.', type: 'system' }]);
      return;
    }

    const res = responses[cmd];
    if (res) {
      setLogs(prev => [...prev, ...res]);
    } else {
      setLogs(prev => [...prev, { text: `command not found: ${cmd} — type "help" for commands`, type: 'warning' }]);
    }
  };

  const advancePhase = () => {
    if (currentPhase < PHASES.length - 1) {
      const phase = PHASES[currentPhase];
      setPhasesDone(prev => [...prev, phase.id]);
      setLogs(prev => [...prev, { text: phase.log, type: 'normal' }]);
      setCurrentPhase(p => p + 1);
    }
  };

  const handleOptionClick = (optId: string) => {
    if (result) return; // already answered
    const selected = OPTIONS.find(o => o.id === optId)!;
    setSelectedOption(optId);
    if (selected.isCorrect) {
      setResult('correct');
      setLogs(prev => [
        ...prev,
        { text: '[ACTION] Semaphore patch deployed. Goroutine count: 14,201 → 198', type: 'success' },
        { text: '[ACTION] pgbouncer config reloaded. Pool: 200/200 free', type: 'success' },
        { text: '[RECOVERY] p99 latency: 34,212ms → 312ms', type: 'success' },
        { text: '[RESOLVED] Incident closed. MTTR: 3m 42s. Revenue unblocked.', type: 'success' },
      ]);
      setRaidSolved(true);
    } else {
      setResult('wrong');
      setLogs(prev => [...prev, { text: `[ERROR] Action failed — ${selected.why}`, type: 'error' }]);
    }
  };

  const toggleExplanation = (id: string) => {
    setRevealedExplanations(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const phase = PHASES[currentPhase];

  return (
    <div className={styles.layout}>
      {/* -- Nav ----------------------------------------------------------- */}
      <AppNav />

      {/* -- Alert banner --------------------------------------------------- */}
      <div className={styles.alertBanner}>
        <span className={styles.alertDot} />
        <span className={styles.alertText}>
          <strong>P0 ACTIVE</strong> — Global Payment Rail Meltdown · {RAID.participants.toLocaleString()} engineers responding
        </span>
        <div className={styles.alertCountdown}>
          Raid ends in: <strong>{countdown.days}d {pad(countdown.hours)}h {pad(countdown.mins)}m {pad(countdown.secs)}s</strong>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.grid}>

          {/* -- LEFT: Scenario + Terminal ------------------------------- */}
          <div className={styles.leftCol}>

            {/* Scenario header */}
            <div className={styles.scenarioCard}>
              <div className={styles.scenarioHead}>
                <div className={styles.scenarioBadges}>
                  <span className={styles.severityBadge}>🔴 {RAID.severity}</span>
                  <span className={styles.raidIdBadge}>{RAID.id}</span>
                  {RAID.companies.map(c => (
                    <span key={c} className={styles.companyTag}>{c}</span>
                  ))}
                </div>
                <div className={styles.scenarioReward}>
                  +{RAID.xpReward.toLocaleString()} XP + {RAID.rareDrop}
                </div>
              </div>
              <h1 className={styles.scenarioTitle}>{RAID.title}</h1>
              <p className={styles.scenarioDesc}>{RAID.subtitle}</p>
              <div className={styles.progressBarWrap}>
                <div className={styles.progressBarLabel}>
                  Global solve rate
                  <span>{RAID.solved}/{RAID.participants} engineers · {RAID.solved_pct}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${RAID.solved_pct}%` }} />
                </div>
              </div>
            </div>

            {/* Phase stepper */}
            <div className={styles.stepper}>
              {PHASES.map((p, i) => {
                const isDone = phasesDone.includes(p.id);
                const isCurrent = i === currentPhase && !raidSolved;
                const isLocked = i > currentPhase && !raidSolved;
                return (
                  <div key={p.id} className={`${styles.stepItem} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''} ${isLocked ? styles.stepLocked : ''}`}>
                    <div className={styles.stepDot}>
                      {isDone ? '✓' : <span>{p.id}</span>}
                    </div>
                    {i < PHASES.length - 1 && <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />}
                    <div className={styles.stepLabel}>{p.title}</div>
                  </div>
                );
              })}
              {raidSolved && (
                <div className={`${styles.stepItem} ${styles.stepDone}`}>
                  <div className={styles.stepDot}>✓</div>
                  <div className={styles.stepLabel}>Resolved</div>
                </div>
              )}
            </div>

            {/* Terminal */}
            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <span className={styles.termDot} style={{ background: '#ef4444' }} />
                <span className={styles.termDot} style={{ background: '#f59e0b' }} />
                <span className={styles.termDot} style={{ background: '#62de61' }} />
                <span className={styles.termTitle}>incident-terminal — {RAID.title}</span>
                <span className={styles.termLive}>⬤ LIVE</span>
              </div>
              <div className={styles.terminalBody} ref={termRef}>
                {logs.map((line, i) => (
                  <div key={i} className={`${styles.logLine} ${styles[`log_${line.type}`]}`}>
                    <span className={styles.logText}>{line.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.terminalInput}>
                <span className={styles.termPrompt}>$</span>
                <input
                  className={styles.termInputField}
                  value={cmdInput}
                  onChange={e => setCmdInput(e.target.value)}
                  onKeyDown={handleCmd}
                  placeholder="type a command (try 'help')"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* -- RIGHT: Phase + Options ---------------------------------- */}
          <div className={styles.rightCol}>

            {/* Current phase card */}
            {!raidSolved && (
              <div className={styles.phaseCard}>
                <div className={styles.phaseNum}>Phase {phase.id} of {PHASES.length}</div>
                <div className={styles.phaseTitle}>{phase.title}</div>
                <div className={styles.phaseSub}>{phase.subtitle}</div>

                {currentPhase < PHASES.length - 1 && (
                  <button className={styles.phaseAdvance} onClick={advancePhase}>
                    Advance to Phase {currentPhase + 2}: {PHASES[currentPhase + 1].title} →
                  </button>
                )}
              </div>
            )}

            {/* Final question / options */}
            {currentPhase === PHASES.length - 1 && !raidSolved && (
              <div className={styles.optionsCard}>
                <div className={styles.optionsTitle}>
                  🚨 Choose your remediation action
                  <span className={styles.optionsTip}>Only one fix will restore service</span>
                </div>
                <div className={styles.optionsList}>
                  {OPTIONS.map(opt => {
                    const isSelected = selectedOption === opt.id;
                    const showResult = result !== null && isSelected;
                    const isRevealed = revealedExplanations.includes(opt.id);
                    return (
                      <div key={opt.id} className={`${styles.option}
                        ${isSelected && result === 'correct' ? styles.optionCorrect : ''}
                        ${isSelected && result === 'wrong' ? styles.optionWrong : ''}
                        ${result && !isSelected ? styles.optionDimmed : ''}`}
                      >
                        <button
                          className={styles.optionBtn}
                          onClick={() => handleOptionClick(opt.id)}
                          disabled={result !== null}
                        >
                          <span className={styles.optionLabel}>{opt.id}</span>
                          <div className={styles.optionBody}>
                            <div className={styles.optionTitle}>{opt.title}</div>
                            <div className={styles.optionSub}>{opt.sub}</div>
                          </div>
                          {showResult && (
                            <span className={result === 'correct' ? styles.optionCheck : styles.optionX}>
                              {result === 'correct' ? '✓' : '✗'}
                            </span>
                          )}
                        </button>
                        {/* Show "why" after answer */}
                        {result && (
                          <button className={styles.whyToggle} onClick={() => toggleExplanation(opt.id)}>
                            {isRevealed ? '▲ hide' : '▼ why?'}
                          </button>
                        )}
                        {result && isRevealed && (
                          <div className={styles.whyText}>{opt.why}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Solved state */}
            {raidSolved && (
              <div className={styles.solvedCard}>
                <div className={styles.solvedGlow} />
                <div className={styles.solvedIcon}>⚔</div>
                <div className={styles.solvedTitle}>Raid Survived</div>
                <div className={styles.solvedSub}>MTTR: 3m 42s · You responded to a global P0 payment outage.</div>
                <div className={styles.solvedRewards}>
                  <div className={styles.solvedRewardRow}>
                    <span className={styles.solvedXP}>+{RAID.xpReward.toLocaleString()} XP</span>
                    <span className={styles.solvedBadge}>Global P0 Responder</span>
                  </div>
                  <div className={styles.solvedCreature}>
                    {RAID.rareDrop} unlocked in your Codex
                  </div>
                </div>
                <div className={styles.solvedActions}>
                  <Link href="/leaderboard" className={styles.solvedCta}>View Leaderboard →</Link>
                  <Link href="/codex" className={styles.solvedSecondary}>Open Codex →</Link>
                </div>
              </div>
            )}

            {/* Live participants feed */}
            <div className={styles.participantsCard}>
              <div className={styles.participantsTitle}>
                Live Participants
                <span className={styles.participantsCount}>{RAID.participants.toLocaleString()} engineers</span>
              </div>
              <div className={styles.participantsList}>
                {LIVE_PARTICIPANTS.map((p, i) => (
                  <div key={i} className={`${styles.participant} ${p.solved ? styles.participantSolved : ''}`}>
                    <div className={styles.participantAvatar} style={{ background: p.color }}>
                      {p.initials}
                    </div>
                    <div className={styles.participantInfo}>
                      <div className={styles.participantName}>{p.name}</div>
                      <div className={`${styles.participantAction} ${p.solved ? styles.participantActionSolved : ''}`}>
                        {p.solved ? `✓ solved · +${p.xp} XP` : p.action}
                      </div>
                    </div>
                    {p.solved && <div className={styles.participantSolvedBadge}>⚔</div>}
                  </div>
                ))}
              </div>
              <div className={styles.participantsFooter}>
                + {(RAID.participants - LIVE_PARTICIPANTS.length).toLocaleString()} more engineers investigating
              </div>
            </div>

            {/* Upcoming raid */}
            <div className={styles.upcomingCard}>
              <div className={styles.upcomingLabel}>Next Raid</div>
              <div className={styles.upcomingTitle}>CDN Cache Stampede · Cloudflare Global</div>
              <div className={styles.upcomingDate}>Friday, Apr 25, 2026 · 18:00 UTC</div>
              <div className={styles.upcomingReward}>+1,200 XP · 🌩 Thunder Cache creature</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
