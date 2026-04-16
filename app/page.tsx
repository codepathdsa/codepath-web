'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/* --- Parallax hook ------------------------------------------------------- */
function useParallax(speed: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * speed}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return ref;
}

/* --- Animated counter ---------------------------------------------------- */
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
        {value.toLocaleString()}<span className={styles.statAccent}>{suffix}</span>
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/* --- Ticker (marquee) ---------------------------------------------------- */
const COMPANIES = ['Google','Stripe','Amazon','Vercel','Shopify','Cloudflare','Datadog','Linear','Discord','Figma','Notion','PlanetScale'];

/* --- Creatures preview data ---------------------------------------------- */
const CREATURES_PREVIEW = [
  { emoji: '🐉', name: 'Cache Hydra',      rarity: 'Legendary', color: '#f59e0b' },
  { emoji: '👻', name: 'N+1 Phantom',       rarity: 'Rare',      color: '#8b5cf6' },
  { emoji: '⚔',  name: 'Concurrency Lord',  rarity: 'Epic',      color: '#ef4444' },
  { emoji: '🌀', name: 'Race Condition',    rarity: 'Rare',      color: '#3b82f6' },
  { emoji: '💳', name: 'Webhook Phantom',   rarity: 'Epic',      color: '#ec4899' },
  { emoji: '🌩', name: 'Thunder Cache',     rarity: 'Rare',      color: '#06b6d4' },
  { emoji: '🔮', name: 'Deadlock Specter',  rarity: 'Uncommon',  color: '#62de61' },
  { emoji: '🦠', name: 'Memory Parasite',   rarity: 'Common',    color: '#10b981' },
];

/* --- Testimonials -------------------------------------------------------- */
const TESTIMONIALS = [
  {
    handle: '@priya_srini',
    name: 'Priya S.',
    sub: 'SWE II → Staff · Stripe',
    body: `I've failed 4 staff-level system design loops. After 3 weeks on engprep, I passed 3 in a row. The War Room scenarios are eerily close to what they actually ask.`,
    stars: 5,
  },
  {
    handle: '@backend_dev_nyc',
    name: 'Marcus T.',
    sub: 'Senior SWE · Cloudflare',
    body: `Finally. An interview tool that doesn't make me feel like I'm studying for a math competition. The War Room stuff is exactly what we ask in our senior loops.`,
    stars: 5,
  },
  {
    handle: '@frontend_monk',
    name: 'Aisha L.',
    sub: 'Mid → Senior · Shopify',
    body: `I was failing System Design interviews for 3 months. engprep's simulator showed me WHERE my bottlenecks were instead of making me draw boxes on a whiteboard.`,
    stars: 5,
  },
  {
    handle: '@siddharth_g_dev',
    name: 'Siddharth G.',
    sub: 'SWE III · Google',
    body: 'The PR Review mode caught exactly the kind of bugs that show up in real code reviews. I felt prepared for actual work, not just whiteboard tricks.',
    stars: 5,
  },
];

/* --- Main Page ----------------------------------------------------------- */
export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState('war-room');
  const [demoSelected, setDemoSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeEngineers] = useState(847);

  const dotGridRef = useParallax(0.25);
  const bloomRef   = useParallax(0.12);
  const orbsRef    = useParallax(0.08);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install -g engprep').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.main}>

      {/* Warli art background texture */}
      <div className={styles.warliBg} aria-hidden="true" />

      {/* -- Nav ----------------------------------------------------------- */}
      <nav className={`${styles.nav} ${navScrolled ? styles.navScrolled : ''}`}>
        <Link href="/" className={styles.navLogo}>
          engprep<span className={styles.navLogoCursor} />
        </Link>

        <div className={styles.navLinks}>
          <Link href="/challenges" className={styles.navLink}>Challenges</Link>
          <Link href="/leaderboard" className={styles.navLink}>Leaderboard</Link>
          <Link href="/raid" className={styles.navLink}>
            <span className={styles.navRaidDot} />Raid
          </Link>
          <Link href="/codex" className={styles.navLink}>Codex</Link>
          <a href="#pricing" className={styles.navLink} onClick={e => { e.preventDefault(); scrollTo('pricing'); }}>Pricing</a>
        </div>

        <div className={styles.navActions}>
          <div className={styles.navLive}>
            <span className={styles.navLiveDot} />
            {activeEngineers.toLocaleString()} online
          </div>
          <Link href="/login"  className={`${styles.navBtn} ${styles.navBtnGhost}`}>Log in</Link>
          <Link href="/signup" className={`${styles.navBtn} ${styles.navBtnPrimary}`}>Start free →</Link>
        </div>

        <button className={styles.hamburger} onClick={() => setMobileMenuOpen(p => !p)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/challenges" onClick={() => setMobileMenuOpen(false)}>Challenges</Link>
          <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
          <Link href="/raid" onClick={() => setMobileMenuOpen(false)}>⚔ Raid</Link>
          <Link href="/codex" onClick={() => setMobileMenuOpen(false)}>Codex</Link>
          <Link href="/signup" className={styles.mobileMenuCta} onClick={() => setMobileMenuOpen(false)}>Start free →</Link>
        </div>
      )}

      {/* -- Hero ----------------------------------------------------------- */}
      <section className={styles.hero}>
        <div ref={dotGridRef} className={`${styles.parallaxLayer} ${styles.heroDotGrid}`} />
        <div ref={bloomRef}   className={`${styles.parallaxLayer} ${styles.heroBloom}`} />
        <div ref={orbsRef}    className={`${styles.parallaxLayer} ${styles.heroOrbs}`} />

        <div className={styles.heroContent}>
          <div className="container">
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Built for working engineers
            </div>

            <h1 className={styles.heroHeadline}>
              Stop reversing<br />
              <span className={styles.heroGradient}>binary trees.</span><br />
              Start engineering.
            </h1>

            <p className={styles.heroSub}>
              The only interview platform built around how software actually works —
              incidents, PR reviews, system failures, and real trade-offs.
            </p>

            <div className={styles.heroActions}>
              <Link href="/signup" className={styles.heroCta}>Start Free — no card needed</Link>
              <button className={styles.heroGhost} onClick={() => scrollTo('demo')}>See how it works ↓</button>
            </div>

            <div className={styles.heroAvatarRow}>
              {['SG','PR','AK','MN','OS','CL'].map((i, n) => (
                <div key={n} className={styles.heroAvatar} style={{ marginLeft: n > 0 ? -10 : 0, zIndex: 6 - n }} />
              ))}
              <div className={styles.heroAvatarText}>
                Joined by <strong>4,200+</strong> engineers from Google, Stripe, Amazon, Vercel
              </div>
            </div>

            {/* CLI block */}
            <div className={styles.heroCliWrap}>
              <div className={styles.cliCard}>
                <div className={styles.cliBar}>
                  <span className={styles.cliDot} style={{ background: '#ef4444' }} />
                  <span className={styles.cliDot} style={{ background: '#f59e0b' }} />
                  <span className={styles.cliDot} style={{ background: '#62de61' }} />
                  <span className={styles.cliTitle}>terminal</span>
                  <button className={`${styles.cliCopy} ${copied ? styles.cliCopyDone : ''}`} onClick={copyCommand}>
                    {copied ? '✓' : 'copy'}
                  </button>
                </div>
                <div className={styles.cliBody}>
                  <div className={styles.cliLine}>
                    <span className={styles.cliPrompt}>$</span>
                    <span className={styles.cliCmd}>npm install -g engprep</span>
                  </div>
                  <div className={styles.cliOut}>✓ engprep installed (v2.1.0)</div>
                  <div className={styles.cliLine}>
                    <span className={styles.cliPrompt}>$</span>
                    <span className={styles.cliCmd}>engprep pull war-room-42</span>
                  </div>
                  <div className={styles.cliOut}>✓ Incident bundle downloaded → ./engprep/incidents/war-room-42/</div>
                  <div className={styles.cliLine}>
                    <span className={styles.cliPrompt}>$</span>
                    <span className={styles.cliCursor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className={styles.scrollHint} onClick={() => scrollTo('problem')} aria-label="Scroll">
          <div className={styles.scrollHintLine} />
          <span>Scroll</span>
        </button>
      </section>

      {/* -- Company ticker ------------------------------------------------- */}
      <div className={styles.ticker}>
        <div className={styles.tickerFadeLeft} />
        <div className={styles.tickerTrack}>
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <span key={i} className={styles.tickerItem}>{c}</span>
          ))}
        </div>
        <div className={styles.tickerFadeRight} />
      </div>

      {/* -- Problem Statement ---------------------------------------------- */}
      <section id="problem" className={styles.problemStatement}>
        <div className="container">
          <p className={styles.sectionLabel}>The problem with LeetCode</p>
          <h2 className={`t-heading ${styles.problemHeader}`}>You've been practicing the wrong thing.</h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>
                <span className={styles.problemBadgeBad}>LeetCode</span>
                What it tests
              </div>
              {[
                'Reverse a linked list in O(n)',
                'Find the kth largest element',
                'Implement BFS from memory',
                'Solve DP problems in 20 minutes',
              ].map(t => (
                <div key={t} className={`${styles.problemItem} ${styles.problemBad}`}>
                  <span className={styles.problemX}>✗</span>{t}
                </div>
              ))}
            </div>
            <div className={styles.problemVs}>vs</div>
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>
                <span className={styles.problemBadgeGood}>engprep</span>
                What your job requires
              </div>
              {[
                'Debug why checkout is failing for 12% of users',
                'Review a PR that will cause a memory leak',
                'Design a system that won\'t crash at 10M users',
                'Own a P0 incident under real time pressure',
              ].map(t => (
                <div key={t} className={`${styles.problemItem} ${styles.problemGood}`}>
                  <span className={styles.problemCheck}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.problemNote}>
            Both matter. Only one of them actually gets you hired <em>and</em> makes you a better engineer.
          </div>
        </div>
      </section>

      {/* -- Stats ---------------------------------------------------------- */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <AnimatedStat end={4200}  suffix="+" label="Engineers enrolled" />
            <AnimatedStat end={120}   suffix="+" label="Real-world scenarios" />
            <AnimatedStat end={94}    suffix="%" label="Interview success rate" />
            <AnimatedStat end={3}     suffix="mo" label="Avg. prep time saved" />
          </div>
        </div>
      </section>

      {/* -- Feature Tabs --------------------------------------------------- */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresHeader}>
            <p className={styles.sectionLabel}>What you practice</p>
            <h2 className="t-heading">Four modes. Zero toy problems.</h2>
            <p className={styles.featuresSub}>
              Every mode mirrors a real interview or on-the-job scenario.
            </p>
          </div>

          <div className={styles.tabsWrapper}>
            {[
              { id: 'war-room', label: '⚡ War Room',       color: '#ef4444' },
              { id: 'dsa',      label: '🧩 Contextual DSA', color: '#3b82f6' },
              { id: 'pr',       label: '🔍 PR Review',      color: '#f59e0b' },
              { id: 'system',   label: '🏗 System Design',  color: '#8b5cf6' },
            ].map(({ id, label, color }) => (
              <button
                key={id}
                className={`${styles.featureTab} ${activeFeatureTab === id ? styles.featureTabActive : ''}`}
                style={activeFeatureTab === id ? { '--tab-color': color } as React.CSSProperties : undefined}
                onClick={() => setActiveFeatureTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.featureContent}>
            <div className={styles.mockupHeader}>
              <span className={styles.mockupDot} style={{ background: '#ef4444' }} />
              <span className={styles.mockupDot} style={{ background: '#f59e0b' }} />
              <span className={styles.mockupDot} style={{ background: '#62de61' }} />
              <span className={styles.mockupTitle}>workspace — {activeFeatureTab}</span>
            </div>
            <div className={styles.mockupBody}>
              {activeFeatureTab === 'war-room' && (
                <div className={styles.warRoomPreview}>
                  <div className={styles.warRoomAlert}>
                    <span className={styles.warRoomAlertDot} />
                    ENG-911: Checkout failure · 12% error rate · Redis hit rate 94% → 31% · Deploy at 14:28
                  </div>
                  <div className={styles.warRoomMetrics}>
                    {[
                      { label: 'Error Rate', value: '12.4%', danger: true },
                      { label: 'P99 Latency', value: '2.4s', danger: true },
                      { label: 'Cache Hits', value: '31%', danger: true },
                      { label: 'DB CPU', value: '97%', danger: true },
                    ].map(m => (
                      <div key={m.label} className={styles.warMetric}>
                        <div className={styles.warMetricLabel}>{m.label}</div>
                        <div className={`${styles.warMetricVal} ${m.danger ? styles.danger : ''}`}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.warTerminal}>
                    <div className={styles.warLog}><span className={styles.logWarn}>[WARN]</span>  14:31:02 · Cache eviction rate exceeded threshold</div>
                    <div className={styles.warLog}><span className={styles.logError}>[ERROR]</span> 14:31:45 · DB connection pool exhausted (512/512)</div>
                    <div className={styles.warLog}><span className={styles.logError}>[FATAL]</span> 14:31:57 · payment-processor-3: OOM killed</div>
                    <div className={styles.warLog}><span className={styles.cliPrompt}>$</span> <span className={styles.cliCursor} /></div>
                  </div>
                </div>
              )}
              {activeFeatureTab === 'dsa' && (
                <div className={styles.dsaPreview}>
                  <div className={styles.dsaLabel}>CONTEXTUAL DSA — SCENARIO MODE</div>
                  <div className={styles.dsaScenario}>
                    You are on-call. A payment retry queue is growing exponentially.
                    Identify, in O(n log n), which payment IDs are duplicated so they
                    can be deduplicated before re-processing.
                  </div>
                  <div className={styles.dsaCode}>
                    <span className={styles.codeComment}>{'// Input: paymentIds = ["p-001","p-003","p-001","p-007","p-003"]'}</span>{'\n'}
                    <span className={styles.codeComment}>{'// Expected output: ["p-001","p-003"]'}</span>{'\n\n'}
                    <span className={styles.codeKw}>function</span>{' '}
                    <span className={styles.codeFn}>findDuplicates</span>
                    {'(paymentIds: string[]): string[] {\n'}
                    {'  '}<span className={styles.codeComment}>{'// your solution here'}</span>{'\n'}
                    {'}'}
                  </div>
                </div>
              )}
              {activeFeatureTab === 'pr' && (
                <div className={styles.prPreview}>
                  <div className={styles.prFileBar}>auth/session.ts — spot the vulnerability</div>
                  {[
                    { n: 12, type: '',        code: 'export async function createSession(userId: string) {' },
                    { n: 13, type: '',        code: "  const token = Math.random().toString(36);" },
                    { n: 14, type: 'removed', code: '  await db.sessions.insert({ userId, token, expires: Date.now() + 86400000 });' },
                    { n: 15, type: 'added',   code: '  await db.sessions.insert({ userId, token, expires: Date.now() + 86400000 * 30 });' },
                    { n: 16, type: '',        code: '  return token;' },
                    { n: 17, type: '',        code: '}' },
                  ].map((line, i) => (
                    <div key={i} className={`${styles.diffLine} ${line.type === 'removed' ? styles.diffRemoved : line.type === 'added' ? styles.diffAdded : ''}`}>
                      <span className={styles.diffNum}>{line.n}</span>
                      <span className={styles.diffSign}>{line.type === 'removed' ? '−' : line.type === 'added' ? '+' : ' '}</span>
                      <span className={styles.diffCode}>{line.code}</span>
                    </div>
                  ))}
                  <div className={styles.prHint}>→ Two vulnerabilities. Click any line to leave a review comment.</div>
                </div>
              )}
              {activeFeatureTab === 'system' && (
                <div className={styles.sysPreview}>
                  <div className={styles.sysLabel}>System Design Canvas</div>
                  <div className={styles.sysDiagram}>
                    {[
                      { label: 'Client', x: 8,  y: 42, color: '#3b82f6' },
                      { label: 'CDN',    x: 30, y: 18, color: '#8b5cf6' },
                      { label: 'API',    x: 50, y: 42, color: '#62de61' },
                      { label: 'Cache',  x: 72, y: 20, color: '#f59e0b' },
                      { label: 'DB',     x: 72, y: 62, color: '#ef4444' },
                    ].map(node => (
                      <div
                        key={node.label}
                        className={styles.sysNode}
                        style={{ left: `${node.x}%`, top: `${node.y}%`, borderColor: node.color, color: node.color }}
                      >
                        {node.label}
                      </div>
                    ))}
                    <svg className={styles.sysLines} viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="14" y1="44" x2="32" y2="22" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
                      <line x1="14" y1="46" x2="52" y2="46" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
                      <line x1="56" y1="44" x2="72" y2="24" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
                      <line x1="56" y1="48" x2="72" y2="64" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <div className={styles.sysPrompt}>Design a URL shortener handling 100K writes/sec</div>
                  <Link href="/challenges/system-design/512" className={styles.sysBtn}>Open Canvas →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -- Creature Codex ------------------------------------------------- */}
      <section className={styles.codexSection}>
        <div className="container">
          <div className={styles.codexHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>Mastery Codex</p>
              <h2 className="t-heading">Defeat bugs. Collect creatures.</h2>
              <p className={styles.codexSub}>
                Every challenge you solve drops a creature into your Codex. Rare patterns unlock Legendary creatures.
                Your collection becomes a living record of your engineering depth.
              </p>
            </div>
            <Link href="/codex" className={styles.codexCta}>Explore Codex →</Link>
          </div>
          <div className={styles.codexGrid}>
            {CREATURES_PREVIEW.map((c, i) => (
              <div
                key={i}
                className={styles.codexCard}
                style={{ '--creature-color': c.color } as React.CSSProperties}
              >
                <div className={styles.codexEmoji}>{c.emoji}</div>
                <div className={styles.codexName}>{c.name}</div>
                <div className={styles.codexRarity} style={{ color: c.color }}>{c.rarity}</div>
              </div>
            ))}
          </div>
          <div className={styles.codexFooter}>31 creatures across 10 engineering archetypes</div>
        </div>
      </section>

      {/* -- Weekly Raid ---------------------------------------------------- */}
      <section className={styles.raidSection}>
        <div className="container">
          <div className={styles.raidInner}>
            <div className={styles.raidLeft}>
              <div className={styles.raidEyebrow}>
                <span className={styles.raidDot} />Weekly Raid — LIVE
              </div>
              <h2 className={styles.raidTitle}>
                847 engineers are<br />responding to a P0 right now.
              </h2>
              <p className={styles.raidDesc}>
                Every Friday, a global P0 incident drops. Every engineer on the platform
                responds together. The fastest resolvers earn Legendary drops and XP bonuses.
              </p>
              <div className={styles.raidStats}>
                <div className={styles.raidStat}>
                  <div className={styles.raidStatVal}>847</div>
                  <div className={styles.raidStatLabel}>Engineers in</div>
                </div>
                <div className={styles.raidStat}>
                  <div className={styles.raidStatVal}>37%</div>
                  <div className={styles.raidStatLabel}>Solve rate</div>
                </div>
                <div className={styles.raidStat}>
                  <div className={styles.raidStatVal}>2d 23h</div>
                  <div className={styles.raidStatLabel}>Time left</div>
                </div>
              </div>
              <Link href="/raid" className={styles.raidCta}>Join the Raid →</Link>
            </div>
            <div className={styles.raidRight}>
              <div className={styles.raidTerminal}>
                <div className={styles.raidTermBar}>
                  <span className={styles.raidTermDot} style={{ background: '#ef4444' }} />
                  <span className={styles.raidTermDot} style={{ background: '#f59e0b' }} />
                  <span className={styles.raidTermDot} style={{ background: '#62de61' }} />
                  <span className={styles.raidTermTitle}>Global Payment Rail Meltdown</span>
                  <span className={styles.raidLiveBadge}>⬤ LIVE</span>
                </div>
                <div className={styles.raidLog}>
                  <div className={styles.raidLogLine}><span className={styles.logError}>[P0]</span> payment-processor: latency 34,212ms · 6 regions</div>
                  <div className={styles.raidLogLine}><span className={styles.logError}>[FATAL]</span> pgbouncer: pool exhausted 14500/14500</div>
                  <div className={styles.raidLogLine}><span className={styles.logWarn}>[WARN]</span> stripe-ingest: 14,832 webhook events / 60s</div>
                  <div className={styles.raidLogLine}><span className={styles.logError}>[ERROR]</span> webhook-dispatcher: no concurrency limit set</div>
                  <div className={styles.raidLogLine}><span className={styles.cliPrompt}>$</span> <span className={styles.cliCursor} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Leaderboard Teaser --------------------------------------------- */}
      <section className={styles.lbSection}>
        <div className="container">
          <div className={styles.lbHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>Leaderboard</p>
              <h2 className="t-heading">Engineering is competitive. Own it.</h2>
            </div>
            <Link href="/leaderboard" className={styles.lbCta}>See full leaderboard →</Link>
          </div>
          <div className={styles.lbPodium}>
            {[
              { rank: 2, name: 'Priya R.',    xp: '41,200', color: '#94a3b8', initials: 'PR', height: 110 },
              { rank: 1, name: 'Siddharth G.',xp: '58,900', color: '#f59e0b', initials: 'SG', height: 140 },
              { rank: 3, name: 'Alex K.',     xp: '33,400', color: '#cd7f32', initials: 'AK', height: 90  },
            ].map(p => (
              <div key={p.rank} className={styles.lbEntry} style={{ '--lb-color': p.color } as React.CSSProperties}>
                <div className={styles.lbAvatar} style={{ background: p.color }}>
                  {p.initials}
                </div>
                <div className={styles.lbName}>{p.name}</div>
                <div className={styles.lbXp}>{p.xp} XP</div>
                <div className={styles.lbBar} style={{ height: p.height }} />
                <div className={styles.lbRankNum} style={{ background: p.color }}>#{p.rank}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Roles / Tracks ------------------------------------------------- */}
      <section className={styles.roles}>
        <div className="container">
          <p className={styles.sectionLabel}>Career tracks</p>
          <h2 className="t-heading" style={{ textAlign: 'center' }}>
            Built for where you are.<br />Designed for where you&apos;re going.
          </h2>
          <div className={styles.rolesGrid}>
            {[
              {
                track: 'Entry level · 0–2 yrs', title: 'Junior',
                gradient: styles.roleGradient1,
                features: ['Contextual DSA workspace','PR review basics','War Room Level 1','Behavioral scenarios'],
                href: '/challenges?track=junior',
              },
              {
                track: 'Mid level · 2–5 yrs', title: 'Mid',
                gradient: styles.roleGradient2,
                features: ['Everything in Junior','Architecture Autopsy','System Design fundamentals','Company-specific tracks'],
                href: '/challenges?track=mid',
              },
              {
                track: 'Senior level · 5+ yrs', title: 'Senior',
                gradient: styles.roleGradient3,
                features: ['Everything in Mid','Tech Debt Tribunal','Advanced system design','Staff-level War Room scenarios'],
                href: '/challenges?track=senior',
              },
            ].map(r => (
              <div key={r.title} className={`${styles.roleCard} ${r.gradient}`}>
                <div className={styles.roleTrack}>{r.track}</div>
                <div className={styles.roleTitle}>{r.title}</div>
                <ul className={styles.roleFeatures}>
                  {r.features.map(f => <li key={f}>✓ {f}</li>)}
                </ul>
                <Link href={r.href} className={styles.roleBtn}>Explore Track →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- War Room Demo -------------------------------------------------- */}
      <section id="demo" className={styles.demo}>
        <div className="container">
          <p className={styles.sectionLabel}>Try it now</p>
          <h2 className={`t-heading ${styles.demoH}`}>
            &ldquo;Any AI can pass a coding test.<br />Only you can own the incident.&rdquo;
          </h2>
          <div className={styles.demoBox}>
            <div className={styles.demoAlert}>
              <span className={styles.demoAlertDot} />
              [CRITICAL] 2026-04-03 14:31:22 · Payment Gateway Latency &gt; 5000ms · $2.4M/hr revenue impact
            </div>
            <p className={styles.demoQ}>
              A massive traffic spike hits your API. Database CPU is at 99%. P99 latency is failing checkouts.
              <strong> What is your first action?</strong>
            </p>
            <div className={styles.demoOptions}>
              {[
                { id: 1, text: 'A.  Restart the database cluster' },
                { id: 2, text: 'B.  Enable the emergency request rate limiter' },
                { id: 3, text: 'C.  SSH into the primary db and run EXPLAIN on active queries' },
              ].map(({ id, text }) => (
                <div
                  key={id}
                  className={`${styles.demoOption}
                    ${demoSelected === id && id === 2 ? styles.demoOptionCorrect : ''}
                    ${demoSelected === id && id !== 2 ? styles.demoOptionWrong : ''}
                    ${demoSelected !== null && demoSelected !== id ? styles.demoOptionDimmed : ''}`}
                  onClick={() => setDemoSelected(id)}
                >
                  {text}
                  {demoSelected === id && id === 2 && <span className={styles.demoCheck}>✓</span>}
                  {demoSelected === id && id !== 2 && <span className={styles.demoX}>✗</span>}
                </div>
              ))}
            </div>
            {demoSelected !== null && (
              <div className={`${styles.demoResult} ${demoSelected === 2 ? styles.demoResultCorrect : styles.demoResultWrong}`}>
                {demoSelected === 2
                  ? '✓ Correct. Shedding load is the fastest way to save the database and allow valid requests to succeed. Debug the root cause once the system is stable.'
                  : demoSelected === 1
                    ? '✗ Restarting under load will likely cause a cache stampede or connection storm upon reboot, worsening the issue.'
                    : '✗ While investigating is good, the system is actively failing checkouts. Mitigate impact before deep debugging.'}
              </div>
            )}
            <div className={styles.demoCta}>
              <Link href="/signup" className={styles.heroCta}>Practice full War Room scenarios →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* -- Testimonials --------------------------------------------------- */}
      <section className={styles.social}>
        <div className="container">
          <p className={styles.sectionLabel}>What engineers say</p>
          <h2 className="t-heading" style={{ textAlign: 'center' }}>Real quotes. No made-up testimonials.</h2>
          <div className={styles.socialGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.tweet}>
                <div className={styles.tweetHeader}>
                  <div className={styles.tweetAvatar} style={{ background: `hsl(${i * 80 + 120}, 60%, 55%)` }}>
                    {t.name.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div>
                    <div className={styles.tweetName}>{t.name}</div>
                    <div className={styles.tweetUser}>{t.sub}</div>
                  </div>
                  <div className={styles.tweetX}>𝕏</div>
                </div>
                <div className={styles.tweetStars}>{'★'.repeat(t.stars)}</div>
                <div className={styles.tweetBody}>&ldquo;{t.body}&rdquo;</div>
                <div className={styles.tweetHandle}>{t.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Pricing -------------------------------------------------------- */}
      <section id="pricing" className={styles.pricing}>
        <div className="container">
          <p className={styles.sectionLabel}>Pricing</p>
          <h2 className="t-heading" style={{ textAlign: 'center' }}>Simple. Honest. No dark patterns.</h2>
          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <div className={styles.priceTitle}>🌱 Free</div>
              <div className={styles.priceSub}>Explore the platform</div>
              <div className={styles.priceValue}>$0<span className={styles.pricePer}> forever</span></div>
              <ul className={styles.priceFeatures}>
                <li>10 challenges (sampler set)</li>
                <li>2 War Room attempts</li>
                <li>10 Codex creatures</li>
                <li>Streak tracking</li>
                <li>Public profile &amp; rank card</li>
              </ul>
              <Link href="/signup" className={styles.priceBtn}>Start for free</Link>
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardAccent}`}>
              <div className={styles.pricePopular}>Most Popular</div>
              <div className={styles.priceTitle}>⚡ Pro</div>
              <div className={styles.priceSub}>Serious interview prep</div>
              <div className={styles.priceValue}>
                $399<span className={styles.pricePer}>/yr</span>
              </div>
              <ul className={styles.priceFeatures}>
                <li>Everything in Free</li>
                <li><strong>All 150+ challenges</strong></li>
                <li>Unlimited War Rooms</li>
                <li>Advanced System Design simulator</li>
                <li>Company-specific interview tracks</li>
                <li>12-week roadmap</li>
              </ul>
              <Link href="/pricing" className={styles.priceBtnAccent}>Upgrade to Pro →</Link>
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardLegend}`}>
              <div className={styles.priceLegendBadge}>🔮 Legendary</div>
              <div className={styles.priceTitle}>Legendary</div>
              <div className={styles.priceSub}>For the obsessive few</div>
              <div className={`${styles.priceValue} ${styles.priceValueGold}`}>
                $799<span className={styles.pricePer}>/yr</span>
              </div>
              <ul className={styles.priceFeatures}>
                <li>Everything in Pro</li>
                <li><strong>Shiny creature variants</strong></li>
                <li>1-on-1 mock interviews (× 2/mo)</li>
                <li>Priority Discord support</li>
                <li>Founding member badge</li>
              </ul>
              <Link href="/pricing" className={styles.priceBtnLegend}>Go Legendary →</Link>
            </div>
          </div>
          <p className={styles.pricingNote}>All plans include a 7-day money-back guarantee. <Link href="/pricing">See full feature comparison →</Link></p>
        </div>
      </section>

      {/* -- Footer --------------------------------------------------------- */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                engprep<span className={styles.navLogoCursor} />
              </div>
              <div className={styles.footerTag}>Real engineering. Real interviews. Real growth.</div>
              <div className={styles.footerSocials}>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocial}>𝕏</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocial}>GH</a>
                <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className={styles.footerSocial}>DC</a>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <h4>Practice</h4>
              <ul>
                <li><Link href="/challenges">Challenges</Link></li>
                <li><Link href="/raid">Weekly Raid</Link></li>
                <li><Link href="/leaderboard">Leaderboard</Link></li>
                <li><Link href="/codex">Mastery Codex</Link></li>
              </ul>
            </div>
            <div className={styles.footerLinks}>
              <h4>Account</h4>
              <ul>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/profile">Profile</Link></li>
                <li><Link href="/referral">Referral Program</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div className={styles.footerNewsletter}>
              <p>Get one real engineering scenario every week — free.</p>
              <form className={styles.nlForm} onSubmit={e => e.preventDefault()}>
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
