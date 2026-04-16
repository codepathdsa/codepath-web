'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

import { ACTIVITY_EVENTS } from '@/lib/activity';

export default function ActivityLog() {
  const [filter, setFilter] = useState<'all' | 'dsa' | 'war' | 'pr' | 'design' | 'tribunal'>('all');

  // Filter out the 'historical' background noise from the explicit audit log feed
  const highlightEvents = ACTIVITY_EVENTS.filter(e => !e.id.startsWith('hist-'));
  const filteredEvents = filter === 'all' ? highlightEvents : highlightEvents.filter(e => e.type === filter);

  return (
    <div className={styles.layout}>
      <AppNav />

      <main className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Audit Log</h1>
            <p className={styles.subtitle}>An immutable ledger of your engineering decisions, pull requests, and incident resolutions.</p>
          </div>
          <div className={styles.filters}>
            <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All Activity</button>
            <button className={`${styles.filterBtn} ${filter === 'war' ? styles.active : ''}`} onClick={() => setFilter('war')}>War Room</button>
            <button className={`${styles.filterBtn} ${filter === 'pr' ? styles.active : ''}`} onClick={() => setFilter('pr')}>Reviews</button>
            <button className={`${styles.filterBtn} ${filter === 'dsa' ? styles.active : ''}`} onClick={() => setFilter('dsa')}>DSA</button>
          </div>
        </div>

        <div className={styles.timeline}>
          {filteredEvents.map(event => (
            <div key={event.id} className={styles.event}>
              <div className={`${styles.eventIcon} ${styles[event.type]}`}></div>
              <span className={styles.eventDate}>{event.dateStr}</span>
              <div className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <div>
                    <span className={`badge ${event.badge}`} style={{ marginBottom: '8px' }}>
                      {event.type === 'war' ? 'WAR ROOM' : event.type.toUpperCase()}
                    </span>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                  </div>
                  <div className={styles.xpBadge}>+{event.xp} XP</div>
                </div>
                <p className={styles.eventDesc}>{event.desc}</p>
                
                <div className={styles.eventMetrics}>
                  {event.stats.map(s => (
                    <div key={s.label} className={styles.metric}>
                      {s.label}: <strong>{s.value}</strong>
                    </div>
                  ))}
                  <div className={styles.metric} style={{ marginLeft: 'auto' }}>
                    <Link href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>View Trace</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '13px', paddingTop: '32px' }}>
              &gt; No telemetry logs found for this filter.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
