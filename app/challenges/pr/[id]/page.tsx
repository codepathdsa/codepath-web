'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// Mock Diff data (N+1 query issue)
const MOCK_DIFF = [
  { lineNumL: 14, lineNumR: 14, type: 'normal', text: '    def get_user_profiles(user_ids):' },
  { lineNumL: 15, lineNumR: 15, type: 'normal', text: '        profiles = []' },
  { lineNumL: 16, lineNumR: 16, type: 'normal', text: '        for uid in user_ids:' },
  { lineNumL: 17, lineNumR: null, type: 'deletion', text: '            user = db.query("SELECT * FROM users WHERE id = ?", uid)' },
  { lineNumL: null, lineNumR: 17, type: 'addition', text: '            # Added timeout to prevent hanging' },
  { lineNumL: null, lineNumR: 18, type: 'addition', text: '            user = db.query("SELECT * FROM users WHERE id = ?", uid, timeout=5)' },
  { lineNumL: 18, lineNumR: 19, type: 'normal', text: '            profiles.append(user)' },
  { lineNumL: 19, lineNumR: 20, type: 'normal', text: '        return profiles' },
  { lineNumL: 20, lineNumR: 21, type: 'normal', text: '' },
];

export default function PRWorkspace({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'description' | 'files'>('files');
  const [commentLine, setCommentLine] = useState<number | null>(null);
  const [bugType, setBugType] = useState('none');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const openCommentBox = (lineNumR: number | null) => {
    if (lineNumR) setCommentLine(lineNumR);
  };

  const handleApprove = () => {
    setResult('fail');
    setSubmitted(true);
  };

  const handleSubmitReview = () => {
    if (commentLine === 18 && bugType === 'n_plus_one') {
      setResult('success');
    } else {
      setResult('fail');
    }
    setSubmitted(true);
  };

  return (
    <div className={styles.layout}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/challenges" style={{ color: 'var(--text-tertiary)' }}>←</Link>
          <span className="badge badge-pr">ENG-128</span>
          <span>Add connection timeout to user profile queries</span>
        </div>
        <button className="btn-ghost" style={{ padding: '6px 12px' }}>Leave Workspace</button>
      </div>

      {/* PR Header */}
      <div className={styles.prHeader}>
        <h1 className={styles.prTitle}>
          Feature: Add connection timeout to user profile queries <span>#128</span>
        </h1>
        <div className={styles.prMeta}>
          <span className={styles.badgeOpen}>Open</span>
          <span><strong>junior-dev-99</strong> wants to merge 1 commit into <code className="t-mono" style={{ background: 'var(--bg-raised)', padding: '2px 4px', borderRadius: '4px'}}>main</code> from <code className="t-mono" style={{ background: 'var(--bg-raised)', padding: '2px 4px', borderRadius: '4px'}}>feature/add-timeout</code></span>
          <span>· 2 hours ago</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'description' ? styles.active : ''}`} onClick={() => setActiveTab('description')}>Description</button>
        <button className={`${styles.tab} ${activeTab === 'files' ? styles.active : ''}`} onClick={() => setActiveTab('files')}>Files Changed (1)</button>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        <div className={styles.layoutContent}>
          {activeTab === 'description' && (
            <div className={styles.descContainer}>
              <div className={styles.descHeader}>
                <div className={styles.authorPic}></div>
                <div>
                  <div className={styles.descAuthor}>junior-dev-99</div>
                  <div className={styles.descTime}>commented 2 hours ago</div>
                </div>
              </div>
              <div className={styles.descText}>
                <h3>Background</h3>
                <p>We've been seeing sporadic 502 errors when fetching large lists of user profiles because the database queries occasionally hang. If a query hangs indefinitely, it ties up connection pool resources.</p>
                <h3>Changes</h3>
                <p>I added a 5-second timeout to the <code>db.query</code> call inside <code>get_user_profiles()</code>. If the query exceeds 5 seconds, it will throw an exception instead of blocking the thread.</p>
                <h3>Testing</h3>
                <p>Locally tested and CI passes. Ready for review.</p>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className={styles.diffContainer}>
              <div className={styles.diffHeader}>
                <span>src/services/user_service.py</span>
                <span>-1 additions, +2 deletions</span>
              </div>
              <div className={styles.diffContent}>
                {MOCK_DIFF.map((line, idx) => (
                  <div key={idx} className={styles.diffGroup}>
                    <div 
                      className={styles.diffLine}
                      onClick={() => openCommentBox(line.lineNumR)}
                    >
                      <div className={`${styles.diffNum} ${line.type === 'addition' ? styles.diffNumAddition : line.type === 'deletion' ? styles.diffNumDeletion : styles.diffContentNormal}`}>
                        {line.lineNumL || ' '}
                      </div>
                      <div className={`${styles.diffNum} ${line.type === 'addition' ? styles.diffNumAddition : line.type === 'deletion' ? styles.diffNumDeletion : styles.diffContentNormal}`}>
                        {line.lineNumR || ' '}
                      </div>
                      <div className={`${styles.diffText} ${line.type === 'addition' ? styles.diffContentAddition : line.type === 'deletion' ? styles.diffContentDeletion : styles.diffContentNormal}`}>
                        {line.type === 'addition' && '+'}
                        {line.type === 'deletion' && '-'}
                        {line.type === 'normal' && ' '}
                        {line.text}
                      </div>
                    </div>

                    {/* Inline Comment Box */}
                    {commentLine === line.lineNumR && (
                      <div className={styles.commentBox}>
                        <div className={styles.commentTitle}>
                          Flag an Issue on Line {line.lineNumR}
                          <button className={styles.closeComment} onClick={() => setCommentLine(null)}>&times;</button>
                        </div>
                        <select 
                          className={styles.bugSelector}
                          value={bugType}
                          onChange={(e) => setBugType(e.target.value)}
                        >
                          <option value="none">Select issue type...</option>
                          <option value="sql_injection">SQL Injection Vulnerability</option>
                          <option value="n_plus_one">N+1 Query Issue (Query inside loop)</option>
                          <option value="memory_leak">Memory Leak</option>
                          <option value="logic_error">Business Logic Error</option>
                          <option value="formatting">Formatting/Style Issue</option>
                        </select>
                        <div className={styles.reviewActions}>
                          <button className="btn-ghost" onClick={() => setCommentLine(null)}>Cancel</button>
                          <button className="btn-primary" onClick={handleSubmitReview} disabled={bugType === 'none'}>Submit Review</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strict GitHub-like Bottom Bar for actions if they don't flag anything */}
      <div className={styles.bottomSticky}>
        <button className="btn-ghost" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={() => { setCommentLine(null); handleApprove(); }}>
          Approve PR (Looks Good)
        </button>
        <div style={{ paddingRight: 'var(--space-4)', display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
          Click any line to Request Changes
        </div>
      </div>

      {/* Result Modal */}
      {submitted && result && (
        <div className={styles.resultPanel}>
          <div className={`${styles.resultCard} ${styles.resultCard} ${result === 'success' ? styles.success : styles.fail}`}>
            <div className={`${styles.resultIcon} ${result === 'success' ? styles.success : styles.fail}`}>
              {result === 'success' ? '✓' : '✕'}
            </div>
            <h2 className={styles.resultTitle}>
              {result === 'success' ? 'Brilliant Catch!' : 'You missed a critical issue.'}
            </h2>
            <div className={styles.resultDesc}>
              {result === 'success' ? (
                <>You correctly identified the <strong>N+1 Query Issue</strong> on line 18.<br/>Even though the author added a timeout, establishing a database connection inside a loop for <code>len(user_ids)</code> will cripple the database under load. They need to rewrite this using a <code>WHERE id IN (...)</code> clause.</>
              ) : (
                <>You missed the <strong>N+1 Query Issue</strong>. The author added a timeout to the database call, but the call is still inside the <code>for uid in user_ids</code> loop. If they pass 1,000 users, this executes 1,000 queries sequentially, triggering connection pool exhaustion.</>
              )}
            </div>
            
            {result === 'success' && <div className="badge badge-active" style={{ fontSize: 'var(--text-lg)', padding: '6px 12px', margin: '0 auto var(--space-6)', display: 'inline-flex' }}>+100 XP</div>}
            
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <Link href="/challenges" className="btn-ghost">Return to Dashboard</Link>
              {result === 'fail' && <button className="btn-primary" onClick={() => { setSubmitted(false); setResult(null); }}>Try Again</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
