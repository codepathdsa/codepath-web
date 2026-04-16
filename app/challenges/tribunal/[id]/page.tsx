'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import styles from './page.module.css';
import { CHALLENGES } from '@/lib/challenges';
import type { TribunalObjective } from '@/lib/challenges/types';
import CaptureOverlay from '@/app/components/CaptureOverlay';

// ── Evaluate a single objective against current file contents ─────────────────
function evalObjective(obj: TribunalObjective, contents: Record<string, string>): boolean {
  const text = contents[obj.check.file] ?? '';
  switch (obj.check.type) {
    case 'complexity':   return (text.match(/if\s*\(/g) ?? []).length <= obj.check.max;
    case 'contains':     return text.includes(obj.check.pattern);
    case 'not_contains': return !text.includes(obj.check.pattern);
  }
}

export default function TribunalWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const challenge = CHALLENGES.find(c => c.id === id);
  const td = challenge?.tribunalData;

  const [activeTab, setActiveTab] = useState<'briefing' | 'explorer'>('explorer');
  const [activeFile, setActiveFile] = useState<string>(td?.primaryFile ?? '');
  const [fileContents, setFileContents] = useState<Record<string, string>>(
    () => Object.fromEntries((td?.files ?? []).map(f => [f.name, f.code]))
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [testsPassed, setTestsPassed] = useState<number | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!td || !challenge) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '28px' }}>🚧</div>
        <div style={{ fontSize: '13px', color: '#52525b' }}>Challenge <code style={{ background: '#18181b', padding: '2px 6px', borderRadius: '4px', color: '#71717a' }}>{id}</code> data is not yet authored.</div>
        <Link href="/challenges" style={{ fontSize: '12px', color: '#3f3f46', textDecoration: 'underline' }}>← Back to Challenges</Link>
      </div>
    );
  }

  // Live-evaluated metrics
  const objResults = td.objectives.map(obj => evalObjective(obj, fileContents));
  const allObjPassed = objResults.every(Boolean);
  const primaryContent = fileContents[td.primaryFile] ?? '';
  const complexity = (primaryContent.match(/if\s*\(/g) ?? []).length;
  const complexityObj = td.objectives.find(o => o.check.type === 'complexity');
  const complexityTarget = complexityObj?.check.type === 'complexity' ? complexityObj.check.max : 4;

  const handleEditorChange = (value: string | undefined, filename: string) => {
    if (value !== undefined) setFileContents(prev => ({ ...prev, [filename]: value }));
  };

  const runEvaluator = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      if (allObjPassed) {
        setTestsPassed(td.totalTests);
        setIsResolved(true);
        setTimeout(() => setShowCapture(true), 1000);
      } else {
        const ratio = objResults.filter(Boolean).length / td.objectives.length;
        setTestsPassed(Math.max(Math.floor(td.totalTests * ratio * 0.88), Math.floor(td.totalTests * 0.8)));
      }
      setIsEvaluating(false);
    }, 1500);
  };

  const activeFileObj = td.files.find(f => f.name === activeFile);

  return (
    <div className={styles.layout}>
      {showCapture && (
        <CaptureOverlay challengeId={id} onClose={() => setShowCapture(false)} />
      )}

      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/challenges" style={{ color: 'var(--text-tertiary)' }}>←</Link>
          <div style={{ width: 1, height: 20, background: 'var(--border-strong)' }} />
          <span className="badge badge-error">TECH DEBT TRIBUNAL</span>
          <span>{challenge.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-tertiary)' }}>⏱ {fmt(timer)}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{challenge.level} · {challenge.timeEst}</span>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.panelTabHeader}>
            <button className={`${styles.panelTab} ${activeTab === 'explorer' ? styles.active : ''}`} onClick={() => setActiveTab('explorer')}>Explorer</button>
            <button className={`${styles.panelTab} ${activeTab === 'briefing' ? styles.active : ''}`} onClick={() => setActiveTab('briefing')}>Briefing</button>
          </div>

          <div className={styles.panelBody}>
            {activeTab === 'explorer' && (
              <div>
                <div className={styles.folderItem}>📂 {td.folderPath}</div>
                {td.files.map(f => (
                  <div
                    key={f.name}
                    className={`${styles.fileItem} ${activeFile === f.name ? styles.active : ''}`}
                    onClick={() => setActiveFile(f.name)}
                  >
                    <span className={styles.fileIcon}>📄</span>
                    {f.name}
                    {f.readOnly && <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>read-only</span>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'briefing' && (
              <div>
                <h2 className={styles.objectiveTitle}>{challenge.title}</h2>
                <div className={styles.objectiveDesc} style={{ whiteSpace: 'pre-line' }}>
                  {td.background}
                </div>

                <h3 className={styles.reqTitle}>Objectives</h3>
                <ul className={styles.reqList}>
                  {td.objectives.map((obj, i) => (
                    <li key={i} className={objResults[i] ? styles.done : ''}>{obj.label}</li>
                  ))}
                </ul>

                {td.hints.length > 0 && (
                  <>
                    <h3 className={styles.reqTitle}>Hints</h3>
                    {td.hints.map((hint, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        {revealedHints.includes(i) ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-raised)', padding: '8px 10px', borderRadius: '6px', lineHeight: 1.5 }}>
                            💡 {hint}
                          </div>
                        ) : (
                          <button
                            onClick={() => setRevealedHints(p => [...p, i])}
                            style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          >
                            🔒 Reveal hint {i + 1}
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}

                <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-raised)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Companies</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {challenge.companies.map(c => (
                      <span key={c} style={{ fontSize: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '2px 8px', color: 'var(--text-secondary)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel (IDE) */}
        <div className={styles.centerPanel}>
          <div className={styles.ideHeader}>
            {td.files.map(f => (
              <div
                key={f.name}
                className={`${styles.fileTab} ${activeFile === f.name ? styles.active : ''}`}
                onClick={() => setActiveFile(f.name)}
              >
                {f.name}
                {f.readOnly && <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>🔒</span>}
              </div>
            ))}
          </div>
          <div className={styles.ideContent}>
            {activeFileObj && (
              <Editor
                key={activeFile}
                height="100%"
                language={activeFileObj.lang}
                theme="vs-dark"
                value={fileContents[activeFile]}
                onChange={v => handleEditorChange(v, activeFile)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'var(--font-mono)',
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  readOnly: activeFileObj.readOnly ?? false,
                }}
              />
            )}
          </div>
        </div>

        {/* Right Panel (Evaluator) */}
        <div className={styles.rightPanel}>
          <div className={styles.evalHeader}>
            <span className={styles.evalTitle}>Live Analysis</span>
          </div>
          <div className={styles.evalMetrics}>

            {/* Complexity */}
            <div className={styles.metricBox}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>Cyclomatic Complexity</span>
                <span className="badge badge-active" style={{ fontSize: '10px' }}>LIVE</span>
              </div>
              <div className={`${styles.metricVal} ${complexity > complexityTarget * 2 ? styles.danger : complexity > complexityTarget ? styles.warn : styles.good}`}>
                {complexity} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>/ {complexityTarget} target</span>
              </div>
              <div className={styles.metricSub}>
                {complexity > complexityTarget ? 'Too many branching paths. Delegate to strategies.' : 'Complexity is within acceptable limits.'}
              </div>
            </div>

            {/* Objectives */}
            <div className={styles.metricBox}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>Objectives</span>
                <span className={`badge ${allObjPassed ? 'badge-active' : 'badge-warning'}`} style={{ fontSize: '10px' }}>{allObjPassed ? 'PASS' : 'PENDING'}</span>
              </div>
              <div className={`${styles.metricVal} ${allObjPassed ? styles.good : styles.warn}`}>
                {objResults.filter(Boolean).length} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>/ {td.objectives.length}</span>
              </div>
              <ul style={{ listStyle: 'none', marginTop: '8px', fontSize: '11px', lineHeight: 1.7 }}>
                {td.objectives.map((obj, i) => (
                  <li key={i} style={{ color: objResults[i] ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
                    {objResults[i] ? '✓' : '○'} {obj.label.split('(')[0].trim()}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tests */}
            <div className={styles.metricBox}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>Acceptance Tests</span>
                <span className="badge badge-warning" style={{ fontSize: '10px' }}>{td.testFramework}</span>
              </div>
              <div className={`${styles.metricVal} ${testsPassed === td.totalTests ? styles.good : testsPassed !== null ? styles.danger : ''}`}>
                {testsPassed ?? '—'} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>/ {td.totalTests}</span>
              </div>
              <div className={styles.metricSub}>
                {testsPassed === null ? 'Submit to run acceptance suite.' : testsPassed === td.totalTests ? 'All critical flows passing.' : 'Some tests are failing. Revisit your refactor.'}
              </div>
            </div>

          </div>
          <div className={styles.actionArea}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={runEvaluator} disabled={isEvaluating}>
              {isEvaluating ? 'Checking…' : '▶ Submit Refactor'}
            </button>
          </div>
        </div>
      </div>

      {isResolved && (
        <div className={styles.successModal}>
          <div className={styles.successCard}>
            <div style={{ width: '64px', height: '64px', background: 'var(--bg-success)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>✓</div>
            <h2 className="t-heading" style={{ marginBottom: '8px' }}>Tech Debt Resolved!</h2>
            <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{td.successMessage}</p>
            <div className="badge badge-active" style={{ fontSize: '16px', padding: '6px 12px', display: 'inline-flex', marginBottom: '32px' }}>+{td.xp} XP</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link href="/challenges" className="btn-primary">Complete Tribunal</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
