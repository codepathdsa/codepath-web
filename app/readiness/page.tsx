'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ReadinessReport() {
  const [activeCompany, setActiveCompany] = useState<'All' | 'Meta' | 'Stripe' | 'Google'>('Meta');

  // Hardcode data based on Meta mockup vs Stripe mockup
  const score = activeCompany === 'Meta' ? 75 : activeCompany === 'Stripe' ? 52 : 68;
  const strokeOffset = 565 - ((565 * score) / 100); 

  // Colors adapt based on score
  const scoreColor = score >= 70 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-error)';

  const RADAR = [
    { label: 'Data Structures', color: 'dsa', score: activeCompany === 'Meta' ? 88 : 70 },
    { label: 'System Design', color: 'sys', score: activeCompany === 'Meta' ? 62 : 45 },
    { label: 'PR / Code Review', color: 'pr', score: activeCompany === 'Meta' ? 74 : 60 },
    { label: 'Incident Response', color: 'war', score: activeCompany === 'Meta' ? 80 : 55 },
    { label: 'Behavioral', color: 'com', score: activeCompany === 'Meta' ? 95 : 95 },
  ];

  const TOPICS = [
    { id: 't1', name: 'Distributed Caching', status: 'red', solved: '2/12', avgTime: '45m 12s', wrEx: '0/3', rec: 'ENG-402' },
    { id: 't2', name: 'Sliding Window', status: 'yellow', solved: '8/14', avgTime: '18m 05s', wrEx: '1/1', rec: 'ENG-112' },
    { id: 't3', name: 'Graph Traversal', status: 'green', solved: '18/18', avgTime: '12m 40s', wrEx: '2/2', rec: null },
    { id: 't4', name: 'Idempotency', status: 'red', solved: '1/8', avgTime: '65m 00s', wrEx: '0/2', rec: 'ENG-304' }
  ];

  return (
    <div className={styles.layout}>
      <nav className={styles.topNav}>
        <Link href="/" className={styles.navLogo}>engprep<span></span></Link>
        <div className={styles.navLinks}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/challenges">Challenges</Link>
          <Link href="/readiness" className={styles.active}>Readiness Report</Link>
          <Link href="/discussions">Discussions</Link>
        </div>
        <div className={styles.navProfile}>VP</div>
      </nav>

      <main className={styles.mainContainer}>
        <div>
          <h1 className={styles.headerTitle}>Interview Readiness</h1>
          <p className={styles.headerSub}>Real-time analysis of your architectural and algorithmic confidence.</p>
        </div>

        <div className={styles.readinessSection}>
          {/* Left panel - Overall Score */}
          <div className={styles.scorePanel}>
            {score >= 70 && <div className={styles.scoreGradient} style={{ background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 60%)' }}></div>}
            {score < 60 && <div className={styles.scoreGradient} style={{ background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, transparent 60%)' }}></div>}

            <div className={styles.scoreTabs}>
              <button className={`${styles.scoreTab} ${activeCompany === 'All' ? styles.active : ''}`} onClick={() => setActiveCompany('All')}>Overall</button>
              <button className={`${styles.scoreTab} ${activeCompany === 'Meta' ? styles.active : ''}`} onClick={() => setActiveCompany('Meta')}>Meta</button>
              <button className={`${styles.scoreTab} ${activeCompany === 'Stripe' ? styles.active : ''}`} onClick={() => setActiveCompany('Stripe')}>Stripe</button>
              <button className={`${styles.scoreTab} ${activeCompany === 'Google' ? styles.active : ''}`} onClick={() => setActiveCompany('Google')}>Google</button>
            </div>

            <div className={styles.circularGauge}>
              <svg className={styles.gaugeSvg} viewBox="0 0 200 200">
                <circle className={styles.gaugeCircleBg} cx="100" cy="100" r="90" />
                <circle 
                  className={styles.gaugeCircleFill} 
                  cx="100" cy="100" r="90" 
                  style={{ strokeDashoffset: strokeOffset, stroke: scoreColor }} 
                />
              </svg>
              <div className={styles.gaugeText}>
                <div className={styles.gaugePct}>{score}</div>
                <div className={styles.gaugeLabel}>Score</div>
              </div>
            </div>

            {score >= 70 ? (
              <div className={styles.scoreAlert}>
                You are <b>highly prepared</b> for {activeCompany}. Your algorithms and behavioral pillars exceed standard loop requirements.
              </div>
            ) : (
              <div className={styles.scoreAlert} style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-error)'}}>
                You need more work on <b>{activeCompany}</b> architecture constraints. Specifically, your metrics for API Idempotency are blocking.
              </div>
            )}
          </div>

          {/* Right panel - Pillars Radar */}
          <div className={styles.radarPanel}>
            <h2 className={styles.radarTitle}>Pillar Breakdown</h2>
            <div className={styles.barList}>
              {RADAR.map((item) => (
                <div className={styles.barRow} key={item.color}>
                  <div className={styles.barLabel}>{item.label}</div>
                  <div className={styles.barTrack}>
                    <div 
                      className={`${styles.barFill} ${styles[item.color]}`} 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <div className={styles.barNum}>{item.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className={styles.masterySection}>
          <div className={styles.masteryHeader}>
            <h2 className={styles.radarTitle} style={{ margin: 0 }}>Topic Mastery</h2>
            <div className={styles.masteryFilters}>
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>Needs Work (2)</button>
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>All Topics</button>
            </div>
          </div>

          <div className={styles.masteryGrid}>
            {TOPICS.map((topic) => (
              <div className={styles.topicRow} key={topic.id}>
                <div className={styles.topicInfo}>
                  <div className={`${styles.topicDot} ${styles[topic.status]}`}></div>
                  <div className={styles.topicName}>{topic.name}</div>
                </div>

                <div className={styles.topicStats}>
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Solved</span>
                    <span className={styles.statVal}>{topic.solved}</span>
                  </div>
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Avg Time</span>
                    <span className={styles.statVal}>{topic.avgTime}</span>
                  </div>
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Incident Exp.</span>
                    <span className={styles.statVal}>{topic.wrEx}</span>
                  </div>
                </div>

                <div>
                  {topic.status === 'red' ? (
                    <Link href={`/challenges/dsa/${topic.rec}`} className={`${styles.trainBtn} ${styles.urgent}`}>
                      Train Weakness →
                    </Link>
                  ) : topic.status === 'yellow' ? (
                    <button className={styles.trainBtn}>Review Theory</button>
                  ) : (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, paddingRight: '12px' }}>✓ MASTERED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
