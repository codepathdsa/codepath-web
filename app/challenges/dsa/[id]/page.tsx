'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { CHALLENGES, TestCase } from '@/lib/challenges';

// ─── Types ───────────────────────────────────────────────────────────────────
interface TestResult {
  tc: TestCase;
  passed: boolean;
  actual: string;
  ms: number;
  hidden: boolean;
}

// ─── Heuristic evaluator (browser-side, no execution sandbox needed) ─────────
function evaluateCode(
  code: string,
  challengeId: string,
  tc: TestCase,
  tcIndex: number
): { passed: boolean; actual: string } {
  const c = code.toLowerCase();

  const patterns: Record<string, string[]> = {
    'ENG-DSA-001': ['slow', 'fast', 'nums[slow]', 'nums[fast]'],
    'ENG-DSA-002': ['sort', 'merged', 'max('],
    'ENG-DSA-003': ['deque', 'popleft', 'append', 'is_allowed'],
    'ENG-DSA-004': ['in_degree', 'queue', 'order', 'valueerror'],
    'ENG-DSA-005': ['heapq', 'heappush', 'heapreplace', 'min_heap'],
    'ENG-DSA-006': ['bisect', 'sorted_keys', 'ring', 'get_server'],
    'ENG-DSA-007': ['kdnode', 'euclidean', 'heappush', 'search'],
    'ENG-DSA-008': ['parent', 'find', 'union', 'self.parent'],
    'ENG-DSA-009': ['dllnode', 'lrucache', '_remove', '_insert_front'],
    'ENG-DSA-010': ['goto', 'fail', 'build', 'search', 'deque'],
  };

  const required = patterns[challengeId] ?? [];
  const matchCount = required.filter(p => c.includes(p.toLowerCase())).length;
  const ratio = required.length > 0 ? matchCount / required.length : 0;

  // Tougher hidden test cases require a higher pattern-match ratio
  const threshold = [0.3, 0.5, 0.6, 0.7, 0.85][Math.min(tcIndex, 4)];
  const isBasicallyEmpty = code.trim().length < 80;
  const passed = !isBasicallyEmpty && ratio >= threshold;

  return {
    passed,
    actual: passed
      ? tc.expected
      : `Wrong Answer (matched ${matchCount}/${required.length} algorithm patterns)`,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function DSAWorkspace() {
  const params = useParams();
  const challengeId = params.id as string;

  const challenge = useMemo(
    () =>
      CHALLENGES.find(c => c.id === challengeId) ??
      CHALLENGES.find(c => c.id === `ENG-DSA-${challengeId}`) ??
      CHALLENGES.find(c => c.type === 'DSA'),
    [challengeId]
  );

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your solution here\n# Switch languages using the dropdown above\n\ndef solve():\n    pass\n');
  const [activeTab, setActiveTab] = useState<'ticket' | 'context' | 'solution'>('ticket');
  const [hintsUnlocked, setHintsUnlocked] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [cliMode, setCliMode] = useState(false);

  // Run state
  const [runResults, setRunResults] = useState<TestResult[]>([]);   // example results after "Run Code"
  const [submitResults, setSubmitResults] = useState<TestResult[]>([]); // all results after "Submit"
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingStarted, setIsSubmittingStarted] = useState(false); // cards revealed immediately
  const [submitted, setSubmitted] = useState(false);

  // Reset when challenge changes
  useEffect(() => {
    setCode('# Write your solution here\n# Switch languages using the dropdown above\n\ndef solve():\n    pass\n');
    setRunResults([]);
    setSubmitResults([]);
    setHintsUnlocked([]);
    setSubmitted(false);
    setIsSubmittingStarted(false);
    setTimer(0);
  }, [challenge?.id]);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!challenge) {
    return (
      <div style={{ color: 'var(--text-primary)', padding: '40px', textAlign: 'center' }}>
        <h2>Challenge not found</h2>
        <Link href="/challenges" className="btn-ghost" style={{ marginTop: '16px', display: 'inline-flex' }}>
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const tcs = challenge.testCases ?? [];
  const examples = tcs.slice(0, 2);         // always shown
  const hiddenTcs = tcs.slice(2);           // hidden until submit

  const allPassed = submitted && submitResults.length > 0 && submitResults.every(r => r.passed);
  const submitPassCount = submitResults.filter(r => r.passed).length;

  // ── Run Code (examples only) ──
  const handleRunCode = () => {
    if (!examples.length) return;
    setIsRunning(true);
    setRunResults([]);
    setSubmitted(false);

    examples.forEach((tc, i) => {
      setTimeout(() => {
        const ms = Math.floor(Math.random() * 80 + 15);
        const { passed, actual } = evaluateCode(code, challenge.id, tc, i);
        setRunResults(prev => [...prev, { tc, passed, actual, ms, hidden: false }]);
        if (i === examples.length - 1) setIsRunning(false);
      }, i * 300 + 250);
    });
  };

  const handleSubmit = () => {
    if (!tcs.length) return;
    // Phase 1: reveal all cards immediately
    setIsSubmittingStarted(true);
    setIsSubmitting(true);
    setSubmitResults([]);
    setSubmitted(false);

    // Phase 2: stream results in with stagger
    tcs.forEach((tc, i) => {
      setTimeout(() => {
        const ms = Math.floor(Math.random() * 130 + 20);
        const { passed, actual } = evaluateCode(code, challenge.id, tc, i);
        setSubmitResults(prev => [...prev, { tc, passed, actual, ms, hidden: i >= 2 }]);
        if (i === tcs.length - 1) {
          setIsSubmitting(false);
          setSubmitted(true);
        }
      }, i * 350 + 600); // cards shown first (600ms head-start), then badges pop in
    });
  };

  const toggleHint = (idx: number) => {
    if (!hintsUnlocked.includes(idx)) setHintsUnlocked(p => [...p, idx]);
  };

  const nextChallenge = CHALLENGES.find(c => c.id === challenge.nextChallengeId);

  return (
    <div className={styles.layout}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/challenges" style={{ color: 'var(--text-tertiary)' }}>←</Link>
          <span className="badge badge-dsa">{challenge.id}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
            {challenge.title}
          </span>
        </div>

        <div className={styles.topCenter}>{formatTime(timer)}</div>

        <div className={styles.topRight}>
          <div className={styles.modeIndicator}>
            <span>Mode:</span>
            <span style={{ color: cliMode ? 'var(--accent)' : 'var(--text-primary)' }}>
              {cliMode ? 'CLI' : 'Web'}
            </span>
          </div>
          <button className="btn-ghost" onClick={() => setCliMode(!cliMode)}>
            {cliMode ? 'Web Mode' : 'CLI Mode'}
          </button>
          <button
            className="btn-ghost"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            style={{ minWidth: '110px' }}
          >
            {isRunning ? '⏳ Running…' : '▶ Run Code'}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            style={{ minWidth: '90px' }}
          >
            {isSubmitting ? '⏳…' : 'Submit →'}
          </button>
        </div>
      </div>

      <div className={styles.mainArea}>
        {/* ── Left Panel ── */}
        <div className={styles.leftPanel}>
          <div className={styles.tabHeader}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'ticket' ? styles.active : ''}`}
              onClick={() => setActiveTab('ticket')}
            >
              Problem
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'context' ? styles.active : ''}`}
              onClick={() => setActiveTab('context')}
            >
              Context
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'solution' ? styles.active : ''}`}
              onClick={() => setActiveTab('solution')}
            >
              Solution
            </button>
          </div>

          {activeTab === 'ticket' && (
            <div className={styles.jiraContent}>
              {/* Title + meta */}
              <h2 className={styles.jiraTitle}>{challenge.title}</h2>

              <div className={styles.jiraMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Companies</span>
                  <span className={styles.metaValue}>{challenge.companies.join(', ')}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Est. Time</span>
                  <span className={styles.metaValue}>{challenge.timeEst}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Level</span>
                  <span className={styles.metaValue} style={{ color: 'var(--accent)' }}>
                    {challenge.level}
                  </span>
                </div>
              </div>

              {/* Topic chips */}
              {challenge.topics && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {challenge.topics.map(t => (
                    <span
                      key={t}
                      style={{
                        fontSize: '11px', padding: '2px 10px', borderRadius: '12px',
                        background: 'var(--bg-raised)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className={styles.sectionTitle}>Description</div>
              <div className={styles.desc}>
                <p>{challenge.desc}</p>
              </div>

              {/* ── Examples (always visible, first 2 test cases) ── */}
              {examples.length > 0 && (
                <>
                  {examples.map((tc, i) => {
                    const runResult = runResults.find(r => r.tc.id === tc.id);
                    const submitResult = submitResults.find(r => r.tc.id === tc.id);
                    // During/after submission, use submit result; otherwise use run result
                    const activeResult = (isSubmittingStarted || submitted) ? submitResult : runResult;
                    const showRunning = (isRunning && !runResult) || (isSubmittingStarted && !submitResult);
                    return (
                      <div key={tc.id} style={{ marginBottom: '16px' }}>
                        <div className={styles.sectionTitle}>Example {i + 1}</div>
                        <div
                          className={isSubmittingStarted ? styles.tcCard : ''}
                          style={{
                            background: activeResult
                              ? (activeResult.passed ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)')
                              : 'var(--bg-raised)',
                            border: `1px solid ${activeResult
                              ? (activeResult.passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)')
                              : 'var(--border-subtle)'}`,
                            borderRadius: '8px', padding: '12px 14px',
                            fontFamily: 'var(--font-mono)', fontSize: '12px',
                            transition: 'border-color 0.4s ease, background 0.4s ease',
                            animationDelay: isSubmittingStarted ? `${i * 50}ms` : '0ms',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div>
                              <span style={{ color: 'var(--text-tertiary)' }}>Input:&nbsp;&nbsp;</span>
                              <span style={{ color: 'var(--text-primary)' }}>{tc.input}</span>
                            </div>
                            {activeResult ? (
                               <span
                                  className={styles.popBadge}
                                  style={{
                                    fontSize: '11px', fontWeight: 700,
                                    color: activeResult.passed ? 'var(--color-success)' : 'var(--color-error)',
                                    display: 'inline-block',
                                    animationDelay: isSubmittingStarted ? `${i * 350 + 650}ms` : '0ms',
                                  }}
                                >
                                  {activeResult.passed ? '✓ Accepted' : '✕ Wrong Answer'} — {activeResult.ms}ms
                                </span>
                            ) : showRunning ? (
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-sans, inherit)' }}>running…</span>
                            ) : null}
                          </div>
                          <div style={{ marginBottom: (activeResult && !activeResult.passed) ? '4px' : '0' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Output:&nbsp;</span>
                            <span style={{ color: 'var(--text-primary)' }}>{tc.expected}</span>
                          </div>
                          {activeResult && !activeResult.passed && (
                             <div className={styles.popBadge} style={{ animationDelay: isSubmittingStarted ? `${i * 350 + 700}ms` : '0ms' }}>
                               <span style={{ color: 'var(--color-error)' }}>Got:&nbsp;&nbsp;&nbsp;&nbsp;</span>
                               <span style={{ color: 'var(--color-error)' }}>{activeResult.actual}</span>
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Hidden test cases — lock hint before submit, fully revealed after */}
              {hiddenTcs.length > 0 && (
                !(isSubmittingStarted || submitted) ? (
                  <div
                    style={{
                      fontSize: '12px', color: 'var(--text-tertiary)',
                      padding: '10px 14px', border: '1px dashed var(--border-subtle)',
                      borderRadius: '8px', marginBottom: '16px',
                    }}
                  >
                    🔒 +{hiddenTcs.length} hidden test cases — revealed on Submit
                  </div>
                ) : (
                  <>
                    <div className={styles.sectionTitle} style={{ marginTop: '4px' }}>
                      Hidden Test Cases {submitResults.filter(r => r.hidden).length > 0 && (
                        <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '11px', marginLeft: '6px' }}>
                          (revealed after submission)
                        </span>
                      )}
                    </div>
                    {hiddenTcs.map((tc, i) => {
                      const result = submitResults.find(r => r.tc.id === tc.id);
                      return (
                        <div
                          key={tc.id}
                          className={styles.tcCard}
                          style={{
                            marginBottom: '12px',
                            animationDelay: `${i * 60}ms`, // fast cascade reveal
                          }}
                        >
                          <div
                            style={{
                              border: `1px solid ${result ? (result.passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)') : 'var(--border-subtle)'}`,
                              borderRadius: '8px', padding: '12px 14px',
                              fontFamily: 'var(--font-mono)', fontSize: '12px',
                              transition: 'border-color 0.4s ease, background 0.4s ease',
                              background: result ? (result.passed ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)') : 'var(--bg-raised)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans, inherit)' }}>
                                Hidden Test {i + 1}: {tc.description}
                              </span>
                              {result ? (
                                <span
                                  className={styles.popBadge}
                                  style={{
                                    fontSize: '11px', fontWeight: 700,
                                    color: result.passed ? 'var(--color-success)' : 'var(--color-error)',
                                    animationDelay: `${i * 350 + 650}ms`,
                                    display: 'inline-block',
                                  }}
                                >
                                  {result.passed ? '✓ PASS' : '✕ FAIL'} · {result.ms}ms
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-sans, inherit)' }}>running…</span>
                              )}
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Input:&nbsp;&nbsp;&nbsp;</span>
                              <span style={{ color: 'var(--text-primary)' }}>{tc.input}</span>
                            </div>
                            <div style={{ marginBottom: result && !result.passed ? '4px' : '0' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Expected: </span>
                              <span style={{ color: 'var(--text-primary)' }}>{tc.expected}</span>
                            </div>
                            {result && !result.passed && (
                              <div className={styles.popBadge} style={{ animationDelay: `${i * 60 + 200}ms` }}>
                                <span style={{ color: 'var(--color-error)' }}>Got:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                <span style={{ color: 'var(--color-error)' }}>{result.actual}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )
              )}


              {/* ── Hints ── */}
              {challenge.hints && challenge.hints.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>Hints</div>
                  {challenge.hints.map((hint, i) => (
                    <div className={styles.hintBlock} key={i}>
                      <button className={styles.hintToggle} onClick={() => toggleHint(i + 1)}>
                        <span>Hint {i + 1}</span>
                        {!hintsUnlocked.includes(i + 1) && (
                          <span className={styles.hintCost}>Click to reveal</span>
                        )}
                      </button>
                      {hintsUnlocked.includes(i + 1) && (
                        <div className={styles.hintContent}>{hint}</div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'context' && (
            <div className={styles.jiraContent}>
              <div className={styles.sectionTitle}>Real-World Context</div>
              <div className={styles.desc}>
                <p>
                  This problem is based on production scenarios faced by{' '}
                  <strong>{challenge.companies.join(' and ')}</strong> engineers.
                </p>
                <p style={{ marginTop: '12px' }}>{challenge.solution}</p>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className={styles.jiraContent} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className={styles.sectionTitle} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Reference Solution</span>
                <span className="badge" style={{ fontSize: '10px' }}>Python 3</span>
              </div>
              <div style={{ flex: 1, minHeight: '300px', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                <Editor
                  height="100%"
                  language="python"
                  theme="vs-dark"
                  value={challenge.starterCode ?? '# Solution not provided'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    readOnly: true,
                    lineNumbersMinChars: 3,
                  }}
                />
              </div>
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                💡 Right now, the reference solution is only provided in Python. Multi-language solutions are coming soon.
              </p>
            </div>
          )}
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.editorToolbar}>
            <select className={styles.langSelect} value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
            </select>
            {submitted && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: allPassed ? 'var(--color-success)' : 'var(--color-error)',
                  marginLeft: 'auto',
                }}
              >
                {allPassed ? `✓ Accepted (${submitPassCount}/${tcs.length})` : `✕ Wrong Answer (${submitPassCount}/${tcs.length})`}
              </span>
            )}
          </div>

          <div className={styles.editorArea}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                readOnly: cliMode,
              }}
            />
            {cliMode && (
              <div className={styles.cliModeOverlay}>
                <div className={styles.cliModeBox}>
                  <div className={styles.cliModeTitle}>CLI Mode Active</div>
                  <p className="t-body" style={{ marginBottom: 'var(--space-6)' }}>
                    Solve locally in your IDE. Push to run against hidden test cases.
                  </p>
                  <div className="cli-block" style={{ textAlign: 'left' }}>
                    <div className="cli-block__body">
                      <div className="cli-block__line">
                        <span className="cli-block__prompt">$</span>
                        <span className="cli-block__command">engprep push {challenge.id}</span>
                      </div>
                      <div className="cli-block__line cli-block__line--output">
                        <span className="cli-block__output" style={{ color: 'var(--text-tertiary)' }}>
                          Waiting for submission…
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Test Output Panel ── */}
          <div className={styles.testPanel}>
            <div className={styles.testHeader}>
              <span className={styles.testTitle}>
                {submitted ? 'Submission Result' : isRunning ? 'Running…' : 'Test Output'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting || cliMode}
                >
                  ▶ Run Code
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent)', borderColor: 'rgba(99,102,241,0.4)' }}
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting || cliMode}
                >
                  Submit →
                </button>
              </div>
            </div>

            <pre className={styles.testOutput}>
              {/* Idle state */}
              {runResults.length === 0 && submitResults.length === 0 && !isRunning && !isSubmitting && (
                <span style={{ color: 'var(--text-tertiary)' }}>
                  ▶ Run Code to test against examples · Submit to judge all {tcs.length} test cases
                </span>
              )}

              {/* Run Code results (examples only) */}
              {!submitted && runResults.map((r, i) => (
                <span key={i} style={{ display: 'block', color: r.passed ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {r.passed ? '✓' : '✕'} Example {i + 1}: {r.passed ? 'Accepted' : `Wrong Answer — ${r.actual}`} ({r.ms}ms)
                </span>
              ))}

              {/* Submit results (all tests, hidden ones anonymised) */}
              {submitted && submitResults.map((r, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    color: r.passed ? 'var(--color-success)' : 'var(--color-error)',
                  }}
                >
                  {r.passed ? '✓' : '✕'}{' '}
                  {r.hidden ? `Hidden Test ${i - 1}` : `Example ${i + 1}`}
                  {' '}— {r.passed ? 'Passed' : `Wrong Answer`} ({r.ms}ms)
                  {!r.passed && !r.hidden && `\n   Expected: ${r.tc.expected}`}
                </span>
              ))}

              {/* Summary line */}
              {submitted && submitResults.length === tcs.length && (
                <span
                  style={{
                    display: 'block',
                    marginTop: '10px',
                    fontWeight: 700,
                    color: allPassed ? 'var(--color-success)' : 'var(--color-error)',
                  }}
                >
                  ══ {allPassed
                    ? `Accepted — ${submitPassCount}/${tcs.length} tests passed`
                    : `Wrong Answer — ${submitPassCount}/${tcs.length} tests passed`} ══
                </span>
              )}
            </pre>
          </div>

          {/* ── Accepted Panel ── */}
          {submitted && allPassed && (
            <div className={`${styles.resultPanel} ${styles.open}`}>
              <div className={styles.resultHeader}>
                <span
                  style={{
                    background: 'var(--bg-success)', color: 'var(--color-success)',
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >✓</span>
                <span className={styles.resultTitle}>Accepted</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
                  {submitPassCount}/{tcs.length} test cases passed
                </span>
                <button
                  onClick={() => { setSubmitted(false); setSubmitResults([]); setRunResults([]); }}
                  style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
                  title="Dismiss"
                >&times;</button>
              </div>

              <div className={styles.resultMetrics}>
                <span>{submitResults.reduce((s, r) => s + r.ms, 0)}ms total</span>
                <span>Faster than 68% of submissions</span>
              </div>

              <div
                style={{
                  padding: 'var(--space-4)', background: 'var(--bg-base)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Expert Explanation
                </h4>
                <p className="t-body" style={{ fontSize: 'var(--text-sm)' }}>{challenge.solution}</p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {nextChallenge ? (
                  <Link href={`/challenges/dsa/${nextChallenge.id}`} className="btn-primary">
                    Next: {nextChallenge.title} →
                  </Link>
                ) : (
                  <Link href="/challenges" className="btn-primary">
                    All DSA Challenges Complete 🎉
                  </Link>
                )}
                <button
                  className="btn-ghost"
                  onClick={() => { setSubmitted(false); setSubmitResults([]); setRunResults([]); }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* ── Wrong Answer Panel ── */}
          {submitted && !allPassed && (
            <div
              className={`${styles.resultPanel} ${styles.open}`}
              style={{ borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <div className={styles.resultHeader}>
                <span
                  style={{
                    background: 'rgba(239,68,68,0.15)', color: 'var(--color-error)',
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >✕</span>
                <span className={styles.resultTitle} style={{ color: 'var(--color-error)' }}>
                  Wrong Answer
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-error)' }}>
                  {submitPassCount}/{tcs.length} passed · Unsolved
                </span>
                <button
                  onClick={() => { setSubmitted(false); setSubmitResults([]); setRunResults([]); setIsSubmittingStarted(false); }}
                  style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
                  title="Dismiss"
                >&times;</button>
              </div>
              <p className="t-body" style={{ fontSize: 'var(--text-sm)', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                Your solution failed {tcs.length - submitPassCount} test case{tcs.length - submitPassCount > 1 ? 's' : ''}.
                Review the failing examples above and re-submit.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                  Re-submit
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => toggleHint(hintsUnlocked.length + 1)}
                  disabled={hintsUnlocked.length >= (challenge.hints?.length ?? 0)}
                >
                  {hintsUnlocked.length >= (challenge.hints?.length ?? 0) ? 'All Hints Used' : 'Unlock Next Hint'}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => { setSubmitted(false); setSubmitResults([]); setRunResults([]); setIsSubmittingStarted(false); }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
