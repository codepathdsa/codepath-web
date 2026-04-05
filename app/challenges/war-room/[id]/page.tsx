'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import { CHALLENGES, ChallengeOption } from '@/lib/challenges';

interface LogLine {
  text: string;
  type: 'system' | 'normal' | 'warning' | 'error' | 'success';
}

const FALLBACK_WRONG_ACTIONS = [
  { label: 'A', title: 'Restart Primary Database', sub: 'sudo systemctl restart postgresql', isCorrect: false },
  { label: 'B', title: 'Scale out API pods', sub: 'kubectl scale deployment api --replicas=20', isCorrect: false },
  { label: 'C', title: 'Purge Entire Redis Cache', sub: 'redis-cli FLUSHALL', isCorrect: false },
  { label: 'D', title: 'Roll back the last deployment', sub: 'kubectl rollout undo deployment', isCorrect: false },
];

export default function WarRoom() {
  const params = useParams();
  const router = useRouter();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  const challengeId = params.id as string;
  // Support both full ID (ENG-WAR-001) and slug fallback
  const challenge = useMemo(() =>
    CHALLENGES.find(c => c.id === challengeId) ||
    CHALLENGES.find(c => c.id === `ENG-WAR-${challengeId}`) ||
    CHALLENGES.find(c => c.type === 'War Room'),
  [challengeId]);

  // Use options from challenges.ts directly; fall back to generic distractors if missing
  const options: ChallengeOption[] = useMemo(() => {
    return challenge?.options ?? FALLBACK_WRONG_ACTIONS;
  }, [challenge]);
  const [cpu, setCpu] = useState(99);
  const [latency, setLatency] = useState(2450);
  const [errorRate, setErrorRate] = useState(12.4);
  const [dbConnections, setDbConnections] = useState(14500);

  // Terminal state
  const [cmdInput, setCmdInput] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([
    { text: '[SYSTEM] War Room scenario initialized. Connect to bastion host established.', type: 'system' },
    { text: `[SYSTEM] Simulating P0 Incident: ${challenge?.title}`, type: 'system' },
    { text: 'Type "help" for a list of investigation commands.', type: 'normal' }
  ]);

  // Quiz result state
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15-minute war room clock

  // Background metric jitter to look real
  useEffect(() => {
    if (isResolved) return;
    
    const metricInterval = setInterval(() => {
      setCpu(prev => Math.min(100, Math.max(90, prev + (Math.random() * 4 - 2))));
      setLatency(prev => Math.max(1000, prev + (Math.random() * 200 - 100)));
      setErrorRate(prev => Math.max(5.0, prev + (Math.random() * 1.5 - 0.75)));
      setDbConnections(prev => Math.min(15000, Math.max(14000, prev + Math.floor(Math.random() * 100 - 50))));
    }, 1500);

    const logStreamInterval = setInterval(() => {
      const liveLogs = [
        '[WARN] system: threshold anomaly detected in active traces',
        '[ERROR] metrics_daemon: dropped spans due to buffer saturation',
        '[ERROR] api_gateway: upstream latency degraded',
        '[WARN] health_check: readiness probe taking > 2000ms'
      ];
      const randomLog = liveLogs[Math.floor(Math.random() * liveLogs.length)];
      appendLog(randomLog, randomLog.includes('ERROR') ? 'error' : 'warning');
    }, 2500);

    return () => {
      clearInterval(metricInterval);
      clearInterval(logStreamInterval);
    };
  }, [isResolved]);

  // Countdown timer
  useEffect(() => {
    if (isResolved || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isResolved, timeLeft]);

  // Terminal autoscroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!challenge) return <div style={{ color: 'white', padding: '20px' }}>Loading incident...</div>;

  const appendLog = (text: string, type: LogLine['type'] = 'normal') => {
    setLogs(prev => [...prev, { text, type }]);
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = cmdInput.trim();
      setCmdInput('');
      
      if (!cmd) return;
      appendLog(`$ ${cmd}`, 'system');

      setTimeout(() => {
        if (cmd === 'help') {
          appendLog('Available commands: top, kubectl get pods, tail syslog, check-deploy', 'normal');
        } else if (cmd === 'top') {
          appendLog('PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n  1 node      20   0   4.2g   2.1g   0.1g R  99.8 12.0   1:42.33 node index.js', 'normal');
        } else if (cmd === 'kubectl get pods') {
          appendLog('NAME                               READY   STATUS    RESTARTS   AGE\nprimary-service-7f8d9b-x2z9a       1/1     Running   4          4m\ncache-master-0                     1/1     Running   2          14d', 'normal');
        } else if (cmd === 'tail syslog') {
          appendLog('14:32:01 CRON[124]: pam_unix(cron:session): session closed for user root\n14:32:05 kernel: [  245.123] TCP: out of memory -- consider tuning tcp_mem', 'error');
        } else if (cmd === 'check-deploy') {
          appendLog('Latest deploy: v2.1.4 (4 minutes ago)\nStatus: DEGRADED (Kubernetes Probes Failing)', 'warning');
        } else {
          appendLog(`command not found: ${cmd}`, 'error');
        }
      }, 300);
    }
  };

  const executeRemediation = (opt: ChallengeOption) => {
    if (isResolved) return;
    setSelectedLabel(opt.label);
    setIsResolved(true);
    if (opt.isCorrect) {
      setCpu(20);
      setLatency(120);
      setErrorRate(0.1);
      setDbConnections(200);
      appendLog(`[SYSTEM] Executing: ${opt.sub}`, 'system');
      setTimeout(() => {
        appendLog('[SYSTEM] Fix successful. System metrics returning to normal parameters.', 'success');
        setResult('success');
      }, 1500);
    } else {
      setCpu(100);
      appendLog(`[SYSTEM] Executing: ${opt.sub}`, 'system');
      setTimeout(() => {
        appendLog('[SYSTEM] FATAL: Action exacerbated the issue. Full system cascade failure.', 'error');
        setResult('fail');
      }, 1500);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.layout}>
      {/* 7.1 Global Header */}
      <div className={styles.topBar}>
        <div className={styles.alertHeader}>
          <div className={styles.alertDot}></div>
          INCIDENT {challenge.id}: {challenge.title.toUpperCase()}
        </div>
        
        <div className={`${styles.timer} ${timeLeft < 300 && !isResolved ? styles.timerCritical : ''}`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className={styles.headerActions}>
          <button className="btn-ghost" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? 'Unmute Alarm' : 'Mute Alarm'}
          </button>
          <button className="btn-ghost" onClick={() => router.push('/challenges')} style={{ color: 'var(--text-tertiary)'}}>
            Abort Scenario
          </button>
        </div>
      </div>

      {/* 7.2 Live Telemetry Dashboard */}
      <div className={styles.telemetryGrid}>
        <div className={`${styles.metricCard} ${cpu > 95 ? styles.danger : ''}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>API CPU Usage</span>
            <span className={styles.metricTrend}>↑ 42%</span>
          </div>
          <div className={`${styles.metricValue} ${cpu > 95 ? styles.danger : ''}`}>
            {cpu.toFixed(1)}%
          </div>
        </div>
        <div className={`${styles.metricCard} ${latency > 2000 ? styles.danger : ''}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>P99 Latency</span>
            <span className={styles.metricTrend}>↑ 400%</span>
          </div>
          <div className={`${styles.metricValue} ${latency > 2000 ? styles.danger : ''}`}>
            {latency.toFixed(0)} ms
          </div>
        </div>
        <div className={`${styles.metricCard} ${errorRate > 5 ? styles.danger : ''}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>5xx Error Rate</span>
            <span className={styles.metricTrend}>↑ 12%</span>
          </div>
          <div className={`${styles.metricValue} ${errorRate > 5 ? styles.danger : ''}`}>
            {errorRate.toFixed(1)}%
          </div>
        </div>
        <div className={`${styles.metricCard} ${dbConnections > 10000 ? styles.danger : ''}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>DB Active Conns</span>
            <span className={styles.metricTrend}>↑ 800%</span>
          </div>
          <div className={`${styles.metricValue} ${dbConnections > 10000 ? styles.danger : ''}`}>
            {dbConnections.toLocaleString()}
          </div>
        </div>
      </div>

      <div className={styles.lowerWorkspace}>
        {/* 7.3 Investigation Terminal */}
        <div className={styles.terminalPanel}>
          <div className={styles.terminalHeader}>
            bastion-prod-1.aws.internal ~$
          </div>
          <div className={styles.terminalBody}>
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`${styles.terminalOutput} ${
                  log.type === 'error' ? styles.logError : 
                  log.type === 'warning' ? styles.logWarning : 
                  log.type === 'system' ? styles.logSystem : 
                  log.type === 'success' ? styles.logSuccess : ''
                }`}
              >
                {log.text}
              </div>
            ))}
            {!isResolved && (
              <div className={styles.terminalInputRow}>
                <span className={styles.termPrompt}>user@bastion:~$</span>
                <input 
                  type="text" 
                  className={styles.termInput} 
                  autoFocus 
                  value={cmdInput}
                  onChange={e => setCmdInput(e.target.value)}
                  onKeyDown={handleCommand}
                  spellCheck={false}
                />
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* 7.4 Remediation Action Panel */}
        <div className={styles.remediationPanel}>
          <div className={styles.rHeader}>
            <div className={styles.rTitle}>Execute Remediation</div>
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>WARNING: PROD</span>
          </div>
          <div className={styles.rDesc}>
            {challenge.desc}<br/><br/>
            <strong>What is your First Action strategy?</strong>
          </div>
          
          <div className={styles.rList}>
            {options.map((opt) => (
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
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, minWidth: '18px' }}>{opt.label}.</span>
                  <div>
                    <div className={styles.actionTitle}>{opt.title}</div>
                    <div className={styles.actionSub}>{opt.sub}</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-tertiary)'}}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className={styles.resultPanel}>
          <div className={`${styles.resultCard} ${result === 'success' ? styles.success : styles.fail}`}>
            <div className={`${styles.resultIcon} ${result === 'success' ? styles.success : styles.fail}`}>
              {result === 'success' ? '✓' : '✕'}
            </div>
            <h2 className={styles.resultTitle}>
              {result === 'success' ? 'Incident Mitigated' : 'Full System Outage'}
            </h2>
            <div className={styles.resultDesc}>
              {result === 'success' ? (
                <>Excellent root cause analysis. You selected: <br/><br/><strong>{challenge.solution}</strong><br/><br/> This successfully resolved the specific problem without creating cascading failures.</>
              ) : (
                <>You executed the wrong remediation. Throwing generic, heavy-handed actions like rebooting databases during an unknown failure state only exacerbates the symptoms. You must trace the actual root cause.</>
              )}
            </div>
            
            {result === 'success' && <div className="badge badge-active" style={{ fontSize: 'var(--text-lg)', padding: '6px 12px', margin: '0 auto var(--space-6)', display: 'inline-flex' }}>+250 XP</div>}
            
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <Link href="/challenges" className="btn-ghost">Return to Headquarters</Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
