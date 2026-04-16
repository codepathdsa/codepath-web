'use client';

import Link from 'next/link';
import { useState } from 'react';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

const ROADMAP_DATA = {
  junior: [
    {
      id: 'fundamentals',
      title: 'Contextual Fundamentals',
      desc: 'Master the core data structures and algorithms, but framed around real-world tickets instead of abstract math problems.',
      completed: true,
      tags: ['badge-dsa'],
      courses: [
        { title: 'ENG-402: Double-Billing Bug', badge: 'badge-dsa', label: 'Contextual DSA', status: 'Completed' },
        { title: 'ENG-405: Rate Limiter Window', badge: 'badge-dsa', label: 'Contextual DSA', status: 'Completed' }
      ]
    },
    {
      id: 'pr-basics',
      title: 'PR Review Basics',
      desc: 'Learn to read other peoples code under pressure. Find memory leaks, N+1 queries, and race conditions before they merge.',
      completed: false,
      tags: ['badge-pr'],
      courses: [
        { title: 'ENG-128: Add Batching PR', badge: 'badge-pr', label: 'PR Review', status: 'In Progress' },
        { title: 'ENG-115: Legacy Refactor', badge: 'badge-pr', label: 'PR Review', status: 'Not Started' }
      ]
    },
    {
      id: 'war-entry',
      title: 'Incident Response (L1)',
      desc: 'Your first time on call. Learn to read metrics, parse logs cleanly, and stop the bleeding before hunting for root causes.',
      completed: false,
      tags: ['badge-war'],
      courses: [
        { title: 'ENG-911: Redis Cache Drop', badge: 'badge-war', label: 'War Room', status: 'Not Started' }
      ]
    }
  ],
  mid: [
    {
      id: 'sysd-fund',
      title: 'Architecture & Scalability',
      desc: 'Moving from writing functions to designing systems. Understand load balancing, caching layers, and database sharding.',
      completed: false,
      tags: ['badge-design'],
      courses: [
        { title: 'ENG-512: Global Rate Limiter', badge: 'badge-design', label: 'System Design', status: 'In Progress' },
        { title: 'ENG-503: Leaderboard Architecture', badge: 'badge-design', label: 'System Design', status: 'Not Started' }
      ]
    },
    {
      id: 'autopsy',
      title: 'Architecture Autopsies',
      desc: 'Diagnose fatal bottlenecks in systems that have outgrown their scale. Find the SPOF before it crashes production.',
      completed: false,
      tags: ['badge-design', 'badge-war'],
      courses: [
        { title: 'ENG-602: The 10M User Wall', badge: 'badge-design', label: 'System Design', status: 'Not Started' }
      ]
    }
  ],
  senior: [
    {
      id: 'tech-debt',
      title: 'Tech Debt Tribunal',
      desc: 'Prioritize backlogs of technical debt based on blast radius, security risk, and PM impact.',
      completed: false,
      tags: ['badge-war'],
      courses: [
        { title: 'ENG-801: Q3 Tech Debt Sizing', badge: 'badge-war', label: 'Tribunal', status: 'Not Started' }
      ]
    },
    {
      id: 'war-staff',
      title: 'Cascade Failures (Staff Level)',
      desc: 'Multi-service degradation. Debug across microservices where the root cause is three traces deep.',
      completed: false,
      tags: ['badge-war'],
      courses: [
        { title: 'ENG-999: The Circular Dependency', badge: 'badge-war', label: 'War Room', status: 'Not Started' }
      ]
    }
  ]
};

export default function RoadmapPage() {
  const [track, setTrack] = useState<'junior' | 'mid' | 'senior'>('junior');

  const activeData = ROADMAP_DATA[track];

  return (
    <div className={styles.layout}>
      {/* Universal Top Nav */}
      <AppNav />

      <main className={styles.mainContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Engineering Roadmap</h1>
          <p className={styles.subtitle}>
            A structured progression path from fixing localized algorithmic inefficiencies to designing deeply scalable systems and leading architectural tribunals.
          </p>
          
          <div className={styles.trackSelector}>
            <button 
              className={`${styles.trackBtn} ${track === 'junior' ? styles.active : ''}`}
              onClick={() => setTrack('junior')}
            > Junior (Entry) </button>
            <button 
              className={`${styles.trackBtn} ${track === 'mid' ? styles.active : ''}`}
              onClick={() => setTrack('mid')}
            > Mid (SDE II) </button>
            <button 
              className={`${styles.trackBtn} ${track === 'senior' ? styles.active : ''}`}
              onClick={() => setTrack('senior')}
            > Senior (Staff) </button>
          </div>
        </div>

        <div className={styles.timeline}>
          {activeData.map((node) => (
            <div key={node.id} className={styles.timelineNode}>
              <div className={styles.nodeMarker}>
                <div className={`${styles.dot} ${node.completed ? styles.completed : ''}`}></div>
              </div>
              <div className={styles.nodeContent}>
                <div className={styles.nodeHeader}>
                  <div>
                    <h2 className={styles.nodeTitle}>{node.title}</h2>
                    <p className={styles.nodeDesc}>{node.desc}</p>
                  </div>
                  <div className={styles.nodeMeta}>
                    {node.tags.map(tag => (
                      <span key={tag} className={`badge ${tag}`}>
                        {tag.replace('badge-', '').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.courseList}>
                  {node.courses.map((course, idx) => (
                    <Link key={idx} href="/challenges" className={styles.courseItem}>
                      <div className={styles.courseItemLeft}>
                        <span className={`badge ${course.badge}`}>{course.label}</span>
                        <span className={styles.courseItemTitle}>{course.title}</span>
                      </div>
                      <span className={styles.courseStatus}>{course.status}</span>
                    </Link>
                  ))}
                </div>

                {node.id === 'war-entry' && (
                  <div className={styles.terminalOverlay}>
                    <div className={styles.terminalLine}><span>$</span><span>engprep status --track=war-room</span></div>
                    <div className={styles.terminalLine}><span>&gt;</span><span style={{opacity: 0.7}}>Awaiting deployment. Master the basics before pager duty starts.</span></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
