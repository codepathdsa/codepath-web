'use client';

import { useState, useEffect } from 'react';
import { ROADMAP } from './data';
import { useProgress } from './hooks/useProgress';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const { solvedState, toggleSolve, streak } = useProgress();
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({ l1: true });
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const solvedCount = Object.keys(solvedState).length;
  const totalCount = ROADMAP.reduce((acc, lvl) => acc + lvl.topics.reduce((a, t) => a + t.problems_list.length, 0), 0);
  const percent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const handleToggleLevel = (id: string) => {
    setOpenLevels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleTopic = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-logo">Code<span>Path</span></Link>
        <ul className="nav-links">
          <li><Link href="#practice">Practice</Link></li>
          <li><Link href="#why">Why Written?</Link></li>
          <li><span style={{color:'var(--muted)', fontSize:'0.82rem'}}>✓ {solvedCount} solved</span></li>
          {!user ? (
            <li><Link href="/login" style={{ color: 'var(--ink2)', fontWeight: 500 }}>Log in</Link></li>
          ) : (
            <li><button onClick={() => createClient().auth.signOut()} style={{ background: 'none', border: 'none', color: 'var(--ink2)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>Log out</button></li>
          )}
          <li><Link href="#practice" className="nav-cta">Start Free →</Link></li>
        </ul>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">Written-first  No videos  No paywall</div>
              <h1 className="hero-headline">
                Learn DSA the way<br/>
                <em>books taught CS.</em>
              </h1>
              <p className="hero-sub">
                Deep written editorials for every problem. Clear explanations, multiple approaches, complexity analysis  all free. No subscription required. Ever.
              </p>
              <div className="hero-actions">
                <Link href="#practice" className="btn btn--primary">Start Practicing →</Link>
                <Link href="#why" className="btn btn--outline">Why written? </Link>
              </div>
              <div className="hero-proof">
                <div className="proof-item"><span className="proof-num">500+</span><span className="proof-label">Free problems</span></div>
                <div className="proof-divider"></div>
                <div className="proof-item"><span className="proof-num">100%</span><span className="proof-label">Free, forever</span></div>
                <div className="proof-divider"></div>
                <div className="proof-item"><span className="proof-num">3</span><span className="proof-label">Faster to read than watch</span></div>
              </div>
            </div>
            
            <div className="preview-card reveal" style={{ opacity: 1, transform: 'none' }}>
              <div className="preview-header">
                <div className="preview-dot" style={{background:'#ff5f57'}}></div>
                <div className="preview-dot" style={{background:'#febc2e'}}></div>
                <div className="preview-dot" style={{background:'#28c840'}}></div>
                <span className="preview-title">two-sum.html  CodePath Editorial</span>
              </div>
              <div className="preview-body">
                <div className="preview-problem-title">#1. Two Sum</div>
                <div className="preview-tags">
                  <span className="badge badge--easy">Easy</span>
                  <span className="badge badge--topic">Arrays</span>
                  <span className="badge badge--topic">Hashing</span>
                </div>
                <div className="preview-section-label">Intuition</div>
                <p className="preview-text">The brute force checks every pair in O(n). But we can do better: for each number <code>x</code>, we need to know if <code>target - x</code> already exists. A hash map gives us O(1) lookup</p>
                <div className="preview-insight"><p>ð Key insight: store what you've <em>seen</em>, check what you <em>need</em>. One pass, no second loop.</p></div>
              </div>
              <div className="preview-footer">
                <div className="complexity-pills"><span className="cpill">T: O(n)</span><span className="cpill">S: O(n)</span></div>
                <span>3 approaches  5 min read</span>
              </div>
            </div>
          </div>
        </section>

        <section id="practice" className="practice-section">
          <div className="practice-header">
            <div className="practice-header-inner">
              <div className="section-eyebrow">Structured Practice Path</div>
              <h2 className="page-title">DSA Practice — Zero to FAANG Ready</h2>
              <p className="page-sub">8 levels &middot; 16 topics &middot; 500+ problems. Follow the tree in order &mdash; written editorials, all free.</p>
              
              <div className="stats-bar">
                <div className="stat-item"><div className="stat-num">{solvedCount}</div><div className="stat-label">Solved</div></div>
                <div className="stat-divider"></div>
                <div className="stat-item"><div className="stat-num">500<span style={{color:'var(--accent)'}}>+</span></div><div className="stat-label">Total problems</div></div>
                <div className="stat-divider"></div>
                <div className="stat-item"><div className="stat-num">8</div><div className="stat-label">Levels</div></div>
                <div className="stat-divider"></div>
                <div className="stat-item"><div className="stat-num">{streak}</div><div className="stat-label">🔥 Day streak</div></div>
                <div className="overall-bar-wrap">
                  <div className="overall-bar-label"><span>Overall progress</span><span>{percent}%</span></div>
                  <div className="overall-bar"><div className="overall-bar-fill" style={{width: `${percent}%`}}></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="roadmap-wrap" id="roadmap-root">
            {ROADMAP.map((lvl) => {
              const allP = lvl.topics.flatMap(t => t.problems_list);
              const s = allP.filter(p => solvedState[p.slug]?.status === 'solved').length;
              const t = allP.length;
              const complete = t > 0 && s === t;
              const active = !complete && s > 0;
              const isOpen = openLevels[lvl.id];

              let stateClass = '';
              if (complete) stateClass = 'completed';
              else if (active) stateClass = 'active';

              return (
                <div key={lvl.id} className={`level-block ${stateClass} ${isOpen ? 'open' : ''}`} id={lvl.id}>
                  <div className="level-header" onClick={() => handleToggleLevel(lvl.id)}>
                    <div className="level-badge">{complete ? '✓' : lvl.level}</div>
                    <div className="level-meta">
                      <div className="level-name">Level {lvl.level} — {lvl.name}</div>
                      <div className="level-desc">{lvl.desc}</div>
                    </div>
                    <div className="level-progress-pill">{complete ? 'Complete ✓' : `${s} / ${t}`}</div>
                    <span className="level-chevron">►</span>
                  </div>
                  
                  {isOpen && (
                    <div className="level-body">
                      {lvl.topics.map(topic => {
                        const ts = topic.problems_list.filter(p => solvedState[p.slug]?.status === 'solved').length;
                        const tt = topic.problems_list.length;
                        const isTopicOpen = openTopics[topic.id];
                        let topicState = '';
                        if (tt > 0 && ts === tt) topicState = 't-solved';
                        else if (ts > 0) topicState = 't-partial';

                        return (
                          <div key={topic.id} className={`topic-row ${topicState} ${isTopicOpen ? 'open' : ''}`}>
                            <div className="topic-card-tree">
                              <div className="topic-card-top" onClick={(e) => handleToggleTopic(topic.id, e)}>
                                <div className="topic-icon-wrap">{topic.icon}</div>
                                <div className="topic-info">
                                  <div className="topic-name-tree">{topic.name}</div>
                                  <div className="topic-chips">
                                    <span className={`chip ${topic.difficulty === 'easy' ? 'easy' : topic.difficulty === 'medium' ? 'med' : 'hard'}`}>{topic.difficulty}</span>
                                    <span className="chip">{topic.articles} articles</span>
                                  </div>
                                </div>
                                <div className="topic-right">
                                  <div className="topic-counts"><strong>{ts}</strong> / {tt} solved</div>
                                </div>
                                <button className="topic-expand-btn">▼</button>
                              </div>
                              
                              {isTopicOpen && (
                                <div className="problem-list">
                                  {topic.problems_list.map(p => {
                                    const isSolved = solvedState[p.slug]?.status === 'solved';
                                    return (
                                      <Link key={p.slug} className="problem-item" href={`/${p.slug}`}>
                                        <span 
                                          className={`p-status ${isSolved ? 'solved' : ''}`} 
                                          onClick={(e) => { e.preventDefault(); toggleSolve(p.slug); }}
                                        ></span>
                                        <span className="p-num">{p.num}</span>
                                        <span className="p-name">{p.name}</span>
                                        <span className={`p-diff diff-${p.diff.toLowerCase()}`}>{p.diff === 'E' ? 'Easy' : p.diff === 'M' ? 'Med' : 'Hard'}</span>
                                        <span className="p-read">Read →</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">Code<span>Path</span></div>
            <p>Written DSA prep for engineers who prefer reading over watching. Free forever.</p>
          </div>
          <div className="footer-col">
            <h5>Learn</h5>
            <ul>
              <li><Link href="#practice">Practice</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CodePath · Free forever · Open source</span>
          <span>Made with ♥ for every engineer</span>
        </div>
      </footer>
    </>
  );
}
