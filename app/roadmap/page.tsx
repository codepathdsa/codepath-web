'use client';

import Link from 'next/link';
import { useState } from 'react';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

/* ─── Data ───────────────────────────────────────────────────────────────── */
type Status = 'done' | 'active' | 'locked';
type TagKey = 'dsa' | 'pr' | 'war' | 'design' | 'tribunal';

interface Course {
  title: string;
  tag: TagKey;
  label: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  xp: number;
}

interface Node {
  id: string;
  step: number;
  title: string;
  desc: string;
  status: Status;
  xp: number;
  tags: TagKey[];
  courses: Course[];
  terminalHint?: string;
}

const TAG_META: Record<TagKey, { color: string; bg: string; label: string; icon: string }> = {
  dsa:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'DSA',      icon: '⚡' },
  pr:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'PR Review',icon: '🔎' },
  war:      { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'War Room', icon: '🔥' },
  design:   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'System Design', icon: '🏗' },
  tribunal: { color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', label: 'Tribunal', icon: '⚖️' },
};

const TRACKS: Record<'junior' | 'mid' | 'senior', { label: string; sublabel: string; color: string; nodes: Node[] }> = {
  junior: {
    label: 'Junior',
    sublabel: 'Entry–SDE I',
    color: '#3b82f6',
    nodes: [
      {
        id: 'fundamentals', step: 1,
        title: 'Contextual Fundamentals',
        desc: 'Master data structures and algorithms through real production tickets — not abstract textbook exercises.',
        status: 'done', xp: 800, tags: ['dsa'],
        courses: [
          { title: 'ENG-402: Double-Billing Bug',   tag: 'dsa', label: 'Contextual DSA', status: 'Completed',  xp: 400 },
          { title: 'ENG-405: Rate Limiter Window',  tag: 'dsa', label: 'Contextual DSA', status: 'Completed',  xp: 400 },
        ],
      },
      {
        id: 'pr-basics', step: 2,
        title: 'PR Review Basics',
        desc: "Read other people's code under pressure. Hunt memory leaks, N+1 queries, and race conditions before they ship.",
        status: 'active', xp: 600, tags: ['pr'],
        courses: [
          { title: 'ENG-128: Add Batching PR',   tag: 'pr', label: 'PR Review', status: 'In Progress',  xp: 300 },
          { title: 'ENG-115: Legacy Refactor',   tag: 'pr', label: 'PR Review', status: 'Not Started',  xp: 300 },
        ],
      },
      {
        id: 'war-entry', step: 3,
        title: 'Incident Response — L1',
        desc: 'Your first page. Read metrics, parse logs, stop the bleeding. Root cause hunting comes after you silence the alarm.',
        status: 'locked', xp: 700, tags: ['war'],
        courses: [
          { title: 'ENG-911: Redis Cache Drop', tag: 'war', label: 'War Room', status: 'Not Started', xp: 700 },
        ],
        terminalHint: '$ engprep status --track=war-room\n> Awaiting deployment. Unlock PR Basics first.',
      },
    ],
  },
  mid: {
    label: 'Mid',
    sublabel: 'SDE II',
    color: '#8b5cf6',
    nodes: [
      {
        id: 'sysd-fund', step: 1,
        title: 'Architecture & Scalability',
        desc: 'Stop writing functions — start designing systems. Load balancers, cache topologies, database sharding under real read pressure.',
        status: 'active', xp: 900, tags: ['design'],
        courses: [
          { title: 'ENG-512: Global Rate Limiter',       tag: 'design', label: 'System Design', status: 'In Progress', xp: 450 },
          { title: 'ENG-503: Leaderboard Architecture',  tag: 'design', label: 'System Design', status: 'Not Started', xp: 450 },
        ],
      },
      {
        id: 'autopsy', step: 2,
        title: 'Architecture Autopsies',
        desc: 'Diagnose systems that have outgrown themselves. Find the SPOF before 3 AM finds you.',
        status: 'locked', xp: 1000, tags: ['design', 'war'],
        courses: [
          { title: 'ENG-602: The 10M User Wall', tag: 'design', label: 'System Design', status: 'Not Started', xp: 1000 },
        ],
      },
      {
        id: 'advanced-pr', step: 3,
        title: 'Security & Threat Modeling',
        desc: 'Spot injection vectors, broken auth patterns, and privilege escalation in code review before it becomes a CVE.',
        status: 'locked', xp: 850, tags: ['pr', 'war'],
        courses: [
          { title: 'ENG-701: Auth Bypass PR',    tag: 'pr', label: 'PR Review', status: 'Not Started', xp: 425 },
          { title: 'ENG-715: SSRF Mitigation',   tag: 'pr', label: 'PR Review', status: 'Not Started', xp: 425 },
        ],
        terminalHint: '$ engprep unlock --module=security\n> Requires: Architecture & Scalability ✓',
      },
    ],
  },
  senior: {
    label: 'Senior',
    sublabel: 'L5–Staff',
    color: '#62de61',
    nodes: [
      {
        id: 'tech-debt', step: 1,
        title: 'Tech Debt Tribunal',
        desc: 'Prioritize backlogs by blast radius, security risk, and PM velocity. Make the call that everyone else avoids.',
        status: 'locked', xp: 1200, tags: ['tribunal'],
        courses: [
          { title: 'ENG-801: Q3 Tech Debt Sizing', tag: 'tribunal', label: 'Tribunal', status: 'Not Started', xp: 1200 },
        ],
      },
      {
        id: 'war-staff', step: 2,
        title: 'Cascade Failures — Staff',
        desc: 'Multi-service degradation across microservices. Root cause is three traces deep and the CEO is watching the dashboard.',
        status: 'locked', xp: 1500, tags: ['war'],
        courses: [
          { title: 'ENG-999: The Circular Dependency', tag: 'war', label: 'War Room', status: 'Not Started', xp: 1500 },
        ],
        terminalHint: '$ engprep status --level=staff\n> 0 / 2 modules complete. Climb the ladder.',
      },
      {
        id: 'org-design', step: 3,
        title: 'Engineering Org Design',
        desc: 'Define team topologies, own the RFC process, and unblock 20 engineers instead of writing code yourself.',
        status: 'locked', xp: 1800, tags: ['tribunal', 'design'],
        courses: [
          { title: 'ENG-950: Team Topology RFC', tag: 'tribunal', label: 'Tribunal', status: 'Not Started', xp: 900 },
          { title: 'ENG-955: Reorg Postmortem',  tag: 'tribunal', label: 'Tribunal', status: 'Not Started', xp: 900 },
        ],
      },
    ],
  },
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function TagPill({ tag }: { tag: TagKey }) {
  const m = TAG_META[tag];
  return (
    <span className={styles.tagPill} style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}30` }}>
      {m.icon} {m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'done')   return <span className={styles.statusDone}>✓ Complete</span>;
  if (status === 'active') return <span className={styles.statusActive}>▶ In Progress</span>;
  return <span className={styles.statusLocked}>🔒 Locked</span>;
}

function CourseLine({ course }: { course: Course }) {
  const m = TAG_META[course.tag];
  const isDone = course.status === 'Completed';
  const isActive = course.status === 'In Progress';
  return (
    <Link href="/challenges" className={`${styles.courseLine} ${isDone ? styles.courseLineDone : ''} ${isActive ? styles.courseLineActive : ''}`}>
      <div className={styles.courseLineLeft}>
        <span className={styles.courseLineDot} style={{ background: isDone ? m.color : isActive ? m.color : 'var(--text-tertiary)' }} />
        <span className={styles.courseLineTitle}>{course.title}</span>
      </div>
      <div className={styles.courseLineRight}>
        <span className={styles.courseLineXp} style={{ color: m.color }}>+{course.xp} XP</span>
        <span className={styles.courseLineStatus}>{course.status}</span>
      </div>
    </Link>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function RoadmapPage() {
  const [track, setTrack] = useState<'junior' | 'mid' | 'senior'>('junior');
  const [expanded, setExpanded] = useState<string | null>('pr-basics');

  const { nodes, color } = TRACKS[track];
  const totalXP    = nodes.reduce((a, n) => a + n.xp, 0);
  const earnedXP   = nodes.filter(n => n.status === 'done').reduce((a, n) => a + n.xp, 0);
  const pct        = Math.round((earnedXP / totalXP) * 100);

  return (
    <div className={styles.layout}>
      <AppNav />

      <main className={styles.mainContainer}>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>Engineering Career Path</div>
          <h1 className={styles.heroTitle}>
            Your path from<br />
            <span className={styles.heroAccent}>first commit</span> to{' '}
            <span className={styles.heroAccent}>staff engineer</span>.
          </h1>
          <p className={styles.heroSub}>
            Not LeetCode. Not FAANG grinding. Real production scenarios — bugs, PRs, outages, and architecture decisions — that hiring managers actually care about.
          </p>
        </div>

        {/* ── Track picker ───────────────────────────────────────────── */}
        <div className={styles.trackRow}>
          {(['junior', 'mid', 'senior'] as const).map(t => {
            const td = TRACKS[t];
            const isActive = track === t;
            return (
              <button
                key={t}
                onClick={() => { setTrack(t); setExpanded(null); }}
                className={`${styles.trackCard} ${isActive ? styles.trackCardActive : ''}`}
                style={isActive ? { borderColor: td.color, boxShadow: `0 0 0 1px ${td.color}40, 0 4px 24px ${td.color}18` } : {}}
              >
                <div className={styles.trackCardLabel} style={isActive ? { color: td.color } : {}}>{td.label}</div>
                <div className={styles.trackCardSub}>{td.sublabel}</div>
                <div className={styles.trackCardNodes}>{td.nodes.length} modules</div>
              </button>
            );
          })}
        </div>

        {/* ── Progress bar ───────────────────────────────────────────── */}
        <div className={styles.progressBar}>
          <div className={styles.progressBarMeta}>
            <span className={styles.progressBarLabel}>{TRACKS[track].label} track progress</span>
            <span className={styles.progressBarXp}>{earnedXP.toLocaleString('en-US')} / {totalXP.toLocaleString('en-US')} XP — {pct}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
          </div>
        </div>

        {/* ── Timeline ───────────────────────────────────────────────── */}
        <div className={styles.timeline}>
          {/* Spine */}
          <div className={styles.spine} style={{ background: `linear-gradient(to bottom, ${color}60, ${color}10)` }} />

          {nodes.map((node, idx) => {
            const isOpen   = expanded === node.id;
            const isDone   = node.status === 'done';
            const isActive = node.status === 'active';
            const isLocked = node.status === 'locked';
            const nodeColor = isDone ? '#62de61' : isActive ? color : 'var(--text-tertiary)';

            return (
              <div key={node.id} className={`${styles.timelineItem} ${isLocked ? styles.timelineItemLocked : ''}`}>
                {/* Step marker */}
                <div className={styles.stepCol}>
                  <div
                    className={`${styles.stepDot} ${isDone ? styles.stepDotDone : isActive ? styles.stepDotActive : ''}`}
                    style={isActive ? { borderColor: nodeColor, boxShadow: `0 0 0 4px ${nodeColor}22` } : isDone ? { background: nodeColor, borderColor: nodeColor } : {}}
                  >
                    {isDone ? '✓' : isLocked ? '🔒' : idx + 1}
                  </div>
                  {idx < nodes.length - 1 && <div className={styles.stepLine} style={{ background: isDone ? `${nodeColor}50` : 'var(--border-subtle)' }} />}
                </div>

                {/* Card */}
                <div
                  className={`${styles.nodeCard} ${isOpen ? styles.nodeCardOpen : ''} ${isDone ? styles.nodeCardDone : isActive ? styles.nodeCardActive : ''}`}
                  style={isOpen && !isLocked ? { borderColor: `${nodeColor}40`, boxShadow: `0 0 0 1px ${nodeColor}20, 0 8px 32px ${nodeColor}0c` } : {}}
                  onClick={() => !isLocked && setExpanded(isOpen ? null : node.id)}
                >
                  {/* Card header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <div className={styles.cardStep} style={{ color: nodeColor }}>Step {node.step}</div>
                      <h2 className={`${styles.cardTitle} ${isLocked ? styles.cardTitleLocked : ''}`}>{node.title}</h2>
                      <div className={styles.cardTags}>
                        {node.tags.map(t => <TagPill key={t} tag={t} />)}
                      </div>
                    </div>
                    <div className={styles.cardHeaderRight}>
                      <div className={styles.cardXp} style={{ color: nodeColor }}>+{node.xp.toLocaleString('en-US')} XP</div>
                      <StatusBadge status={node.status} />
                      {!isLocked && (
                        <div className={styles.cardChevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
                      )}
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isOpen && (
                    <div className={styles.cardBody}>
                      <p className={styles.cardDesc}>{node.desc}</p>

                      <div className={styles.courseList}>
                        {node.courses.map((c, i) => <CourseLine key={i} course={c} />)}
                      </div>

                      {node.terminalHint && (
                        <div className={styles.terminalBlock}>
                          {node.terminalHint.split('\n').map((line, i) => (
                            <div key={i} className={styles.terminalLine}>
                              <span className={styles.terminalPrompt}>{line.startsWith('$') ? '$' : '>'}</span>
                              <span className={styles.terminalText}>{line.slice(1).trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {isActive && (
                        <Link href="/challenges" className={styles.ctaBtn} style={{ background: color }}>
                          Continue this module →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────────── */}
        <div className={styles.bottomCta}>
          <div className={styles.bottomCtaText}>
            <div className={styles.bottomCtaTitle}>Ready to accelerate?</div>
            <div className={styles.bottomCtaSub}>Unlock all tracks with a Pro account and get personalized pacing.</div>
          </div>
          <Link href="/pricing" className={styles.bottomCtaBtn}>See Plans →</Link>
        </div>

      </main>
    </div>
  );
}
