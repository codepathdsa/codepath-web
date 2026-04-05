'use client';

import Link from 'next/link';
import styles from './page.module.css';

import { ACTIVITY_EVENTS } from '@/lib/activity';

// Convert telemetry feed into actionable density bounds for the Github-style graph
const generateHeatmapData = () => {
  const cols = [];
  const now = new Date();
  
  // Build a O(N) lookup dictionary mapping YYYY-MM-DD -> Activity Array
  const activityMap: Record<string, typeof ACTIVITY_EVENTS> = {};
  for (const ev of ACTIVITY_EVENTS) {
    const dStr = new Date(ev.timestamp).toISOString().split('T')[0];
    if (!activityMap[dStr]) activityMap[dStr] = [];
    activityMap[dStr].push(ev);
  }

  // Iterate backwards 364 days representing a 52x7 matrix trailing today
  for (let i = 0; i < 52; i++) {
    const col = [];
    for (let j = 0; j < 7; j++) {
      const daysAgo = (51 - i) * 7 + (6 - j);
      const targetDate = new Date(now.getTime() - daysAgo * 86400000);
      const dStr = targetDate.toISOString().split('T')[0];
      
      const eventsOnDay = activityMap[dStr] || [];
      const count = eventsOnDay.length;
      
      // Map arbitrary activity volume onto explicit levels 0-4
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;

      const title = count === 0 
        ? `No activity on ${dStr}` 
        : `${count} activities on ${dStr}\n- ${eventsOnDay.map(e => e.title).join('\n- ')}`;

      col.push({ level, title });
    }
    cols.push(col);
  }
  return cols;
};

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [heatmapData, setHeatmapData] = useState<{level: number, title: string}[][]>([]);

  useEffect(() => {
    setHeatmapData(generateHeatmapData());
  }, []);

  // Pre-fill an empty grid layout pattern for SSR to prevent layout shift
  const emptyGrid = Array.from({ length: 52 }, () => 
    Array.from({ length: 7 }, () => ({ level: 0, title: 'Loading...' }))
  );

  const displayData = heatmapData.length > 0 ? heatmapData : emptyGrid;

  return (
    <div className={styles.layout}>
      {/* 9.1 Top Web Navigation */}
      <nav className={styles.topNav}>
        <Link href="/" className={styles.navLogo}>
          engprep<span></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/dashboard" className={styles.active}>Dashboard</Link>
          <Link href="/challenges">Challenges</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/discussions">Discussions</Link>
        </div>
        <div className={styles.navActions}>
          <div className="badge badge-pro">PRO ACTIVE</div>
          <div className={styles.navProfile}>VP</div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.greeting}>Welcome back, Venkateshwaran.</h1>
            <div className={styles.roleBadge}>
              <span className="badge badge-active">SDE II Track</span>
              <span>Targeting: Meta, Stripe, Notion</span>
            </div>
          </div>
          <div className={styles.xpWidget}>
            <span className={styles.xpText}>Total XP</span>
            <span className={styles.xpVal}>12,450</span>
            <span className={styles.lvlBadge}>Lvl 14</span>
          </div>
        </div>

        {/* 9.2 Quick Resume */}
        <div className={styles.resumeCard}>
          <div className={styles.resumeLeft}>
            <div className={styles.resumeTags}>
              <span className="badge badge-design">System Design</span>
              <span className="badge badge-active">In Progress</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)'}}>ENG-512</span>
            </div>
            <h2 className={styles.resumeTitle}>Global Rate Limiter Design</h2>
            <p className={styles.resumeDesc}>
              You have 3 out of 5 architecture constraints met. Need to figure out the distributed 
              sync mechanism before the load balancer allows the transaction.
            </p>
          </div>
          <div>
            <Link href="/challenges/system-design/512" className="btn-primary" style={{ padding: '12px 24px' }}>
              Jump Back In →
            </Link>
          </div>
        </div>

        {/* 9.3 Core Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Challenges Completed</div>
            <div className={styles.metricValue}>42 <span style={{fontSize: '14px', color:'var(--text-tertiary)', fontWeight: 'normal'}}>/ 150</span></div>
            <div className={styles.metricBar}><div className={styles.metricBarFill} style={{ width: '28%' }}></div></div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Code Reviews Done</div>
            <div className={styles.metricValue}>14</div>
            <div className={styles.metricBar}><div className={styles.metricBarFill} style={{ width: '60%', background: 'var(--color-success)' }}></div></div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>War Rooms Survived</div>
            <div className={styles.metricValue}>3</div>
            <div className={styles.metricBar}><div className={styles.metricBarFill} style={{ width: '20%', background: '#f59e0b' }}></div></div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Current Streak</div>
            <div className={styles.metricValue}>5 Days</div>
            <span style={{ fontSize: '13px', color: 'var(--color-warning)', fontWeight: 500 }}>🔥 Keep it up!</span>
          </div>
        </div>

        {/* 9.4 Activity Heatmap */}
        <div className={styles.heatmapSection}>
          <div className={styles.sectionTitle}>
            Engineering Activity
            <Link href="/activity" className={styles.sectionAction}>View full log →</Link>
          </div>
          <div className={styles.heatmapGrid}>
            {displayData.map((col, x) => (
              <div key={x} className={styles.heatCol}>
                {col.map((cell, y) => (
                  <div key={y} className={`${styles.heatCell} ${styles[`l${cell.level}`]}`} title={cell.title}></div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)'}}>
            Less
            <div className={`${styles.heatCell}`}></div>
            <div className={`${styles.heatCell} ${styles.l1}`}></div>
            <div className={`${styles.heatCell} ${styles.l2}`}></div>
            <div className={`${styles.heatCell} ${styles.l3}`}></div>
            <div className={`${styles.heatCell} ${styles.l4}`}></div>
            More
          </div>
        </div>

        {/* 9.5 Recommended Next Steps */}
        <div className={styles.sectionTitle} style={{ marginBottom: 0, marginTop: 'var(--space-4)'}}>Recommended For You</div>
        <div className={styles.recGrid}>
          <div className={styles.recCard}>
            <div className={styles.recReason}>Weakness Targeted: Distributed Caching</div>
            <div className={styles.recTitle}>ENG-402: Payment system double-billing</div>
            <div className={styles.recDesc}>
              Since you struggled with Redis synchronization in the Global Rate Limiter, this contextual DSA challenge tests your ability to identify dirty cache reads in a high-throughput transaction loop.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span className="badge badge-dsa">Contextual DSA</span>
              <Link href="/challenges/dsa/402" className="btn-ghost" style={{ padding: '8px 16px' }}>Start module</Link>
            </div>
          </div>

          <div className={styles.recCard}>
            <div className={styles.recReason}>Milestone Goal: System Design Basics</div>
            <div className={styles.recTitle}>ENG-128: PR - Add connection timeout</div>
            <div className={styles.recDesc}>
              Review a junior engineer's PR that adds database timeouts. Spot the fatal N+1 connection pool leak before it hits the main branch and takes down staging.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span className="badge badge-pr">PR Review</span>
              <Link href="/challenges/pr/128" className="btn-ghost" style={{ padding: '8px 16px' }}>Review Code</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
