'use client';

import { useState } from 'react';
import { ROADMAP } from './data';
import { useProgress } from './hooks/useProgress';
import Link from 'next/link';

export default function Home() {
  const { solvedState, toggleSolve, streak } = useProgress();
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({ l1: true });
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});

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
          <li><Link href="#practice" className="nav-cta">Start Free →</Link></li>
        </ul>
      </nav>

      <main className="editorial-layout">
        <header className="hero" style={{ textAlign: 'center', padding: '80px 5%', maxWidth: 800, margin: '0 auto' }}>
          <div className="hero-badge" style={{ display: 'inline-block', padding: '6px 14px', background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, marginBottom: 20 }}>
            Now in open beta
          </div>
          <h1 style={{ fontSize: '3.4rem', fontFamily: 'var(--serif)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24 }}>
            Stop watching. <br/>Start reading.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--ink2)', marginBottom: 40, lineHeight: 1.6 }}>
            Master Data Structures & Algorithms through clear written explanations, structured roadmaps, and 500+ free problems. No videos, no fluff.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="#practice" className="btn btn--primary">Start Practicing →</Link>
            <Link href="#why" className="btn btn--ghost">Why Written?</Link>
          </div>
        </header>

        <section id="practice" className="container" style={{ paddingTop: 80, paddingBottom: 100 }}>
          <div className="stats-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: 8 }}>The Practice Tree</h2>
              <p style={{ color: 'var(--muted)' }}>Solve top-down. Do not skip levels.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--accent)', lineHeight: 1 }}>{solvedCount}</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginTop: 4 }}>of {totalCount} Solved</div>
            </div>
          </div>

          <div id="roadmap-root">
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
                                      <Link key={p.slug} className="problem-item" href={`/${p.slug}.html`}>
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
