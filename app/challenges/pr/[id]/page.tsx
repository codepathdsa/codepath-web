'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import CaptureOverlay from '@/app/components/CaptureOverlay';
import { CHALLENGES } from '@/lib/challenges';

export default function PRWorkspace({ params }: { params: Promise<{ id: string }> }) {
  // ─ Load challenge data ───────────────────────────────────────────────────
  const { id } = use(params);
  const challenge = CHALLENGES.find(c => c.id === id);
  const pr        = challenge?.prReview;

  const [activeTab, setActiveTab]           = useState<'overview' | 'files'>('files');
  const [commentIdx, setCommentIdx]         = useState<number | null>(null);
  const [bugType, setBugType]               = useState('');
  const [submitted, setSubmitted]           = useState(false);
  const [result, setResult]                 = useState<'success' | 'fail' | null>(null);
  const [showCapture, setShowCapture]       = useState(false);
  const [timer, setTimer]                   = useState(0);
  const [revealedHints, setRevealedHints]   = useState<number[]>([]);

  useEffect(() => {
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const revealHint = (i: number) => {
    if (!revealedHints.includes(i)) setRevealedHints(p => [...p, i]);
  };

  // ─ Not yet authored ──────────────────────────────────────────────────
  if (!pr) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '28px' }}>🚧</div>
        <div style={{ fontSize: '13px', color: '#52525b' }}>Challenge <code style={{ background: '#18181b', padding: '2px 6px', borderRadius: '4px', color: '#71717a' }}>ENG-PR-{id}</code> data is not yet authored.</div>
        <Link href="/challenges" style={{ fontSize: '12px', color: '#3f3f46', textDecoration: 'underline' }}>← Back to Challenges</Link>
      </div>
    );
  }

  // ─ Derived helpers ────────────────────────────────────────────────
  const fileParts  = pr.prFile.split('/');
  const fileName   = fileParts.pop() ?? pr.prFile;
  const fileDir    = fileParts.join(' / ');
  const additions  = pr.diff.filter(l => l.type === 'addition').length;
  const deletions  = pr.diff.filter(l => l.type === 'deletion').length;
  const initials   = pr.prAuthor.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  const reviewerCo = challenge?.companies?.[0] ?? 'Acme';

  const handleApprove      = () => { setResult('fail'); setSubmitted(true); };
  const handleSubmitReview = () => {
    const flagged = commentIdx !== null ? pr.diff[commentIdx] : null;
    if (flagged && flagged.type !== 'normal' && bugType === pr.correctBugType) {
      setResult('success');
      setTimeout(() => setShowCapture(true), 1200);
    } else {
      setResult('fail');
    }
    setSubmitted(true);
  };

  return (
    <div className={styles.layout}>
      {showCapture && (
        <CaptureOverlay challengeId={id} onClose={() => setShowCapture(false)} />
      )}

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/challenges" style={{ color: '#71717a', textDecoration: 'none', fontSize: '18px' }}>←</Link>
          <div style={{ width: 1, height: 20, background: '#27272a' }} />
          <span className={styles.prBadge}>PR REVIEW</span>
          <span style={{ color: '#f4f4f5', fontWeight: 600, fontSize: '14px' }}>{challenge.title}</span>
          <span style={{ color: '#3f3f46', fontSize: '13px' }}>#{pr.prNumber}</span>
          {challenge.companies.map(c => (
            <span key={c} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#18181b', color: '#71717a', border: '1px solid #27272a' }}>{c}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#3f3f46' }}>⏱ {fmt(timer)}</span>
          <span className={styles.topBadge}>{challenge.level}</span>
          <span className={styles.topBadge}>{challenge.timeEst}</span>
        </div>
      </div>

      {/* ── Workspace ────────────────────────────────────────────────────── */}
      <div className={styles.workspace}>

        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarInner}>

            {/* PR Meta */}
            <div className={styles.sideSection}>
              <div className={styles.sideSectionLabel}>PULL REQUEST</div>
              <div className={styles.prStatusRow}>
                <span className={styles.badgeOpen}>Open</span>
                <span style={{ fontSize: '11px', color: '#52525b' }}>#{pr.prNumber} · 1 commit</span>
              </div>
              <div className={styles.prMetaTitle}>{challenge.title}</div>
              <div className={styles.prMetaRow}>
                <span>{pr.prAuthor} wants to merge</span>
                <code className={styles.mono}>{pr.prBranch}</code>
                <span>→</span>
                <code className={styles.mono}>{pr.prBase}</code>
              </div>
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>{initials}</div>
                <div>
                  <div className={styles.authorName}>{pr.prAuthor}</div>
                  <div className={styles.authorTime}>1 file changed · {pr.prAge}</div>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className={styles.sideSection}>
              <div className={styles.sideSectionLabel}>YOUR MISSION</div>
              <div className={styles.missionDesc}>{challenge.desc}</div>
              <div className={styles.levelRow}>
                <span className={styles.levelBadge}>{challenge.level}</span>
                <span className={styles.levelBadge}>{challenge.timeEst}</span>
              </div>
            </div>

            {/* Hints */}
            <div className={styles.sideSection}>
              <div className={styles.sideSectionLabel}>HINTS ({revealedHints.length}/{pr.hints.length} used)</div>
              {pr.hints.map((hint, i) => (
                <div key={i} className={styles.hintItem}>
                  {revealedHints.includes(i) ? (
                    <div className={styles.hintText}>{hint}</div>
                  ) : (
                    <button className={styles.hintRevealBtn} onClick={() => revealHint(i)}>
                      <span className={styles.hintNum}>H{i + 1}</span>
                      Click to reveal hint {i + 1}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Reviewer persona */}
            <div className={styles.sideSectionLast}>
              <div className={styles.sideSectionLabel}>REVIEWING AS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={styles.reviewerAvatar}>SR</div>
                <div>
                  <div className={styles.authorName}>Senior Engineer</div>
                  <div className={styles.authorTime}>@ {reviewerCo} · Backend Platform</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Diff Area ────────────────────────────────────────────────── */}
        <div className={styles.diffArea}>

          {/* Tab bar */}
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >Overview</button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'files' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Files Changed <span className={styles.tabCount}>1</span>
            </button>
          </div>

          {/* FILES tab */}
          {activeTab === 'files' && (
            <div className={styles.diffScroll}>
              <div className={styles.fileBlock}>
                <div className={styles.fileBlockHeader}>
                  <span>
                    {fileDir && <span>{fileDir} / </span>}
                    <strong style={{ color: '#c4b5fd' }}>{fileName}</strong>
                  </span>
                  <span>
                    <span style={{ color: '#86efac' }}>+{additions}</span>
                    {' '}
                    <span style={{ color: '#fca5a5' }}>−{deletions}</span>
                  </span>
                </div>

                <div className={styles.diffTable}>
                  {pr.diff.map((line, idx) => (
                    <div key={idx} className={styles.diffGroup}>
                      <div
                        className={`${styles.diffLineRow} ${
                          line.type === 'addition' ? styles.rowAdd :
                          line.type === 'deletion' ? styles.rowDel : ''
                        }`}
                        onClick={() => line.type !== 'normal' ? setCommentIdx(idx) : undefined}
                      >
                        <div className={`${styles.diffLineNum} ${line.type === 'addition' ? styles.numAdd : line.type === 'deletion' ? styles.numDel : ''}`}>
                          {line.lineNumL ?? ''}
                        </div>
                        <div className={`${styles.diffLineNum} ${line.type === 'addition' ? styles.numAdd : line.type === 'deletion' ? styles.numDel : ''}`}>
                          {line.lineNumR ?? ''}
                        </div>
                        <div className={`${styles.diffPrefix} ${line.type === 'addition' ? styles.prefixAdd : line.type === 'deletion' ? styles.prefixDel : styles.prefixNormal}`}>
                          {line.type === 'addition' ? '+' : line.type === 'deletion' ? '−' : ' '}
                        </div>
                        <div className={`${styles.diffCode} ${line.type === 'addition' ? styles.codeAdd : line.type === 'deletion' ? styles.codeDel : ''}`}>
                          {line.text}
                        </div>
                        {line.type !== 'normal' && (
                          <div
                            className={styles.lineCommentBtn}
                            onClick={e => { e.stopPropagation(); setCommentIdx(idx); }}
                          >+</div>
                        )}
                      </div>

                      {/* Inline comment box */}
                      {commentIdx === idx && (
                        <div className={styles.commentBox}>
                          <div className={styles.commentBoxHeader}>
                            <span>Flag issue on line {line.lineNumR ?? line.lineNumL}</span>
                            <button
                              className={styles.closeCommentBtn}
                              onClick={() => { setCommentIdx(null); setBugType(''); }}
                            >×</button>
                          </div>
                          <div className={styles.bugTypeGrid}>
                            {pr.bugOptions.map(opt => (
                              <button
                                key={opt.value}
                                className={`${styles.bugTypeCard} ${bugType === opt.value ? styles.bugTypeSelected : ''}`}
                                onClick={() => setBugType(opt.value)}
                              >
                                <div className={styles.bugTypeLabel}>{opt.label}</div>
                                <div className={styles.bugTypeSub}>{opt.sub}</div>
                              </button>
                            ))}
                          </div>
                          <div className={styles.commentActions}>
                            <button
                              className={styles.btnGhost}
                              onClick={() => { setCommentIdx(null); setBugType(''); }}
                            >Cancel</button>
                            <button
                              className={`${styles.btnSubmitInline} ${bugType ? styles.btnSubmitReady : ''}`}
                              disabled={!bugType}
                              onClick={handleSubmitReview}
                            >Submit Review →</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OVERVIEW tab */}
          {activeTab === 'overview' && (
            <div className={styles.overviewScroll}>
              <div className={styles.overviewCard}>
                <div className={styles.overviewAuthorRow}>
                  <div className={styles.authorAvatar}>{initials}</div>
                  <div>
                    <div className={styles.authorName}>{pr.prAuthor}</div>
                    <div className={styles.authorTime}>{pr.prAge} · 1 commit</div>
                  </div>
                </div>
                <div className={styles.overviewProse}>
                  <h3>Background</h3>
                  <p>{pr.background}</p>
                  <h3>Changes</h3>
                  <p>{pr.changes}</p>
                  <h3>Testing</h3>
                  <p>{pr.testing}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomHint}>
          {commentIdx !== null
            ? `Line ${pr.diff[commentIdx].lineNumR ?? pr.diff[commentIdx].lineNumL} selected — pick a bug type above and Submit Review`
            : 'Click any changed line (+/−) to flag an issue · or Approve if everything looks safe'}
        </div>
        <div className={styles.bottomActions}>
          <button className={styles.btnApprove} onClick={handleApprove}>
            ✓ Approve PR
          </button>
        </div>
      </div>

      {/* ── Result Overlay ───────────────────────────────────────────────── */}
      {submitted && result && (
        <div className={styles.resultOverlay}>
          <div className={`${styles.resultCard} ${result === 'success' ? styles.successCard : styles.failCard}`}>
            <div className={`${styles.resultIcon} ${result === 'success' ? styles.successIcon : styles.failIcon}`}>
              {result === 'success' ? '✓' : '✕'}
            </div>
            <h2 className={`${styles.resultTitle} ${result === 'success' ? styles.successTitle : styles.failTitle}`}>
              {result === 'success' ? 'Brilliant catch!' : 'You missed a critical bug.'}
            </h2>
            <div className={styles.resultBody}>
              {result === 'success' ? pr.successExplanation : pr.failExplanation}
            </div>
            {result === 'success' && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>
                  +100 XP
                </span>
              </div>
            )}
            <div className={styles.resultActions}>
              <Link href="/challenges" className={styles.btnGhost}>← Back to Challenges</Link>
              {result === 'fail' && (
                <button
                  className={styles.btnRetry}
                  onClick={() => { setSubmitted(false); setResult(null); setCommentIdx(null); setBugType(''); }}
                >Try Again</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
