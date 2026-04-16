'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { CHALLENGES, ChallengeOption } from '@/lib/challenges';
import CaptureOverlay from '@/app/components/CaptureOverlay';

interface LogLine {
  text: string;
  type: 'system' | 'normal' | 'warning' | 'error' | 'success';
}

const LOG_CLASS: Record<LogLine['type'], string> = {
  system:  styles.logSystem,
  normal:  styles.logNormal,
  warning: styles.logWarning,
  error:   styles.logError,
  success: styles.logSuccess,
};

// Generic investigation commands — applicable to any incident
const COMMANDS: Record<string, { response: string; type: LogLine['type'] }> = {
  'help':             { response: 'Available: top | kubectl get pods | tail syslog | check-deploy | netstat | df -h', type: 'normal' },
  'top':              { response: 'PID  USER     %CPU %MEM     TIME+ COMMAND\n   1 node     99.8 12.4  1:42.33 node index.js\n  42 postgres  0.1  2.1  0:00.12 postgres: autovacuum', type: 'normal' },
  'kubectl get pods': { response: 'NAME                           READY   STATUS             RESTARTS   AGE\napi-7f8d9b-x2z9a               0/1     CrashLoopBackOff   14         8m\napi-7f8d9b-p9q1r               0/1     CrashLoopBackOff   13         8m\ncache-master-0                 1/1     Running            0          14d', type: 'error' },
  'tail syslog':      { response: '[CRIT]  node: uncaught exception — ECONNREFUSED db:5432\n[ERROR] pm2: restarting app (crash #14)\n[ERROR] kernel: TCP out of memory — consider tuning tcp_mem\n[WARN]  healthcheck: /health returned 503 (3/3 pods)', type: 'error' },
  'check-deploy':     { response: 'Latest:   v2.4.1 — deployed 6 min ago\nStatus:   DEGRADED (health probe failing — exit 1 on all pods)\nPrevious: v2.4.0 — last stable', type: 'warning' },
  'netstat':          { response: 'tcp  0.0.0.0:5432  LISTEN   (postgres)\ntcp  0.0.0.0:6379  LISTEN   (redis)\nWARN: 14 492 established conns on :5432  (max_connections = 15 000)', type: 'warning' },
  'df -h':            { response: 'Filesystem  Size  Used  Avail Use%  Mounted on\n/dev/sda1   100G   98G    2G   98%  /\nCRIT: disk usage at 98% — /var/log filling fast', type: 'error' },
};

const LIVE_LOG_POOL: LogLine[] = [
  { text: '[WARN]  system: threshold anomaly in active traces', type: 'warning' },
  { text: '[ERROR] metrics_daemon: dropped spans — buffer saturation', type: 'error' },
  { text: '[ERROR] api_gateway: upstream latency 2 450 ms', type: 'error' },
  { text: '[WARN]  health_check: readiness probe >2 000 ms', type: 'warning' },
  { text: '[ERROR] db_pool: waiting for slot (14 492 / 15 000)', type: 'error' },
  { text: '[WARN]  rate_limiter: 5xx spike on /api/v2/users', type: 'warning' },
  { text: '[ERROR] node: FATAL — uncaught rejection, restarting', type: 'error' },
];

export default function WarRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Support full-id slug (ENG-WAR-001) and numeric slug (001)
  const challenge = CHALLENGES.find(c => c.id === id)
    ?? CHALLENGES.find(c => c.id === `ENG-WAR-${id}`);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  // Metrics
  const [cpu,       setCpu]       = useState(99.2);
  const [latency,   setLatency]   = useState(2450);
  const [errorRate, setErrorRate] = useState(12.4);
  const [dbConns,   setDbConns]   = useState(14492);

  // Terminal
  const [cmdInput, setCmdInput] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([
    { text: '[SYSTEM] War-Room terminal initialised. Bastion host connection established.', type: 'system' },
    { text: `[SYSTEM] Active incident: ${challenge?.title ?? id}`, type: 'system' },
    { text: '[SYSTEM] Type "help" for a list of investigation commands.', type: 'normal' },
  ]);

  // UI state
  const [result,        setResult]        = useState<'success' | 'fail' | null>(null);
  const [isResolved,    setIsResolved]    = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [timeLeft,      setTimeLeft]      = useState(900);
  const [showCapture,   setShowCapture]   = useState(false);

  const resolvedTime = 900 - timeLeft;

  const appendLog = (text: string, type: LogLine['type'] = 'normal') =>
    setLogs(prev => [...prev, { text, type }]);

  // Live metric jitter + log stream
  useEffect(() => {
    if (isResolved) return;
    const metricId = setInterval(() => {
      setCpu(p       => Math.min(100,   Math.max(90,    p + (Math.random() * 4 - 2))));
      setLatency(p   => Math.max(1000,  p + (Math.random() * 200 - 100)));
      setErrorRate(p => Math.max(5,     p + (Math.random() * 1.5 - 0.75)));
      setDbConns(p   => Math.min(15000, Math.max(14000, p + Math.floor(Math.random() * 100 - 50))));
    }, 1500);
    const logId = setInterval(() => {
      const entry = LIVE_LOG_POOL[Math.floor(Math.random() * LIVE_LOG_POOL.length)];
      appendLog(entry.text, entry.type);
    }, 2500);
    return () => { clearInterval(metricId); clearInterval(logId); };
  }, [isResolved]);

  // Countdown
  useEffect(() => {
    if (isResolved || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isResolved, timeLeft]);

  // Autoscroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const cmd = cmdInput.trim().toLowerCase();
    setCmdInput('');
    if (!cmd) return;
    appendLog(`$ ${cmd}`, 'system');
    setTimeout(() => {
      const hit = Object.entries(COMMANDS).find(([k]) => k === cmd);
      if (hit) appendLog(hit[1].response, hit[1].type);
      else appendLog(`bash: ${cmd}: command not found`, 'error');
    }, 280);
  };

  const resetState = () => {
    setResult(null);
    setIsResolved(false);
    setSelectedLabel(null);
    setTimeLeft(900);
    setCpu(99.2);
    setLatency(2450);
    setErrorRate(12.4);
    setDbConns(14492);
    setLogs([
      { text: '[SYSTEM] War-Room terminal reinitialised.', type: 'system' },
      { text: `[SYSTEM] Active incident: ${challenge?.title ?? id}`, type: 'system' },
      { text: '[SYSTEM] Type "help" for investigation commands.', type: 'normal' },
    ]);
  };

  const executeRemediation = (opt: ChallengeOption) => {
    if (isResolved) return;
    setSelectedLabel(opt.label);
    setIsResolved(true);
    appendLog(`[SYSTEM] Executing: ${opt.sub}`, 'system');
    if (opt.isCorrect) {
      setTimeout(() => {
        appendLog('[SUCCESS] Fix applied. Metrics recovering — returning to nominal.', 'success');
        setCpu(18); setLatency(85); setErrorRate(0.1); setDbConns(210);
        setResult('success');
        setTimeout(() => setShowCapture(true), 1200);
      }, 1500);
    } else {
      setTimeout(() => {
        appendLog('[FATAL] Wrong remediation. Cascade failure triggered — full outage.', 'error');
        setCpu(100); setLatency(9999); setErrorRate(100); setDbConns(15000);
        setResult('fail');
      }, 1500);
    }
  };

  // Not found — after all hooks
  if (!challenge) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '28px' }}>🚧</div>
        <div style={{ fontSize: '13px', color: '#52525b' }}>
          No challenge found for <code style={{ background: '#18181b', padding: '2px 6px', borderRadius: '4px', color: '#71717a' }}>{id}</code>.
        </div>
        <Link href="/challenges" style={{ fontSize: '12px', color: '#3f3f46', textDecoration: 'underline' }}>← Back to Challenges</Link>
      </div>
    );
  }

  const options = challenge.options ?? [];

  return (
    <div className={styles.layout}>
      {showCapture && (
        <CaptureOverlay
          challengeId={challenge.id}
          timeTakenSeconds={resolvedTime}
          isPerfectRun={resolvedTime < 300}
          onClose={() => setShowCapture(false)}
        />
      )}

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/challenges" className={styles.backBtn}>←</Link>
          <div className={styles.divider} />
          <div className={styles.alertDot} />
          <span className={styles.incidentBadge}>P0 INCIDENT</span>
          <span className={styles.incidentTitle}>{challenge.title}</span>
          <span className={styles.incidentId}>#{challenge.id}</span>
          {challenge.companies.map(c => (
            <span key={c} className={styles.companyBadge}>{c}</span>
          ))}
        </div>
        <div className={styles.topRight}>
          <span className={styles.levelBadge}>{challenge.level}</span>
          <span className={styles.levelBadge}>{challenge.timeEst}</span>
          <span className={`${styles.timer} ${timeLeft < 300 && !isResolved ? styles.timerCritical : ''}`}>
            {fmt(timeLeft)}
          </span>
        </div>
      </div>

      {/* TELEMETRY STRIP */}
      <div className={styles.telemetryStrip}>
        <div className={`${styles.metric} ${cpu > 95 ? styles.metricDanger : ''}`}>
          <span className={styles.metricLabel}>API CPU Usage</span>
          <span className={styles.metricValue}>{cpu.toFixed(1)}%</span>
          <span className={styles.metricTrend}>↑ 42%</span>
        </div>
        <div className={`${styles.metric} ${latency > 2000 ? styles.metricDanger : ''}`}>
          <span className={styles.metricLabel}>P99 Latency</span>
          <span className={styles.metricValue}>{latency >= 9999 ? '∞' : latency.toFixed(0)} ms</span>
          <span className={styles.metricTrend}>↑ 400%</span>
        </div>
        <div className={`${styles.metric} ${errorRate > 5 ? styles.metricDanger : ''}`}>
          <span className={styles.metricLabel}>5xx Error Rate</span>
          <span className={styles.metricValue}>{errorRate.toFixed(1)}%</span>
          <span className={styles.metricTrend}>↑ 12%</span>
        </div>
        <div className={`${styles.metric} ${dbConns > 10000 ? styles.metricDanger : ''}`}>
          <span className={styles.metricLabel}>DB Connections</span>
          <span className={styles.metricValue}>{dbConns.toLocaleString()}</span>
          <span className={styles.metricTrend}>↑ 800%</span>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className={styles.workspace}>

        {/* TERMINAL */}
        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span className={styles.termDot} style={{ background: '#ef4444' }} />
            <span className={styles.termDot} style={{ background: '#f59e0b' }} />
            <span className={styles.termDot} style={{ background: '#22c55e' }} />
            <span className={styles.termTitle}>bastion-prod-1.internal — bash</span>
          </div>
          <div className={styles.terminalBody}>
            {logs.map((log, i) => (
              <div key={i} className={`${styles.logLine} ${LOG_CLASS[log.type]}`}>
                {log.text}
              </div>
            ))}
            {!isResolved && (
              <div className={styles.termInputRow}>
                <span className={styles.termPrompt}>user@bastion:~$</span>
                <input
                  type="text"
                  className={styles.termInput}
                  autoFocus
                  value={cmdInput}
                  onChange={e => setCmdInput(e.target.value)}
                  onKeyDown={handleCommand}
                  spellCheck={false}
                  placeholder="type a command…"
                />
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* REMEDIATION PANEL */}
        <div className={styles.remediation}>
          <div className={styles.remHeader}>
            <span className={styles.remTitle}>Execute Remediation</span>
            <span className={styles.warnBadge}>⚠ PROD</span>
          </div>
          <div className={styles.remDesc}>
            {challenge.desc}
            <br /><br />
            <strong>What is your first action?</strong>
          </div>
          <div className={styles.actionList}>
            {options.map(opt => (
              <button
                key={opt.label}
                className={`${styles.actionBtn} ${
                  selectedLabel === opt.label
                    ? opt.isCorrect ? styles.actionCorrect : styles.actionWrong
                    : ''
                }`}
                onClick={() => executeRemediation(opt)}
                disabled={isResolved}
              >
                <span className={styles.actionLabel}>{opt.label}</span>
                <div className={styles.actionBody}>
                  <div className={styles.actionTitle}>{opt.title}</div>
                  <div className={styles.actionSub}>{opt.sub}</div>
                </div>
                <span className={styles.actionArrow}>→</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RESULT OVERLAY */}
      {result && (
        <div className={styles.resultOverlay}>
          <div className={`${styles.resultCard} ${result === 'success' ? styles.successCard : styles.failCard}`}>
            <div className={`${styles.resultIcon} ${result === 'success' ? styles.successIcon : styles.failIcon}`}>
              {result === 'success' ? '✓' : '✕'}
            </div>
            <h2 className={`${styles.resultTitle} ${result === 'success' ? styles.successTitle : styles.failTitle}`}>
              {result === 'success' ? 'Incident Mitigated' : 'Full System Outage'}
            </h2>
            <div className={styles.resultBody}>
              {result === 'success'
                ? challenge.solution
                : 'Wrong remediation. Throwing heavy-handed fixes at an unknown failure state triggers cascading failures. Always trace the actual root cause before executing production commands.'}
            </div>
            {result === 'success' && (
              <div className={styles.xpBadge}>+250 XP</div>
            )}
            <div className={styles.resultActions}>
              <Link href="/challenges" className={styles.btnGhost}>← Return to HQ</Link>
              {result === 'fail' && (
                <button className={styles.btnRetry} onClick={resetState}>Try Again</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
