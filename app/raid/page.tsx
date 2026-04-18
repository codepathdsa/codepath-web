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
  id: 'RAID-2026-W16',
  title: 'Checkout Meltdown: Redis Cache at 31%',
  subtitle: 'Redis maxmemory-policy set to noeviction — cache writes failing with OOM. Checkout sessions bypass Redis, hammering Postgres. DB CPU at 98%. $181k/min in blocked revenue.',
  severity: 'P0',
  companies: ['Shopify', 'Stripe', 'Amazon'],
  startDate: 'Friday, Apr 18, 2026 · 18:00 UTC',
  endDate: 'Sunday, Apr 20, 2026 · 18:00 UTC',
  xpReward: 1500,
  rareDrop: '🔑 Cache Phantom',
  participants: 1203,
  solved: 447,
  timeLeft: { days: 1, hours: 23, mins: 41, secs: 17 },
  solved_pct: 37,
};

const PHASES: RaidPhase[] = [
  {
    id: 1,
    title: 'Alert Triage',
    subtitle: 'Identify the failing service from PagerDuty alerts',
    log: '[PAGERDUTY] P0 — checkout-service latency > 12s · region: us-east-1, eu-west-1',
    duration: 180,
  },
  {
    id: 2,
    title: 'Cache Analysis',
    subtitle: 'Investigate why Redis cache hit rate dropped from 95% to 31%',
    log: '[WARN] redis-proxy: hit_rate=31.2% (was 95.4% 2h ago) · OOM errors=1,204/s',
    duration: 300,
  },
  {
    id: 3,
    title: 'Root Cause',
    subtitle: 'Identify the Redis maxmemory misconfiguration',
    log: '[INFO] redis-config: maxmemory=8GB maxmemory_policy=noeviction · used_memory=8192MB (100%)',
    duration: 240,
  },
  {
    id: 4,
    title: 'Remediation',
    subtitle: 'Apply the fix and verify cache recovery',
    log: '[ACTION] Set maxmemory-policy allkeys-lru + reduce session TTL 86400s → 7200s',
    duration: 120,
  },
];

const OPTIONS = [
  {
    id: 'A',
    title: 'FLUSHALL — clear all Redis keys immediately',
    sub: 'redis-cli FLUSHALL',
    why: 'Catastrophic — clears every cached object. Cache hit rate drops to 0% for the next 20-30 minutes, making the Postgres overload far worse.',
    isCorrect: false,
  },
  {
    id: 'B',
    title: 'Scale Postgres to 32 CPUs + add 2 read replicas',
    sub: 'aws rds modify-db-instance --db-instance-class db.r6g.8xlarge',
    why: 'Treats the symptom, not the cause. Takes 15 min to apply. Redis still returns OOM — checkout still bypasses cache and hammers DB.',
    isCorrect: false,
  },
  {
    id: 'C',
    title: 'Increase Redis maxmemory from 8 GB to 64 GB',
    sub: 'redis-cli CONFIG SET maxmemory 64gb',
    why: 'Buys temporary relief, but 42M session keys at 24h TTL will refill 64 GB in ~8 hours. The underlying policy is unchanged — OOM recurs.',
    isCorrect: false,
  },
  {
    id: 'D',
    title: 'allkeys-lru policy + reduce session TTL to 2h',
    sub: 'CONFIG SET maxmemory-policy allkeys-lru; UPDATE sessions SET ttl=7200',
    why: 'Correct — allkeys-lru evicts the least recently used keys instead of returning OOM. TTL reduction shrinks 42M keys → ~3.5M. Cache hit rate recovers to 94% within 4 min.',
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
  { text: '[PAGERDUTY] P0 FIRING — checkout-service · region: us-east-1, eu-west-1', type: 'error' },
  { text: '[DATADOG] checkout p99_latency = 12,440ms (SLA: 200ms)', type: 'warning' },
  { text: '[DATADOG] checkout_error_rate = 61.3% (last 5 min)', type: 'error' },
  { text: '[ERROR] checkout-service: redis.SET failed — OOM command not allowed when used memory > maxmemory', type: 'error' },
  { text: '[ERROR] checkout-service: redis.GET miss — falling through to postgres (cache bypass)', type: 'warning' },
  { text: '[WARN]  redis-proxy: cache hit_rate = 31.2% (was 95.4% 2h ago)', type: 'warning' },
  { text: '[FATAL] postgres-main: connection pool exhausted 500/500', type: 'error' },
  { text: '[FATAL] postgres-main: CPU at 98% — I/O saturation on checkout_sessions table', type: 'error' },
  { text: '[ERROR] checkout-service: DB query timed out after 10,000ms', type: 'error' },
  { text: '[INFO]  redis INFO memory: used_memory=8192MB maxmemory=8192MB maxmemory_policy=noeviction', type: 'normal' },
  { text: '[INFO]  redis INFO stats: evicted_keys=0 — noeviction policy refuses to evict, returns OOM', type: 'warning' },
  { text: '[WARN]  redis-keyspace: checkout:session:* = 42,017,334 keys · avg TTL=86,340s (24h)', type: 'warning' },
  { text: '[ALERT] revenue-impact: $181,200/min blocked · 47,220 failed checkouts in last 60s', type: 'error' },
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
        { text: '  redis info    — memory usage and maxmemory policy', type: 'normal' },
        { text: '  cache stats   — cache hit/miss rate over time', type: 'normal' },
        { text: '  db status     — postgres CPU, connections, wait events', type: 'normal' },
        { text: '  redis keys    — key count, TTL distribution, memory size', type: 'normal' },
        { text: '  clear         — clear terminal', type: 'normal' },
      ],
      'redis info': [
        { text: '$ redis-cli INFO memory', type: 'normal' },
        { text: '  used_memory_human: 8.00G', type: 'error' },
        { text: '  maxmemory_human: 8.00G', type: 'error' },
        { text: '  maxmemory_policy: noeviction', type: 'error' },
        { text: '  mem_fragmentation_ratio: 1.02', type: 'normal' },
      ],
      'cache stats': [
        { text: '$ redis-cli INFO stats | grep hit', type: 'normal' },
        { text: '  keyspace_hits: 1,204,441   keyspace_misses: 2,802,109', type: 'warning' },
        { text: '  hit_rate: 30.0h ago=95.4% · 1h ago=72.1% · now=31.2%', type: 'error' },
        { text: '  evicted_keys: 0  (noeviction — no evictions, OOM errors instead)', type: 'error' },
      ],
      'db status': [
        { text: '$ psql -c "SELECT count(*), wait_event FROM pg_stat_activity GROUP BY wait_event"', type: 'normal' },
        { text: '  count=500  wait_event=Client (connection pool exhausted)', type: 'error' },
        { text: '  postgres CPU: 98.1%  I/O util: 99.7%  (checkout_sessions table full scan)', type: 'error' },
      ],
      'redis keys': [
        { text: '$ redis-cli --scan --pattern "checkout:session:*" | wc -l', type: 'normal' },
        { text: '  42,017,334 keys  avg_ttl=86,340s (23h 59m)  avg_size=190 bytes', type: 'warning' },
        { text: '  total_size: ~7.6 GB (95% of maxmemory)', type: 'error' },
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
        { text: '[ACTION] maxmemory-policy changed: noeviction → allkeys-lru', type: 'success' },
        { text: '[ACTION] Session TTL updated: 86400s → 7200s. LRU eviction starting...', type: 'success' },
        { text: '[RECOVERY] Redis evicting stale sessions... used_memory: 8192MB → 4,104MB', type: 'success' },
        { text: '[RECOVERY] cache hit_rate: 31.2% → 94.1% · Postgres CPU: 98% → 22%', type: 'success' },
        { text: '[RESOLVED] Checkout nominal. MTTR: 4m 17s. Revenue unblocked.', type: 'success' },
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
          <strong>P0 ACTIVE</strong> — {RAID.title} · {RAID.participants.toLocaleString()} engineers responding
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
                <div className={styles.solvedSub}>MTTR: 4m 17s · You diagnosed a Redis cache meltdown and restored checkout.</div>
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
              <div className={styles.upcomingTitle}>Database Hot Shard · Snowflake User Analytics</div>
              <div className={styles.upcomingDate}>Friday, Apr 25, 2026 · 18:00 UTC</div>
              <div className={styles.upcomingReward}>+1,400 XP · 🧊 Shard Specter creature</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
