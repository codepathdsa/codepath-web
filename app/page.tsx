'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/* ─── Intersection observer hook ─────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated counter ────────────────────────────────────────────────────── */
function AnimatedStat({ end, suffix = '', label, prefix = '' }: { end: number; suffix?: string; prefix?: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        const duration = 1400;
        const update = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
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
      <div className={styles.statValue}>{prefix}{value.toLocaleString()}<span className={styles.statSuffix}>{suffix}</span></div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ─── Scroll progress hook ────────────────────────────────────────────────── */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const COMPANIES = ['Google','Stripe','Amazon','Vercel','Shopify','Cloudflare','Datadog','Linear','Discord','Figma','Notion','PlanetScale','GitHub','Atlassian','Twilio'];

const CREATURES_PREVIEW = [
  { name: 'Cache Hydra',      rarity: 'Legendary', color: 'oklch(0.78 0.16 75)',  glyph: '⬡' },
  { name: 'N+1 Phantom',      rarity: 'Rare',      color: 'oklch(0.62 0.18 290)', glyph: '◈' },
  { name: 'Concurrency Lord', rarity: 'Epic',      color: 'oklch(0.62 0.22 27)',  glyph: '⬟' },
  { name: 'Race Condition',   rarity: 'Rare',      color: 'oklch(0.62 0.18 240)', glyph: '◉' },
  { name: 'Webhook Phantom',  rarity: 'Epic',      color: 'oklch(0.65 0.20 350)', glyph: '⬢' },
  { name: 'Thunder Cache',    rarity: 'Rare',      color: 'oklch(0.72 0.15 200)', glyph: '◆' },
  { name: 'Deadlock Specter', rarity: 'Uncommon',  color: 'oklch(0.72 0.18 142)', glyph: '◇' },
  { name: 'Memory Parasite',  rarity: 'Common',    color: 'oklch(0.68 0.14 155)', glyph: '○' },
];

const TESTIMONIALS = [
  { handle: '@priya_srini',     name: 'Priya S.',      sub: 'SWE II → Staff · Stripe',  body: `Failed 4 staff-level system design loops. After 3 weeks on engprep, passed 3 in a row. The War Room scenarios are eerily close to what they actually ask.` },
  { handle: '@backend_dev_nyc', name: 'Marcus T.',     sub: 'Senior SWE · Cloudflare',  body: `Finally. A tool that doesn't make me feel like I'm studying for a math competition. The War Room is exactly what we ask in our senior loops.` },
  { handle: '@frontend_monk',   name: 'Aisha L.',      sub: 'Mid → Senior · Shopify',   body: `Was failing System Design for 3 months. engprep showed me WHERE my bottlenecks were instead of making me draw boxes on a whiteboard.` },
  { handle: '@siddharth_g_dev', name: 'Siddharth G.', sub: 'SWE III · Google',          body: 'The PR Review mode caught exactly the kind of bugs that show up in real code reviews. I felt prepared for actual work, not just whiteboard tricks.' },
];

const MODES = [
  { id: 'war', label: 'War Room', badge: 'P0 Incident', color: 'oklch(0.62 0.22 27)', desc: 'Live debugging under real time pressure. Something is broken and customers are impacted. Own it.' },
  { id: 'pr',  label: 'PR Review', badge: 'Security', color: 'oklch(0.78 0.16 75)', desc: 'Catch real vulnerabilities, logic errors, and performance bugs in code just like your senior engineers do.' },
  { id: 'sys', label: 'System Design', badge: 'Architecture', color: 'oklch(0.62 0.18 240)', desc: 'Drop components on a canvas, connect them into an architecture, validate against real engineering constraints.' },
  { id: 'dsa', label: 'Contextual DSA', badge: 'On-Call', color: 'oklch(0.62 0.18 290)', desc: 'Algorithms framed in actual engineering scenarios. Not "reverse a linked list" — "debug why the retry queue is exploding."' },
];

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSelected, setDemoSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState(0);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyCommand = useCallback(() => {
    navigator.clipboard.writeText('npm install -g engprep').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className={styles.root}>

      {/* ── Scroll progress ─────────────────────────────────────────────── */}
      <div className={styles.progressBar} style={{ transform: `scaleX(${scrollProgress})` }} />

      {/* ── Background layers ───────────────────────────────────────────── */}
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgBloom} aria-hidden="true" />

      {/* ═══════════════════════════════════════════════════════════════════
          NAV — Frosted glass, collapses to glassmorphism on scroll
      ═══════════════════════════════════════════════════════════════════ */}
      <nav className={`${styles.nav} ${navScrolled ? styles.navScrolled : ''}`} role="navigation">
        <Link href="/" className={styles.navBrand}>
          engprep<span className={styles.navBrandCursor} />
        </Link>

        <div className={styles.navCenter}>
          <Link href="/challenges" className={styles.navLink}>Challenges</Link>
          <Link href="/leaderboard" className={styles.navLink}>Leaderboard</Link>
          <Link href="/raid" className={styles.navLink}>
            <span className={styles.raidDot} aria-label="live" />
            Raid
          </Link>
          <Link href="/codex" className={styles.navLink}>Codex</Link>
          <a href="#pricing" className={styles.navLink} onClick={e => { e.preventDefault(); scrollTo('pricing'); }}>Pricing</a>
        </div>

        <div className={styles.navRight}>
          <div className={styles.navLivePill}>
            <span className={styles.navLiveDot} />
            <span>847 online</span>
          </div>
          <Link href="/login"  className={`${styles.navBtn} ${styles.navBtnGhost}`}>Log in</Link>
          <Link href="/signup" className={`${styles.navBtn} ${styles.navBtnPrimary}`}>Start free →</Link>
        </div>

        <button className={styles.hamburger} onClick={() => setMobileMenuOpen(p => !p)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/challenges" onClick={() => setMobileMenuOpen(false)}>Challenges</Link>
          <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
          <Link href="/raid" onClick={() => setMobileMenuOpen(false)}>Raid</Link>
          <Link href="/codex" onClick={() => setMobileMenuOpen(false)}>Codex</Link>
          <Link href="/signup" className={styles.mobileMenuCta} onClick={() => setMobileMenuOpen(false)}>Start free →</Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Split emphasis, terminal as proof not hero
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroGlowLeft}  aria-hidden="true" />
        <div className={styles.heroGlowRight} aria-hidden="true" />

        <div className={styles.heroInner}>
          {/* Badge */}
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            4,200+ engineers from Google, Stripe, Cloudflare
          </div>

          {/* Split-emphasis headline — Skills.md 3.2 */}
          <h1 className={styles.heroHeadline}>
            <span className={styles.heroHeadlineDim}>Stop reversing binary trees.</span>
            <br />
            <span className={styles.heroHeadlineBright}>Start engineering.</span>
          </h1>

          <p className={styles.heroSub}>
            LeetCode is fine. But your job looks like this: a checkout is failing at 3am,
            a PR is hiding a race condition, and your system just hit 10M users. Train for that.
          </p>

          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.heroCta} id="hero-cta-primary">
              Start free — no card needed
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{marginLeft:6}}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <button className={styles.heroSecondary} onClick={() => scrollTo('modes')} id="hero-see-how">
              See how it works
            </button>
          </div>

          {/* Social proof */}
          <div className={styles.heroProof}>
            <div className={styles.heroAvatarStack}>
              {[0,1,2,3,4,5].map(n => (
                <div key={n} className={`${styles.heroAvatar} ${styles[`heroAvatar${n}` as keyof typeof styles]}`} />
              ))}
            </div>
            <span className={styles.heroProofText}>
              Joined by <strong>4,200+</strong> engineers from Google, Stripe, and Cloudflare
            </span>
          </div>

          {/* Terminal — proof, not the main focus */}
          <div className={styles.heroTerminal}>
            <div className={styles.termBar}>
              <span className={styles.termDot} style={{ background: '#ef4444' }} />
              <span className={styles.termDot} style={{ background: '#f59e0b' }} />
              <span className={styles.termDot} style={{ background: 'oklch(0.72 0.18 142)' }} />
              <span className={styles.termTitle}>incident — war-room-42</span>
              <button className={`${styles.termCopy} ${copied ? styles.termCopyDone : ''}`} onClick={copyCommand}>
                {copied ? '✓ copied' : 'copy'}
              </button>
            </div>
            <div className={styles.termBody}>
              <div className={styles.termLine}>
                <span className={styles.termPrompt}>$</span>
                <span className={styles.termCmd}>engprep pull war-room-42</span>
              </div>
              <div className={styles.termOut}>✓ incident bundle → ./incidents/war-room-42/</div>
              <div className={styles.termLine}>
                <span className={styles.termPrompt}>$</span>
                <span className={styles.termCmd}>engprep run --mode=war-room</span>
              </div>
              <div className={styles.termOut} style={{color:'oklch(0.62 0.22 27)'}}>⚠ [P0] payment-processor: latency 34,212ms · 6 regions down</div>
              <div className={styles.termLine}>
                <span className={styles.termPrompt}>$</span>
                <span className={styles.termCursor} />
              </div>
            </div>
          </div>
        </div>

        <button className={styles.scrollHint} onClick={() => scrollTo('ticker')} aria-label="Scroll down">
          <div className={styles.scrollHintLine} />
          <span>scroll</span>
        </button>
      </section>

      {/* ── Company ticker ──────────────────────────────────────────────── */}
      <div className={styles.ticker} id="ticker">
        <div className={styles.tickerFadeLeft} />
        <div className={styles.tickerTrack}>
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <span key={i} className={styles.tickerItem}>{c}</span>
          ))}
        </div>
        <div className={styles.tickerFadeRight} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PROBLEM FRAMING — Honest, not attacking LeetCode
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.problem}>
        <div className="container">
          <p className={styles.eyebrow}>The gap</p>
          <h2 className={styles.problemHeadline}>
            <span className={styles.dimText}>LeetCode is fine.</span>
            <br />But your job looks like this.
          </h2>
          <p className={styles.problemSub}>
            Both matter. Only one of them actually gets you hired and makes you a better engineer.
          </p>

          <div className={styles.problemGrid}>
            {/* LeetCode side — low contrast, de-emphasised */}
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>
                <span className={styles.problemBadgeMuted}>LeetCode</span>
                <span className={styles.problemColTitle}>Interview prep</span>
              </div>
              {[
                'Reverse a linked list in O(n)',
                'Find the kth largest element',
                'Implement BFS from memory',
                'Solve DP problems in 20 minutes',
              ].map(t => (
                <div key={t} className={`${styles.problemRow} ${styles.problemRowMuted}`}>
                  <span className={styles.problemBullet}>–</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <div className={styles.problemDivider}><span>vs</span></div>

            {/* EngPrep side — full brightness */}
            <div className={`${styles.problemColumn} ${styles.problemColumnGood}`}>
              <div className={styles.problemColHeader}>
                <span className={styles.problemBadgeGood}>engprep</span>
                <span className={styles.problemColTitle}>What your job requires</span>
              </div>
              {[
                'Debug why checkout fails for 12% of users',
                'Review a PR hiding a memory leak',
                'Design a system handling 10M users/day',
                'Own a P0 incident under real time pressure',
              ].map(t => (
                <div key={t} className={`${styles.problemRow} ${styles.problemRowGood}`}>
                  <span className={styles.problemCheck}>✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.problemNote}>
            Both matter. Only one of them gets you hired <em>and</em> makes you a better engineer.
          </p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            <AnimatedStat end={4200}  suffix="+" label="Engineers enrolled" />
            <AnimatedStat end={120}   suffix="+" label="Real-world scenarios" />
            <AnimatedStat end={94}    suffix="%" label="Interview success rate" />
            <AnimatedStat end={3}     suffix="mo" label="Avg. prep time saved" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FOUR MODES — Show the product, not the description
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.modes} id="modes">
        <div className="container">
          <p className={styles.eyebrow}>Four practice modes</p>
          <h2 className={styles.sectionHeadline}>
            Zero toy problems.
          </h2>
          <p className={styles.sectionSub}>
            Every session simulates real engineering: a live incident, a vulnerable PR, a system under load. Pick your mode.
          </p>

          {/* Mode nav */}
          <div className={styles.modeNav}>
            {MODES.map((m, i) => (
              <button
                key={m.id}
                className={`${styles.modeTab} ${activeMode === i ? styles.modeTabActive : ''}`}
                style={activeMode === i ? { '--mode-color': m.color } as React.CSSProperties : undefined}
                onClick={() => setActiveMode(i)}
              >
                <span className={styles.modeTabBadge} style={activeMode === i ? { background: m.color + '22', color: m.color, borderColor: m.color + '44' } : undefined}>
                  {m.badge}
                </span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Mode panel */}
          <div className={styles.modePanel} style={{ '--mode-color': MODES[activeMode].color } as React.CSSProperties}>
            <div className={styles.modePanelLeft}>
              <p className={styles.modePanelEyebrow} style={{ color: MODES[activeMode].color }}>{MODES[activeMode].label}</p>
              <h3 className={styles.modePanelTitle}>{MODES[activeMode].desc}</h3>
              <Link href="/signup" className={styles.modePanelBtn} style={{ background: MODES[activeMode].color }}>
                Try {MODES[activeMode].label} →
              </Link>
            </div>
            <div className={styles.modePanelRight}>
              {activeMode === 0 && <WarRoomVisual />}
              {activeMode === 1 && <PRReviewVisual />}
              {activeMode === 2 && <SystemDesignVisual />}
              {activeMode === 3 && <DSAVisual />}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MASTERY CODEX — SVG glyphs, ambient glow, honest copy
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.codex}>
        <div className="container">
          <div className={styles.codexHeaderRow}>
            <div>
              <p className={styles.eyebrow}>Mastery Codex</p>
              <h2 className={styles.sectionHeadline}>Every bug you kill becomes lore.</h2>
              <p className={styles.sectionSub}>
                Solve challenges to capture creatures. Rare engineering patterns unlock Legendary creatures.
                Your collection is living proof of engineering depth — not just solved problems.
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
                <div className={styles.codexGlow} />
                <div className={styles.codexGlyph}>{c.glyph}</div>
                <div className={styles.codexName}>{c.name}</div>
                <div className={styles.codexRarity}>{c.rarity}</div>
              </div>
            ))}
          </div>
          <div className={styles.codexFootnote}>31 creatures across 10 engineering archetypes</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WEEKLY RAID — Live broadcast treatment
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.raid}>
        <div className={styles.raidAmbient} aria-hidden="true" />
        <div className="container">
          <div className={styles.raidInner}>
            <div className={styles.raidLeft}>
              <div className={styles.raidEyebrow}>
                <span className={styles.raidLiveDot} />
                Weekly Raid — LIVE
              </div>
              <h2 className={styles.raidTitle}>
                <span className={styles.dimText}>847 engineers</span> are responding
                <br />to a P0 right now.
              </h2>
              <p className={styles.raidDesc}>
                Every Friday, a global P0 incident drops. Every engineer on the platform
                responds together. The fastest resolvers earn Legendary drops and XP bonuses.
                Engineering is competitive — own it.
              </p>
              <div className={styles.raidStats}>
                {[
                  { val: '847', label: 'Engineers in' },
                  { val: '37%', label: 'Solve rate' },
                  { val: '2d 23h', label: 'Time left' },
                ].map(s => (
                  <div key={s.label} className={styles.raidStat}>
                    <div className={styles.raidStatVal}>{s.val}</div>
                    <div className={styles.raidStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/raid" className={styles.raidCta}>Join the Raid →</Link>
            </div>

            <div className={styles.raidRight}>
              <div className={styles.raidTerminal}>
                <div className={styles.raidTermBar}>
                  <span className={styles.termDot} style={{ background: '#ef4444' }} />
                  <span className={styles.termDot} style={{ background: '#f59e0b' }} />
                  <span className={styles.termDot} style={{ background: 'oklch(0.72 0.18 142)' }} />
                  <span className={styles.raidTermTitle}>Global Payment Rail Meltdown</span>
                  <span className={styles.raidLiveBadge}>⬤ LIVE</span>
                </div>
                <div className={styles.raidLog}>
                  {[
                    { level: 'P0',    color: 'oklch(0.62 0.22 27)', msg: 'payment-processor: latency 34,212ms · 6 regions' },
                    { level: 'FATAL', color: 'oklch(0.62 0.22 27)', msg: 'pgbouncer: pool exhausted 14500/14500' },
                    { level: 'WARN',  color: 'oklch(0.78 0.16 75)', msg: 'stripe-ingest: 14,832 webhook events / 60s' },
                    { level: 'ERROR', color: 'oklch(0.62 0.22 27)', msg: 'webhook-dispatcher: no concurrency limit set' },
                  ].map((l, i) => (
                    <div key={i} className={styles.raidLogLine}>
                      <span className={styles.raidLogLevel} style={{ color: l.color }}>[{l.level}]</span>
                      {l.msg}
                    </div>
                  ))}
                  <div className={styles.raidLogLine}>
                    <span className={styles.termPrompt}>$</span>
                    <span className={styles.termCursor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TESTIMONIALS — Deterministic gradient hashes, "You" anchor
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.testimonials}>
        <div className="container">
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>What engineers say</p>
          <h2 className={styles.sectionHeadline} style={{ textAlign: 'center' }}>Real quotes. No made-up testimonials.</h2>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div
                    className={styles.testimonialAvatar}
                    style={{ background: `linear-gradient(135deg, oklch(0.62 0.18 ${(i * 80 + 120) % 360}), oklch(0.62 0.18 ${(i * 80 + 200) % 360}))` }}
                  >
                    {t.name.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialSub}>{t.sub}</div>
                  </div>
                  <div className={styles.xLogo}>𝕏</div>
                </div>
                <p className={styles.testimonialBody}>&ldquo;{t.body}&rdquo;</p>
                <div className={styles.testimonialHandle}>{t.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE DEMO — Give user agency, interaction > broadcast
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.demo} id="demo">
        <div className="container">
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Try it now</p>
          <h2 className={styles.sectionHeadline} style={{ textAlign: 'center' }}>
            &ldquo;Any AI can pass a coding test.<br />Only you can own the incident.&rdquo;
          </h2>

          <div className={styles.demoCard}>
            <div className={styles.demoAlert}>
              <span className={styles.demoAlertDot} />
              <span>[CRITICAL] 2026-04-03 14:31 · Payment Gateway &gt;5000ms · $2.4M/hr impact</span>
            </div>
            <p className={styles.demoQ}>
              A massive traffic spike hits your API. Database CPU is at 99%. P99 latency is failing checkouts.
              <strong> What is your first action?</strong>
            </p>
            <div className={styles.demoOptions}>
              {[
                { id: 1, text: 'A.  Restart the database cluster' },
                { id: 2, text: 'B.  Enable the emergency request rate limiter' },
                { id: 3, text: 'C.  SSH into primary db and run EXPLAIN on active queries' },
              ].map(({ id, text }) => (
                <button
                  key={id}
                  className={`${styles.demoOption}
                    ${demoSelected === id && id === 2 ? styles.demoOptionCorrect : ''}
                    ${demoSelected === id && id !== 2 ? styles.demoOptionWrong : ''}
                    ${demoSelected !== null && demoSelected !== id ? styles.demoOptionDimmed : ''}`}
                  onClick={() => setDemoSelected(id)}
                >
                  <span>{text}</span>
                  {demoSelected === id && id === 2 && <span className={styles.demoCheck}>✓</span>}
                  {demoSelected === id && id !== 2 && <span className={styles.demoWrong}>✗</span>}
                </button>
              ))}
            </div>
            {demoSelected !== null && (
              <div className={`${styles.demoResult} ${demoSelected === 2 ? styles.demoResultCorrect : styles.demoResultWrong}`}>
                {demoSelected === 2
                  ? '✓ Correct. Shedding load is the fastest way to save the database and allow valid requests to succeed. Debug root cause once stable.'
                  : demoSelected === 1
                    ? '✗ Restarting under load causes a cache stampede or connection storm upon reboot — worsens the incident.'
                    : '✗ While investigating is good, the system is actively failing. Mitigate impact first, then debug root cause.'}
              </div>
            )}
            <div className={styles.demoCta}>
              <Link href="/signup" className={styles.heroCta}>Practice full War Room scenarios →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRICING — Honest, no fake urgency, monthly equivalents
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.pricing} id="pricing">
        <div className="container">
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Pricing</p>
          <h2 className={styles.sectionHeadline} style={{ textAlign: 'center' }}>Simple. Honest. No dark patterns.</h2>

          <div className={styles.pricingGrid}>

            <div className={styles.priceCard}>
              <div className={styles.priceTitle}>Free</div>
              <div className={styles.priceSub}>Explore the platform</div>
              <div className={styles.priceAmt}>$0<span className={styles.pricePer}> forever</span></div>
              <ul className={styles.priceFeatures}>
                <li>10 challenges (sampler set)</li>
                <li>2 War Room attempts</li>
                <li>10 Codex creatures</li>
                <li>Streak tracking</li>
                <li>Public profile &amp; rank card</li>
              </ul>
              <Link href="/signup" className={styles.priceBtnFree}>Start for free</Link>
            </div>

            <div className={`${styles.priceCard} ${styles.priceCardPro}`}>
              <div className={styles.priceTitle}>Pro</div>
              <div className={styles.priceSub}>Serious interview prep</div>
              <div className={styles.priceAmt}>
                $399<span className={styles.pricePer}>/yr</span>
              </div>
              <div className={styles.priceEquiv}>= $33/mo billed annually</div>
              <ul className={styles.priceFeatures}>
                <li>Everything in Free</li>
                <li><strong>All 150+ challenges</strong></li>
                <li>Unlimited War Rooms</li>
                <li>Advanced System Design simulator</li>
                <li>Company-specific interview tracks</li>
                <li>12-week structured roadmap</li>
              </ul>
              <Link href="/pricing" className={styles.priceBtnPro}>Upgrade to Pro →</Link>
            </div>

            <div className={`${styles.priceCard} ${styles.priceCardLegendary}`}>
              <div className={styles.priceTitle}>Legendary</div>
              <div className={styles.priceSub}>For the obsessive few</div>
              <div className={`${styles.priceAmt} ${styles.priceAmtGold}`}>
                $799<span className={styles.pricePer}>/yr</span>
              </div>
              <div className={styles.priceEquiv}>= $67/mo billed annually</div>
              <ul className={styles.priceFeatures}>
                <li>Everything in Pro</li>
                <li><strong>Shiny creature variants</strong></li>
                <li>1-on-1 mock interviews (×2/mo)</li>
                <li>Priority Discord support</li>
                <li>Founding member badge</li>
              </ul>
              <Link href="/pricing" className={styles.priceBtnLegendary}>Go Legendary →</Link>
            </div>

          </div>
          <p className={styles.pricingNote}>
            All plans include a 7-day money-back guarantee.{' '}
            <Link href="/pricing" style={{ color: 'oklch(0.72 0.18 142)' }}>Full comparison →</Link>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaGlow} />
        <div className="container">
          <div className={styles.finalCtaInner}>
            <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Ready?</p>
            <h2 className={styles.finalCtaHeadline}>
              <span className={styles.dimText}>A better engineer</span>
              <br />
              <span className={styles.finalCtaAccent}>starts today.</span>
            </h2>
            <p className={styles.finalCtaBody}>
              Join 4,200+ engineers who stopped grinding LeetCode<br />and started training like the job actually works.
            </p>
            <Link href="/signup" className={styles.heroCta} id="final-cta">
              Start free — no card needed →
            </Link>
            <p className={styles.finalCtaHint}>Free forever. Upgrade when you&apos;re ready.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>engprep<span className={styles.navBrandCursor} /></div>
              <div className={styles.footerTagline}>Real engineering. Real interviews. Real growth.</div>
              <div className={styles.footerSocials}>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.footerSocial}>𝕏</a>
                <a href="https://github.com"  target="_blank" rel="noopener noreferrer" className={styles.footerSocial}>GH</a>
                <a href="https://discord.gg"  target="_blank" rel="noopener noreferrer" className={styles.footerSocial}>DC</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <h4>Practice</h4>
              <ul>
                <li><Link href="/challenges">Challenges</Link></li>
                <li><Link href="/raid">Weekly Raid</Link></li>
                <li><Link href="/leaderboard">Leaderboard</Link></li>
                <li><Link href="/codex">Mastery Codex</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
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

/* ─── Visual Components ───────────────────────────────────────────────────── */

function WarRoomVisual() {
  return (
    <div className={styles.visualCard}>
      <div className={styles.vcBar}>
        <span className={styles.termDot} style={{ background: '#ef4444' }} />
        <span className={styles.termDot} style={{ background: '#f59e0b' }} />
        <span className={styles.termDot} style={{ background: 'oklch(0.72 0.18 142)' }} />
        <span className={styles.vcTitle}>war-room — P0 incident</span>
        <span className={styles.vcLive}>⬤ LIVE</span>
      </div>
      <div className={styles.vcBody}>
        <div className={styles.incidentAlert}>
          <span className={styles.incidentDot} />
          ENG-911: Checkout failure · 12% error rate · Deploy at 14:28
        </div>
        <div className={styles.metricsRow}>
          {[
            { l: 'Error Rate',  v: '12.4%',  crit: true },
            { l: 'P99 Latency', v: '2.4s',   crit: true },
            { l: 'Cache Hits',  v: '31%',    crit: false },
            { l: 'DB CPU',      v: '97%',    crit: true },
          ].map(m => (
            <div key={m.l} className={`${styles.metricBox} ${m.crit ? styles.metricBoxCrit : ''}`}>
              <div className={styles.metricLabel}>{m.l}</div>
              <div className={styles.metricValue}>{m.v}</div>
            </div>
          ))}
        </div>
        <div className={styles.logBlock}>
          <div className={styles.logLine}><span style={{ color: 'oklch(0.78 0.16 75)' }}>[WARN]</span>  14:31:02 · Cache eviction rate exceeded</div>
          <div className={styles.logLine}><span style={{ color: 'oklch(0.62 0.22 27)' }}>[ERROR]</span> 14:31:45 · DB connection pool exhausted (512/512)</div>
          <div className={styles.logLine}><span style={{ color: 'oklch(0.62 0.22 27)' }}>[FATAL]</span> 14:31:57 · payment-processor-3: OOM killed</div>
          <div className={styles.logLine}><span className={styles.termPrompt}>$</span> <span className={styles.termCursor} /></div>
        </div>
      </div>
    </div>
  );
}

function PRReviewVisual() {
  return (
    <div className={styles.visualCard}>
      <div className={styles.vcBar}>
        <span className={styles.termDot} style={{ background: '#ef4444' }} />
        <span className={styles.termDot} style={{ background: '#f59e0b' }} />
        <span className={styles.termDot} style={{ background: 'oklch(0.72 0.18 142)' }} />
        <span className={styles.vcTitle}>auth/session.ts — spot the vulnerability</span>
      </div>
      <div className={styles.vcBody}>
        {[
          { n: 12, type: '',        code: 'export async function createSession(userId: string) {' },
          { n: 13, type: '',        code: '  const token = Math.random().toString(36);' },
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
        <div className={styles.prHint}>→ Two vulnerabilities. Can you find them?</div>
      </div>
    </div>
  );
}

function SystemDesignVisual() {
  const NODES = [
    { label: 'Client',      x: 6,  y: 40, color: 'oklch(0.62 0.18 240)' },
    { label: 'CDN',         x: 28, y: 14, color: 'oklch(0.62 0.18 290)' },
    { label: 'API Gateway', x: 50, y: 40, color: 'oklch(0.72 0.18 142)' },
    { label: 'Redis',       x: 72, y: 16, color: 'oklch(0.78 0.16 75)'  },
    { label: 'Postgres',    x: 72, y: 62, color: 'oklch(0.62 0.22 27)'  },
  ];
  return (
    <div className={styles.visualCard}>
      <div className={styles.vcBar}>
        <span className={styles.termDot} style={{ background: '#ef4444' }} />
        <span className={styles.termDot} style={{ background: '#f59e0b' }} />
        <span className={styles.termDot} style={{ background: 'oklch(0.72 0.18 142)' }} />
        <span className={styles.vcTitle}>system-design canvas</span>
      </div>
      <div className={styles.vcBody} style={{ position: 'relative', minHeight: 160 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="14" y1="43" x2="30" y2="19" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
          <line x1="14" y1="45" x2="52" y2="45" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
          <line x1="58" y1="43" x2="73" y2="21" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
          <line x1="58" y1="47" x2="73" y2="64" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
        </svg>
        {NODES.map(n => (
          <div key={n.label} className={styles.sysNode} style={{ left: `${n.x}%`, top: `${n.y}%`, borderColor: n.color, color: n.color }}>
            {n.label}
          </div>
        ))}
        <div className={styles.sysPrompt}>Design a URL shortener at 100K writes/sec</div>
      </div>
    </div>
  );
}

function DSAVisual() {
  return (
    <div className={styles.visualCard}>
      <div className={styles.vcBar}>
        <span className={styles.termDot} style={{ background: '#ef4444' }} />
        <span className={styles.termDot} style={{ background: '#f59e0b' }} />
        <span className={styles.termDot} style={{ background: 'oklch(0.72 0.18 142)' }} />
        <span className={styles.vcTitle}>contextual-dsa — on-call</span>
      </div>
      <div className={styles.vcBody}>
        <div className={styles.dsaScenario}>
          You&apos;re on-call at 2am. A payment retry queue is growing exponentially.
          Identify duplicated payment IDs before the queue exhausts memory.
        </div>
        <div className={styles.dsaCode}>
          <span style={{color:'#8a8a96'}}>{'// Input: ["p-001","p-003","p-001","p-007","p-003"]'}</span>{'\n'}
          <span style={{color:'#8a8a96'}}>{'// Output: ["p-001","p-003"] — O(n log n)'}</span>{'\n\n'}
          <span style={{color:'oklch(0.62 0.18 290)'}}>function </span>
          <span style={{color:'oklch(0.62 0.18 240)'}}>findDuplicates</span>
          {'(ids: string[]): string[] {\n'}
          {'  '}
          <span style={{color:'#8a8a96'}}>{'// your solution here'}</span>
          {'\n}'}
        </div>
      </div>
    </div>
  );
}
