'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppNav from '@/app/components/AppNav';
import { CHALLENGES } from '@/lib/challenges';
import styles from './page.module.css';

// --- Company definitions -----------------------------------------------------

interface CompanyConfig {
  name: string;
  logo: string;
  color: string;
  rounds: string[];
  tagline: string;
  difficulty: string;
  diffColor: string;
  avgHours: number;
  warRooms: {
    title: string;
    desc: string;
    severity: string;
    xp: number;
  }[];
  tips: string[];
}

const COMPANIES: Record<string, CompanyConfig> = {
  google: {
    name: 'Google',
    logo: 'G',
    color: '#4285f4',
    rounds: ['Phone Screen', 'Coding ×2', 'System Design', 'Behavioral (Googleyness)'],
    tagline: 'Structured problem-solving at scale. Expect ambiguity, depth, and systems thinking.',
    difficulty: 'Very Hard',
    diffColor: '#ef4444',
    avgHours: 42,
    warRooms: [
      {
        title: 'Bigtable Replication Lag',
        desc: 'A Bigtable replication lag is causing search staleness for 3% of queries. Reads are returning 8-second-old data during peak traffic.',
        severity: 'P1',
        xp: 1200,
      },
      {
        title: 'Spanner Deadlock Cascade',
        desc: 'Cloud Spanner transaction deadlocks are cascading across the Ads serving pipeline. CPC bidding is degraded across 4 regions.',
        severity: 'P0',
        xp: 1500,
      },
      {
        title: 'Pub/Sub Consumer Lag',
        desc: 'A Pub/Sub subscription has a 12-hour backlog. Downstream analytics pipelines are producing stale attribution data.',
        severity: 'P2',
        xp: 900,
      },
    ],
    tips: [
      'Google\'s coding interviews deeply test algorithm intuition — they want to see your thought process, not just the answer.',
      '"Googleyness" questions probe collaboration, ambiguity handling, and intellectual humility. Have stories ready for each.',
      'System design should include capacity estimation — always size your system explicitly.',
      'Questions are often open-ended; asking clarifying questions is expected and valued.',
      'Expect follow-up questions on time/space complexity and edge cases even for "easy" problems.',
    ],
  },
  meta: {
    name: 'Meta',
    logo: 'M',
    color: '#0081fb',
    rounds: ['Coding ×2', 'System Design', 'Behavioral', 'Cross-Functional'],
    tagline: 'Fast-paced product engineering at massive scale. Speed and clarity matter.',
    difficulty: 'Hard',
    diffColor: '#f59e0b',
    avgHours: 38,
    warRooms: [
      {
        title: 'Feed Ranking Regression',
        desc: 'A model weight update in the News Feed ranking pipeline degraded engagement by 11% within 30 minutes of deploy. Rollback window is closing.',
        severity: 'P0',
        xp: 1400,
      },
      {
        title: 'WhatsApp Delivery Receipt Storm',
        desc: 'A bug in delivery receipt batching is causing a 400x fan-out amplification on message acks. Server CPU is climbing.',
        severity: 'P1',
        xp: 1100,
      },
      {
        title: 'Graph Write Amplification',
        desc: 'A new social graph mutation is creating unexpected write amplification — every friend connection is triggering 340 downstream writes.',
        severity: 'P1',
        xp: 1000,
      },
    ],
    tips: [
      'Meta values speed. Clean, correct code quickly beats perfect code slowly.',
      'System design at Meta focuses on scale — think billions of users, petabytes of data.',
      'Behavioral questions map to Meta\'s values: Move Fast, Be Bold, Build Cool Stuff, Be Open, Live in the Future.',
      'Graph algorithms (BFS/DFS) appear frequently — know them cold.',
      'For the cross-functional round, practice explaining technical decisions to non-engineers.',
    ],
  },
  amazon: {
    name: 'Amazon',
    logo: 'A',
    color: '#ff9900',
    rounds: ['OA', 'Coding ×2', 'System Design', 'Behavioral (LPs) ×2'],
    tagline: 'LP-heavy. Every interview maps to Leadership Principles. Own your execution.',
    difficulty: 'Hard',
    diffColor: '#f59e0b',
    avgHours: 45,
    warRooms: [
      {
        title: 'S3 Presigned URL Expiry Bug',
        desc: 'A presigned URL TTL was accidentally set to 5 seconds instead of 5 minutes in a recent Lambda deploy. 12% of file uploads are failing.',
        severity: 'P1',
        xp: 1100,
      },
      {
        title: 'DynamoDB Hot Partition',
        desc: 'Black Friday traffic is hammering a single DynamoDB partition key. Checkout latency is 14x normal. On-call is you.',
        severity: 'P0',
        xp: 1600,
      },
      {
        title: 'SQS Message Deduplication Failure',
        desc: 'SQS message deduplication is failing on a FIFO queue. Payment processing is double-charging 0.3% of orders.',
        severity: 'P0',
        xp: 1500,
      },
      {
        title: 'Lambda Cold Start Cascade',
        desc: 'A surge of cold starts after an idle period is causing cascading timeouts across a Lambda → API Gateway → downstream services chain.',
        severity: 'P2',
        xp: 850,
      },
    ],
    tips: [
      'Amazon\'s 16 Leadership Principles are the interview. Every behavioral question maps to them — prepare 2 STAR stories per LP.',
      'For the coding rounds: think about edge cases loudly. "Null, empty, negative" handling matters a lot.',
      '"Ownership" is the most tested LP — show you take full responsibility for outcomes, not just your code.',
      'System design should focus on operational concerns: what breaks, how you detect it, how you fix it.',
      'Bar Raisers are looking for clear "Raise the Bar" behavior — set high standards and explain why.',
    ],
  },
  stripe: {
    name: 'Stripe',
    logo: 'S',
    color: '#635bff',
    rounds: ['Take-Home', 'Coding ×2', 'System Design', 'Infrastructure', 'Cultural'],
    tagline: 'Deeply technical. Expect payments, API design, and real production scenarios.',
    difficulty: 'Very Hard',
    diffColor: '#ef4444',
    avgHours: 34,
    warRooms: [
      {
        title: 'Double-Charge on Payment Intents',
        desc: 'A latency spike caused duplicate confirmations on payment intents. 0.1% of charges are duplicated. Stripe SLA requires detection in < 5 minutes.',
        severity: 'P0',
        xp: 1600,
      },
      {
        title: 'Webhook Fan-Out Collapse',
        desc: 'Stripe webhook fan-out collapsed the DB connection pool across 6 regions. $2.4M in revenue is blocked. This is the Friday Raid scenario.',
        severity: 'P0',
        xp: 1500,
      },
      {
        title: 'Idempotency Key Collision',
        desc: 'A client library bug is generating colliding idempotency keys for different transactions. Charges are being silently dropped.',
        severity: 'P1',
        xp: 1200,
      },
    ],
    tips: [
      'Stripe cares deeply about API design — study their API surface. How does their idempotency model work? Why?',
      'The take-home project is evaluated for code quality, not just correctness. Review for style, error handling, and docs.',
      'Infrastructure round: expect deep systems questions — how do you ensure exactly-once delivery? How do you handle partial failures?',
      'Cultural fit is evaluated heavily — read Stripe\'s public writing and engineering blog posts before applying.',
      'Payments domain knowledge matters: understand the charge lifecycle, webhooks, and disputes before your interview.',
    ],
  },
  airbnb: {
    name: 'Airbnb',
    logo: '✦',
    color: '#ff5a5f',
    rounds: ['Phone Screen', 'Coding ×2', 'System Design', 'Cross-Functional', 'Hiring Manager'],
    tagline: 'Strong focus on craft and UX intuition. System Design with empathy.',
    difficulty: 'Hard',
    diffColor: '#f59e0b',
    avgHours: 36,
    warRooms: [
      {
        title: 'Search Ranking Service Outage',
        desc: 'Airbnb\'s search ranking service returned 503s for 8 minutes. Direct booking revenue impact: $1.8M. Root cause points to a Redis timeout chain.',
        severity: 'P0',
        xp: 1400,
      },
      {
        title: 'Booking Double-Confirmation',
        desc: 'A race condition allowed double-booking of the same listing for overlapping dates. 340 guests affected across 12 time zones.',
        severity: 'P1',
        xp: 1100,
      },
    ],
    tips: [
      'Airbnb values "Belong Anywhere" in both product and engineering — show empathy for users in your system design.',
      'Cross-functional interview tests how you collaborate and communicate. Use concrete examples from past experience.',
      'System design often focuses on search, booking flows, and distributed consistency.',
      'The hiring manager round is high-stakes — prepare to discuss career trajectory and alignment with Airbnb\'s mission.',
      'Code quality and readability are scrutinized. Write production-quality code in interviews.',
    ],
  },
  linear: {
    name: 'Linear',
    logo: 'L',
    color: '#5e6ad2',
    rounds: ['Async Take-Home', 'Technical Deep-Dive', 'CEO/Co-founder Chat'],
    tagline: 'Small team, high bar. Craft, velocity, and opinionated product thinking.',
    difficulty: 'Hard',
    diffColor: '#f59e0b',
    avgHours: 20,
    warRooms: [
      {
        title: 'Issue Sync Deadlock',
        desc: 'Linear\'s real-time issue sync is deadlocking under concurrent edits from multiple team members. Offline edits are being silently dropped.',
        severity: 'P1',
        xp: 1200,
      },
    ],
    tips: [
      'Linear is extremely selective — the take-home is a real bar. Build something production-quality, not just functional.',
      'CEO round assesses cultural and product alignment. Understand Linear\'s product philosophy before the interview.',
      'They value speed of execution AND quality simultaneously. Show both.',
      'Read Linear\'s Changelog and blog to understand their engineering culture.',
      'Small team means every engineer owns large surfaces — show you can handle scope.',
    ],
  },
  vercel: {
    name: 'Vercel',
    logo: '▲',
    color: '#ffffff',
    rounds: ['Take-Home Project', 'Technical Review', 'System Design', 'Culture'],
    tagline: 'Elite DX engineers. Edge runtimes, build performance, and developer empathy.',
    difficulty: 'Hard',
    diffColor: '#f59e0b',
    avgHours: 18,
    warRooms: [
      {
        title: 'Edge Function Cold Start Spike',
        desc: 'A Vercel Edge Function deployment triggered a cold start spike across 12 PoP locations. P99 TTFB jumped from 18ms to 340ms.',
        severity: 'P1',
        xp: 1100,
      },
    ],
    tips: [
      'Vercel cares about developer experience above all. Your take-home will be evaluated for how it feels to use, not just how it works.',
      'Deep knowledge of Next.js, edge runtimes, and serverless is assumed — go beyond surface level.',
      'System design should show you understand CDN edge caching, ISR, and the Vercel deployment model.',
      'Culture round: show passion for DX and the web platform. They want believers, not just employees.',
      'Performance obsession is table stakes — every answer should consider load time and runtime cost.',
    ],
  },
  notion: {
    name: 'Notion',
    logo: 'N',
    color: '#ffffff',
    rounds: ['Phone Screen', 'Coding ×2', 'System Design', 'Behavioral'],
    tagline: 'Product-minded engineers building extensible systems. Balance matters.',
    difficulty: 'Medium',
    diffColor: '#10b981',
    avgHours: 28,
    warRooms: [
      {
        title: 'Block Database Consistency Failure',
        desc: 'Notion\'s block tree database got into an inconsistent state after a concurrent edit from web and mobile. Pages are showing corrupted hierarchies.',
        severity: 'P1',
        xp: 1000,
      },
      {
        title: 'Export Queue Backlog',
        desc: 'The PDF/Markdown export queue has a 6-hour backlog. Users see export pending with no status. It\'s driven to a silent crash.',
        severity: 'P2',
        xp: 750,
      },
    ],
    tips: [
      'Notion values product sense alongside technical skills — show you think about user impact of your architectural decisions.',
      'The block-based data model is central to Notion\'s codebase — understand tree structures deeply.',
      'System design often involves collaborative editing, operational transforms, or CRDTs.',
      'Behavioral round: show you\'ve shipped things end-to-end and can work cross-functionally.',
      'Know your complexity trade-offs — Notion\'s editors are performance-sensitive.',
    ],
  },
};

// --- Route param typing ------------------------------------------------------

type PageProps = {
  params: Promise<{ company: string }>;
};

// --- Main page ---------------------------------------------------------------

export default async function CompanyTrackPage({ params }: PageProps) {
  const { company } = await params;
  const config = COMPANIES[company];
  if (!config) notFound();

  // Filter challenges tagged for this company (case-insensitive)
  const companyChallenges = CHALLENGES.filter(c =>
    c.companies.some(co => co.toLowerCase() === config.name.toLowerCase())
  );

  // Group by type
  const byType: Record<string, typeof CHALLENGES> = {};
  for (const ch of companyChallenges) {
    if (!byType[ch.type]) byType[ch.type] = [];
    byType[ch.type].push(ch);
  }

  const typeOrder = ['DSA', 'PR Review', 'War Room', 'System Design', 'Tech Debt Tribunal'];
  const BADGE_CLASS: Record<string, string> = {
    'DSA': 'badge-dsa',
    'PR Review': 'badge-pr',
    'War Room': 'badge-war',
    'System Design': 'badge-design',
    'Tech Debt Tribunal': 'badge-design',
  };

  const totalChallenges = companyChallenges.length + config.warRooms.length;
  const mockCompleted = Math.floor(totalChallenges * 0.18); // ~18% for demo

  return (
    <>
      <AppNav />
      <main className={styles.page}>

        {/* ── Breadcrumb ────────────────────────────────── */}
        <nav className={styles.breadcrumb}>
          <Link href="/tracks" className={styles.breadLink}>Company Tracks</Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>{config.name}</span>
        </nav>

        {/* ── Company hero ──────────────────────────────── */}
        <div className={styles.hero} style={{ '--track-color': config.color } as React.CSSProperties}>
          <div className={styles.heroStrip} />
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <div
                className={styles.logoBox}
                style={{
                  background: `${config.color}22`,
                  border: `1px solid ${config.color}44`,
                  color: config.color === '#ffffff' ? '#ccc' : config.color,
                }}
              >
                {config.logo}
              </div>
              <div>
                <h1 className={styles.companyName}>{config.name}</h1>
                <span className={styles.diffTag} style={{ color: config.diffColor }}>
                  {config.difficulty}
                </span>
              </div>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.hStat}>
                <span className={styles.hStatNum}>{totalChallenges}</span>
                <span className={styles.hStatLbl}>Challenges</span>
              </div>
              <div className={styles.hStat}>
                <span className={styles.hStatNum}>{config.warRooms.length}</span>
                <span className={styles.hStatLbl}>War Rooms</span>
              </div>
              <div className={styles.hStat}>
                <span className={styles.hStatNum}>~{config.avgHours}h</span>
                <span className={styles.hStatLbl}>Prep Time</span>
              </div>
              <div className={styles.hStat}>
                <span className={styles.hStatNum}>{mockCompleted}/{totalChallenges}</span>
                <span className={styles.hStatLbl}>Completed</span>
              </div>
            </div>
          </div>
          <p className={styles.tagline}>{config.tagline}</p>

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.round((mockCompleted / totalChallenges) * 100)}%`,
                  background: config.color === '#ffffff' ? '#ccc' : config.color,
                }}
              />
            </div>
            <span className={styles.progressPct}>
              {Math.round((mockCompleted / totalChallenges) * 100)}% complete
            </span>
          </div>

          {/* Interview rounds */}
          <div className={styles.rounds}>
            <span className={styles.roundsLabel}>Interview rounds:</span>
            {config.rounds.map((r, i) => (
              <span key={i} className={styles.round}>{r}</span>
            ))}
          </div>
        </div>

        {/* ── Layout: challenges + sidebar ──────────────── */}
        <div className={styles.layout}>

          {/* ── Left: challenges + war rooms ──────────────── */}
          <div className={styles.main}>

            {/* Challenges by type */}
            {typeOrder.filter(t => byType[t]?.length).map(type => (
              <section key={type} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={`badge ${BADGE_CLASS[type]}`}>{type}</span>
                  <span className={styles.sectionCount}>{byType[type].length}</span>
                </h2>
                <div className={styles.challengeList}>
                  {byType[type].map(ch => {
                    const typeSlug = type === 'DSA' ? 'dsa'
                      : type === 'PR Review' ? 'pr'
                      : type === 'War Room' ? 'war-room'
                      : type === 'System Design' ? 'system-design'
                      : 'tribunal';
                    const href = `/challenges/${typeSlug}/${ch.id}`;
                    return (
                      <Link key={ch.id} href={href} className={styles.challengeRow}>
                        <div className={styles.chLeft}>
                          <span className={styles.chTitle}>{ch.title}</span>
                          <span className={styles.chDesc}>{ch.desc.slice(0, 90)}…</span>
                        </div>
                        <div className={styles.chRight}>
                          <span className={styles.chLevel}>{ch.level}</span>
                          <span className={styles.chTime}>{ch.timeEst}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Company-specific War Rooms */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className="badge badge-war">War Room</span>
                <span className={styles.sectionLabel}>{config.name}-specific</span>
                <span className={styles.sectionCount}>{config.warRooms.length}</span>
              </h2>
              <div className={styles.challengeList}>
                {config.warRooms.map((wr, i) => (
                  <Link key={i} href="/raid" className={styles.challengeRow}>
                    <div className={styles.chLeft}>
                      <span className={styles.chTitle}>{wr.title}</span>
                      <span className={styles.chDesc}>{wr.desc.slice(0, 90)}…</span>
                    </div>
                    <div className={styles.chRight}>
                      <span
                        className={styles.chSeverity}
                        style={{
                          color: wr.severity === 'P0' ? '#ef4444'
                            : wr.severity === 'P1' ? '#f59e0b'
                            : '#8a8a8a'
                        }}
                      >
                        {wr.severity}
                      </span>
                      <span className={styles.chXp}>+{wr.xp} XP</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </div>

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className={styles.sidebar}>

            {/* Insider tips */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>💡 Insider Tips</h3>
              <ul className={styles.tips}>
                {config.tips.map((tip, i) => (
                  <li key={i} className={styles.tip}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Track CTA */}
            <div className={styles.ctaCard} style={{ '--track-color': config.color } as React.CSSProperties}>
              <h3 className={styles.ctaTitle}>Ready to sprint?</h3>
              <p className={styles.ctaBody}>
                Work through all {totalChallenges} challenges in order — designed to build from
                your weakest area to interview-ready in ~{config.avgHours} hours.
              </p>
              <Link href={companyChallenges[0] ? `/challenges/dsa/${companyChallenges[0].id}` : '/challenges'} className={styles.ctaBtn}>
                Start Next Challenge →
              </Link>
            </div>

          </aside>
        </div>

      </main>
    </>
  );
}
