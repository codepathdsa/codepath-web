'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/* ─── Parallax hook ─────────────────────────────────────────────────────── */
function useParallax(speed: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * speed}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return ref;
}

/* ─── Animated counter ──────────────────────────────────────────────────── */
function AnimatedStat({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        const duration = 900;
        const update = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(eased * end));
          if (t < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className={styles.statItem}>
      <div className={styles.statValue}>
        {value}<span className={styles.statAccent}>{suffix}</span>
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState('war-room');
  const [demoSelected, setDemoSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  // Parallax refs — each layer at a different speed
  const dotGridRef  = useParallax(0.25);
  const bloomRef    = useParallax(0.12);
  const orbsRef     = useParallax(0.08);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install -g engprep');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.main}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className={`${styles.nav} ${navScrolled ? styles.navScrolled : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: 0 }}>
          <Link href="/" className={styles.navLogo}>
            engprep<span className={styles.navLogoCursor} />
          </Link>
          <div className={styles.navLinks}>
            <Link href="/challenges" className={styles.navLink}>Challenges</Link>
            <Link href="/challenges/war-room/911" className={styles.navLink}>War Room</Link>
            <Link href="/challenges/system-design/512" className={styles.navLink}>System Design</Link>
            <Link href="/challenges/tribunal/101" className={styles.navLink}>Tribunal</Link>
            <Link href="#pricing" className={styles.navLink}>Pricing</Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/login"  className="btn-ghost"   style={{ padding: '7px 15px' }}>Log In</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '7px 15px' }}>Start Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — Parallax ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        {/* Parallax Layer 1 — dot grid (fastest) */}
        <div
          ref={dotGridRef}
          className={`${styles.parallaxLayer} ${styles.heroDotGrid}`}
        />
        {/* Parallax Layer 2 — green bloom (medium) */}
        <div
          ref={bloomRef}
          className={`${styles.parallaxLayer} ${styles.heroBloom}`}
        />
        {/* Parallax Layer 3 — orbs (slowest) */}
        <div
          ref={orbsRef}
          className={`${styles.parallaxLayer} ${styles.heroOrbs}`}
        />

        {/* Hero content */}
        <div className={styles.heroContent}>
          <div className="container">
            <span className={styles.heroLabel}>Built for working engineers</span>

            <h1 className={`t-hero ${styles.heroHeadline}`}>
              Stop reversing binary trees.<br />Start engineering.
            </h1>

            <div className={styles.heroAccentLine} />

            <p className={`t-body ${styles.heroSub}`}>
              The only interview platform built for how software actually works —
              incidents, PRs, system failures, and real tradeoffs.
            </p>

            <div className={styles.heroActions}>
              <Link href="/signup" className="btn-primary">Start Free</Link>
              <button className="btn-ghost" onClick={scrollToDemo}>See How It Works</button>
            </div>

            <div className={styles.heroCliWrap}>
              <div className="cli-block" style={{ textAlign: 'left' }}>
                <div className="cli-block__header">
                  <span className="cli-block__dot cli-block__dot--red" />
                  <span className="cli-block__dot cli-block__dot--yellow" />
                  <span className="cli-block__dot cli-block__dot--green" />
                  <span className="cli-block__title">Terminal</span>
                </div>
                <div className="cli-block__body">
                  <div className="cli-block__line">
                    <span className="cli-block__prompt">$</span>
                    <span className="cli-block__command" id="cmd-1">npm install -g engprep</span>
                  </div>
                  <div className="cli-block__line cli-block__line--output">
                    <span className="cli-block__output">✓ engprep installed (v2.1.0)</span>
                  </div>
                  <div className="cli-block__line">
                    <span className="cli-block__prompt">$</span>
                    <span className="cli-block__command">engprep pull war-room-42</span>
                  </div>
                  <div className="cli-block__line cli-block__line--output">
                    <span className="cli-block__output">✓ Incident bundle downloaded → ./engprep/incidents/war-room-42/</span>
                  </div>
                  <div className="cli-block__line">
                    <span className="cli-block__prompt">$</span>
                    <span className="cli-block__cursor" />
                  </div>
                </div>
                <button className={`cli-block__copy ${copied ? 'copied' : ''}`} onClick={copyCommand}>
                  <span>{copied ? 'Copied ✓' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className={styles.heroProof}>
              Joined by <span>4,200+</span> engineers from Google, Stripe, Amazon, Vercel
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <button className={styles.scrollHint} onClick={scrollToDemo} aria-label="Scroll down">
          <div className={styles.scrollHintLine} />
          <span>Scroll</span>
        </button>
      </section>

      {/* ── Problem Statement ────────────────────────────────────────────── */}
      <section className={styles.problemStatement}>
        <div className="container">
          <p className={styles.sectionLabel}>The problem with LeetCode</p>
          <h2 className={`t-heading ${styles.problemHeader}`}>
            You've been practicing the wrong thing.
          </h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>What LeetCode tests</div>
              <div className={`${styles.problemItem} ${styles.problemBad}`}>Reverse a linked list in O(n)</div>
              <div className={`${styles.problemItem} ${styles.problemBad}`}>Find the kth largest element</div>
              <div className={`${styles.problemItem} ${styles.problemBad}`}>Implement BFS from memory</div>
            </div>
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>What your job actually requires</div>
              <div className={`${styles.problemItem} ${styles.problemGood}`}>Debug why checkout is failing for 12% of users</div>
              <div className={`${styles.problemItem} ${styles.problemGood}`}>Review a PR that will cause a memory leak</div>
              <div className={`${styles.problemItem} ${styles.problemGood}`}>Design a system that won't crash at 10M users</div>
            </div>
          </div>
          <div className={styles.problemNote}>
            Both matter. Only one of them actually gets you hired AND makes you a better engineer.
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className={styles.statsRow}>
        <div className="container">
          <div className={styles.statsGrid}>
            <AnimatedStat end={4200}  suffix="+"  label="Engineers enrolled" />
            <AnimatedStat end={120}   suffix="+"  label="Real-world scenarios" />
            <AnimatedStat end={94}    suffix="%"  label="Interview success rate" />
            <AnimatedStat end={3}     suffix="mo" label="Avg. prep time saved" />
          </div>
        </div>
      </section>

      {/* ── Feature Tabs ───────────────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresHeader}>
            <p className={styles.sectionLabel}>What you can practice</p>
            <h2 className="t-heading">Four challenge types. Zero BS.</h2>
            <p className="t-body">
              Each mode is built to mirror an actual interview or on-the-job scenario —
              not a textbook exercise.
            </p>
          </div>

          <div className={styles.tabsWrapper}>
            <div className={styles.tabsInner}>
              {[
                { id: 'war-room', label: 'War Room' },
                { id: 'dsa',      label: 'Contextual DSA' },
                { id: 'pr',       label: 'PR Review' },
                { id: 'system',   label: 'System Design' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  className={`${styles.featureTab} ${activeFeatureTab === id ? styles.featureTabActive : ''}`}
                  onClick={() => setActiveFeatureTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.featureContent}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <div className={styles.mockupDot} style={{ background: '#ef4444' }} />
                <div className={styles.mockupDot} style={{ background: '#f59e0b' }} />
                <div className={styles.mockupDot} style={{ background: '#62de61' }} />
              </div>
              <div className={styles.mockupTitle}>workspace — {activeFeatureTab}</div>
            </div>
            <div className={styles.mockupBody}>
              {activeFeatureTab === 'war-room' && (
                <>
                  <div className="t-mono" style={{ color: 'var(--accent)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                    &gt; ENG-911: Checkout failing. Redis hit rate dropped 94% → 31% at 14:32. Deploy shipped at 14:28. You have 20 minutes.
                  </div>
                  <div className={styles.incidentDash}>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Error Rate</div>
                      <div className={`${styles.metricValue} ${styles.metricDanger}`}>12.4%</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>P99 Latency</div>
                      <div className={`${styles.metricValue} ${styles.metricDanger}`}>2.4s</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Cache Hits</div>
                      <div className={`${styles.metricValue} ${styles.metricDanger}`}>31%</div>
                    </div>
                  </div>
                  <div className={styles.terminalOutput}>
                    <span style={{ color: 'var(--color-warning)' }}>[WARN]</span>{' '}
                    14:31:02 · Cache eviction rate exceeded threshold{'\n'}
                    <span style={{ color: 'var(--color-error)' }}>[ERROR]</span>{' '}
                    14:31:45 · Database connection pool exhausted{'\n'}
                    <span className="cli-block__cursor" />
                  </div>
                </>
              )}
              {activeFeatureTab === 'dsa' && (
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ marginBottom: 'var(--space-4)', color: 'var(--label-green)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    CONTEXTUAL DSA — SCENARIO MODE
                  </div>
                  <div style={{ marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
                    You are on-call. A payment retry queue is growing exponentially. Identify, in O(n log n), which payment IDs are duplicated so they can be deduplicated before re-processing.
                  </div>
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    {'// Input: paymentIds = ["p-001","p-003","p-001","p-007","p-003"]'}{'\n'}
                    {'// Expected: ["p-001","p-003"]'}
                  </div>
                </div>
              )}
              {activeFeatureTab === 'pr' && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7 }}>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                    auth/session.ts — spot the vulnerability
                  </div>
                  {[
                    { n: 12, type: '',        code: 'export async function createSession(userId: string) {' },
                    { n: 13, type: '',        code: '  const token = Math.random().toString(36);' },
                    { n: 14, type: 'removed', code: '  await db.sessions.insert({ userId, token, expires: Date.now() + 86400000 });' },
                    { n: 15, type: 'added',   code: '  await db.sessions.insert({ userId, token, expires: Date.now() + 86400000 * 30 });' },
                    { n: 16, type: '',        code: '  return token;' },
                    { n: 17, type: '',        code: '}' },
                  ].map((line, i) => (
                    <div key={i} className={`diff-line ${line.type}`}>
                      <span className="diff-num">{line.n}</span>
                      <span className="diff-sign">{line.type === 'removed' ? '−' : line.type === 'added' ? '+' : ' '}</span>
                      <span className="diff-code">{line.code}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                    Click any line to leave a review comment ↑
                  </div>
                </div>
              )}
              {activeFeatureTab === 'system' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ color: 'var(--label-green)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    System Design Canvas
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: 400 }}>
                    Design a URL shortener that handles 100K writes/sec. Drag components, draw connections, and validate your architecture in real-time.
                  </div>
                  <Link href="/challenges/system-design/512" className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                    Open Simulator
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Feature Grid ──────────────────────────────────────────────── */}
      <section className={styles.bento}>
        <div className="container">
          <p className={styles.sectionLabel}>How it works</p>
          <h2 className="t-heading">Everything needed to go from good to hired.</h2>
          <div className={styles.bentoGrid}>
            {/* Wide card */}
            <div className={`${styles.bentoCard} ${styles.bentoCardWide}`}>
              <div className={styles.bentoIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="var(--accent)" strokeWidth="1.4"/>
                  <path d="M4 7l2 2 4-4" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.bentoCardTitle}>Real incidents. Not toy problems.</div>
              <div className={styles.bentoCardBody}>
                Every War Room scenario is adapted from actual production outages — Stripe's 2023 payment cascade, AWS S3 pathstyle deprecation, the Discord message ID overflow. You debug what engineers actually debug.
              </div>
              <div className={styles.bentoTag}>
                <span className="badge badge-war">War Room</span>
              </div>
            </div>

            {/* Tall card */}
            <div className={`${styles.bentoCard} ${styles.bentoCardTall}`}>
              <div className={styles.bentoIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="var(--accent)" strokeWidth="1.4"/>
                  <path d="M8 5v3l2 2" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={styles.bentoCardTitle}>Timed. Pressured. Real.</div>
              <div className={styles.bentoCardBody}>
                The War Room runs on a clock. When time expires, the simulation scores your remediation steps in sequence order — not by if you got there, but how fast and in what order.
              </div>
              <div className={styles.bentoTag} style={{ marginTop: 'auto' }}>
                <span className="badge badge-active">Live scoring</span>
              </div>
            </div>

            {/* Half card */}
            <div className={`${styles.bentoCard} ${styles.bentoCardHalf}`}>
              <div className={styles.bentoIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 4h10M3 8h7M3 12h5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={styles.bentoCardTitle}>PR Review — find the bug before it ships.</div>
              <div className={styles.bentoCardBody}>
                Inline diff review with comment threads. Spot the N+1 query. Catch the race condition. Flag the security vulnerability before merge.
              </div>
              <div className={styles.bentoTag}>
                <span className="badge badge-pr">PR Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles / Tracks ─────────────────────────────────────────────────── */}
      <section className={styles.roles}>
        <div className="container">
          <p className={styles.sectionLabel}>Career tracks</p>
          <h2 className="t-heading" style={{ textAlign: 'center' }}>
            Built for where you are.<br />Designed for where you're going.
          </h2>
          <div className={styles.rolesGrid}>
            <div className={`${styles.roleCard} ${styles.roleGradient1}`}>
              <div className={styles.roleTrack}>Entry level · 0–2 yrs</div>
              <div className={styles.roleTitle}>Junior</div>
              <ul className={styles.roleFeatures}>
                <li>Contextual DSA workspace</li>
                <li>PR review basics</li>
                <li>War Room Level 1</li>
                <li>Behavioral scenarios</li>
              </ul>
              <Link href="/challenges?track=junior" className="btn-ghost" style={{ justifyContent: 'center' }}>
                Explore Track →
              </Link>
            </div>
            <div className={`${styles.roleCard} ${styles.roleGradient2}`}>
              <div className={styles.roleTrack}>Mid level · 2–5 yrs</div>
              <div className={styles.roleTitle}>Mid</div>
              <ul className={styles.roleFeatures}>
                <li>Everything in Junior</li>
                <li>Architecture Autopsy</li>
                <li>System Design fundamentals</li>
                <li>Company-specific tracks</li>
              </ul>
              <Link href="/challenges?track=mid" className="btn-ghost" style={{ justifyContent: 'center' }}>
                Explore Track →
              </Link>
            </div>
            <div className={`${styles.roleCard} ${styles.roleGradient3}`}>
              <div className={styles.roleTrack}>Senior level · 5+ yrs</div>
              <div className={styles.roleTitle}>Senior</div>
              <ul className={styles.roleFeatures}>
                <li>Everything in Mid</li>
                <li>Tech Debt Tribunal</li>
                <li>Advanced system design</li>
                <li>Staff-level War Room scenarios</li>
              </ul>
              <Link href="/challenges?track=senior" className="btn-ghost" style={{ justifyContent: 'center' }}>
                Explore Track →
              </Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <Link href="/assessment" className="t-body" style={{ textDecoration: 'underline', color: 'var(--text-secondary)' }}>
              Not sure which track? Take the 3-minute assessment →
            </Link>
          </div>
        </div>
      </section>

      {/* ── War Room Demo ───────────────────────────────────────────────────── */}
      <section id="demo" className={styles.demo}>
        <div className="container">
          <p className={styles.sectionLabel}>Try it now</p>
          <h2 className={`t-heading ${styles.demoH}`}>
            &ldquo;Any AI can pass a coding test.<br />Only you can own the incident.&rdquo;
          </h2>

          <div className={styles.demoBox}>
            <div className={styles.demoLog}>
              [CRITICAL] 2026-04-03 14:31:22 | Payment Gateway Latency &gt; 5000ms
            </div>
            <p className="t-body" style={{ marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
              A massive traffic spike hits your API. Database CPU is at 99%. P99 latency is failing checkouts. What is your first action?
            </p>
            <div className={styles.demoOptions}>
              {[
                { id: 1, text: 'A. Restart the database cluster' },
                { id: 2, text: 'B. Enable the emergency request rate limiter' },
                { id: 3, text: 'C. SSH into the primary db and run EXPLAIN on active queries' },
              ].map(({ id, text }) => (
                <div
                  key={id}
                  className={`${styles.demoOption} ${demoSelected === id ? styles.demoOptionSelected : ''}`}
                  onClick={() => setDemoSelected(id)}
                >
                  {text}
                </div>
              ))}
            </div>

            {demoSelected !== null && (
              <div className={styles.demoResult}>
                {demoSelected === 2
                  ? <><span style={{ color: 'var(--accent)', fontWeight: 600 }}>Correct. </span>Shedding load is the fastest way to save the database and allow valid requests to succeed. Debug the root cause once the system is stable.</>
                  : demoSelected === 1
                    ? <><span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Incorrect. </span>Restarting under load will likely cause a cache stampede or connection storm upon reboot, worsening the issue.</>
                    : <><span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Incorrect. </span>While investigating is good, the system is actively failing checkouts. You need to mitigate impact before deep debugging.</>
                }
              </div>
            )}

            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
              <Link href="/signup" className="btn-primary">Practice full War Room scenarios →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ────────────────────────────────────────────────────── */}
      <section className={styles.social}>
        <div className="container">
          <p className={styles.sectionLabel}>What engineers are saying</p>
          <h2 className="t-heading" style={{ textAlign: 'center' }}>Real quotes. No made-up corporate testimonials.</h2>
          <div className={styles.socialGrid}>
            <div className={styles.tweet}>
              <div className={styles.tweetHeader}>
                <div className={styles.tweetAvatar} />
                <div>
                  <div className={styles.tweetName}>u/backend_dev_nyc</div>
                  <div className={styles.tweetUser}>r/cscareerquestions · 847 upvotes</div>
                </div>
              </div>
              <div className={styles.tweetBody}>
                &ldquo;Finally. An interview tool that doesn't make me feel like I'm studying for a math competition. The War Room stuff is exactly what we ask in our senior loops.&rdquo;
              </div>
            </div>
            <div className={styles.tweet}>
              <div className={styles.tweetHeader}>
                <div className={styles.tweetAvatar} />
                <div>
                  <div className={styles.tweetName}>u/frontend_monk</div>
                  <div className={styles.tweetUser}>r/webdev · 1.2k upvotes</div>
                </div>
              </div>
              <div className={styles.tweetBody}>
                &ldquo;I was failing System Design interviews for 3 months. EngPrep's simulator actually showed me WHERE my bottlenecks were instead of just making me draw boxes on a whiteboard.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className={styles.pricing}>
        <div className="container">
          <p className={styles.sectionLabel}>Pricing</p>
          <h2 className="t-heading" style={{ textAlign: 'center' }}>Simple. Honest. No dark patterns.</h2>
          <div className={styles.pricingGrid}>
            {/* Free */}
            <div className={styles.priceCard}>
              <div className={styles.priceTitle}>Free</div>
              <div className={styles.priceSub}>Start today, no card needed</div>
              <div className={styles.priceValue}>$0</div>
              <ul className={styles.priceFeatures}>
                <li>Contextual DSA Workspace</li>
                <li>Basic PR Reviews</li>
                <li>Limited War Room Incidents</li>
              </ul>
              <Link href="/signup" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Start Free →
              </Link>
            </div>
            {/* Pro — accent card */}
            <div className={styles.priceCardAccent}>
              <div className={styles.priceTitle}>Pro</div>
              <div className={styles.priceSub}>For serious interview prep</div>
              <div className={styles.priceValue}>
                $179<span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-tertiary)', fontWeight: 400 }}>/yr</span>
              </div>
              <ul className={styles.priceFeatures}>
                <li>Complete CLI Syncing</li>
                <li>Advanced System Design Simulator</li>
                <li>Full Architecture Autopsy &amp; Tech Debt</li>
                <li>Company-specific interview tracks</li>
              </ul>
              <Link href="/pricing" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                See full comparison →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerLogo}>
                engprep<span className={styles.navLogoCursor} />
              </div>
              <div className={styles.footerTag}>Real engineering. Real interviews. Real growth.</div>
            </div>
            <div className={styles.footerLinks}>
              <h4>Product</h4>
              <ul>
                <li><Link href="/challenges">Challenges</Link></li>
                <li><Link href="/challenges/war-room/911">War Room</Link></li>
                <li><Link href="/challenges/system-design/512">System Design</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
              </ul>
            </div>
            <div className={styles.footerLinks}>
              <h4>Company</h4>
              <ul>
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Careers</Link></li>
              </ul>
            </div>
            <div className={styles.newsletter}>
              <p>Get one real engineering scenario every week — free.</p>
              <form className={styles.nlForm} onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="you@company.com" className={styles.nlInput} />
                <button type="submit" className={styles.nlBtn}>Subscribe</button>
              </form>
            </div>
          </div>
          <div className={styles.footerBottom}>
            © 2026 EngPrep · Made for engineers, by engineers
          </div>
        </div>
      </footer>
    </div>
  );
}
