'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState('war-room');
  const [demoSelected, setDemoSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install -g engprep');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.main}>
      {/* 1.1 Navigation Bar */}
      <nav className={styles.nav}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: 0 }}>
          <Link href="/" className={styles.navLogo}>
            engprep<span className={styles.navLogoCursor}></span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/challenges" className={styles.navLink}>Challenges</Link>
            <Link href="/challenges/war-room/911" className={styles.navLink}>War Room</Link>
            <Link href="/challenges/system-design/512" className={styles.navLink}>System Design</Link>
            <Link href="/challenges/tribunal/101" className={styles.navLink}>Tribunal</Link>
            <Link href="#pricing" className={styles.navLink}>Pricing</Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/login" className="btn-ghost" style={{ padding: '7px 15px' }}>Log In</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '7px 15px' }}>Start Free</Link>
          </div>
        </div>
      </nav>

      {/* 1.2 Hero Block */}
      <section className={styles.hero}>
        <div className={styles.heroBg}></div>
        <div className="container">
          <h1 className={`t-hero ${styles.heroHeadline}`}>Stop reversing binary trees.<br />Start engineering.</h1>
          <p className={`t-body ${styles.heroSub}`}>
            The only interview platform built for how software actually works — incidents, PRs, system failures, and real tradeoffs.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className="btn-primary">Start Free</Link>
            <Link href="#demo" className="btn-ghost">See How It Works</Link>
          </div>

          <div className="cli-block" style={{ maxWidth: '440px', margin: '0 auto 32px', textAlign: 'left' }}>
            <div className="cli-block__header">
              <span className="cli-block__dot cli-block__dot--red"></span>
              <span className="cli-block__dot cli-block__dot--yellow"></span>
              <span className="cli-block__dot cli-block__dot--green"></span>
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
            </div>
            <button className={`cli-block__copy ${copied ? 'copied' : ''}`} onClick={copyCommand}>
              <span>{copied ? 'Copied ✓' : 'Copy'}</span>
            </button>
          </div>

          <div className={styles.heroProof}>
            Joined by 4,200+ engineers from Google, Stripe, Amazon, Vercel
          </div>
        </div>
      </section>

      {/* 1.3 The Problem Statement */}
      <section className={styles.problemStatement}>
        <div className="container">
          <h2 className={`t-heading ${styles.problemHeader}`}>You've been practicing the wrong thing.</h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>What LeetCode tests</div>
              <div className={`${styles.problemItem} ${styles.problemBad}`}>Reverse a linked list in O(n)</div>
              <div className={`${styles.problemItem} ${styles.problemBad}`}>Find the kth largest element</div>
              <div className={`${styles.problemItem} ${styles.problemBad}`}>Implement BFS from memory</div>
            </div>
            <div className={styles.problemColumn}>
              <div className={styles.problemColHeader}>What your job actually is</div>
              <div className={`${styles.problemItem} ${styles.problemGood}`}>Debug why checkout is failing for 12% of users</div>
              <div className={`${styles.problemItem} ${styles.problemGood}`}>Review a PR that will cause a memory leak</div>
              <div className={`${styles.problemItem} ${styles.problemGood}`}>Design a system that won't crash at 10M users</div>
            </div>
          </div>
          <div className={styles.problemNote}>Both matter. Only one of them actually gets you hired AND makes you a better engineer.</div>
        </div>
      </section>

      {/* 1.4 Feature Showcase */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureTabs}>
            <button className={`${styles.featureTab} ${activeFeatureTab === 'dsa' ? styles.active : ''}`} onClick={() => setActiveFeatureTab('dsa')}>Contextual DSA</button>
            <button className={`${styles.featureTab} ${activeFeatureTab === 'pr' ? styles.active : ''}`} onClick={() => setActiveFeatureTab('pr')}>PR Review</button>
            <button className={`${styles.featureTab} ${activeFeatureTab === 'war-room' ? styles.active : ''}`} onClick={() => setActiveFeatureTab('war-room')}>War Room</button>
            <button className={`${styles.featureTab} ${activeFeatureTab === 'system' ? styles.active : ''}`} onClick={() => setActiveFeatureTab('system')}>System Design</button>
          </div>
          <div className={styles.featureContent}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <div className={styles.mockupDot} style={{ background: '#ef4444' }}></div>
                <div className={styles.mockupDot} style={{ background: '#f59e0b' }}></div>
                <div className={styles.mockupDot} style={{ background: '#22c55e' }}></div>
              </div>
              <div className={styles.mockupTitle}>workspace</div>
            </div>
            <div className={styles.mockupBody}>
              {activeFeatureTab === 'war-room' && (
                <>
                  <div className="t-mono" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    &gt; ENG-911: Checkout failing. Redis hit rate dropped from 94% to 31% at 14:32. A deploy shipped at 14:28. You have 20 minutes.
                  </div>
                  <div className={styles.incidentDash}>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Error Rate</div>
                      <div className={`${styles.metricValue} ${styles.danger}`}>12.4%</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>P99 Latency</div>
                      <div className={styles.metricValue}>2.4s</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Cache Hits</div>
                      <div className={`${styles.metricValue} ${styles.danger}`}>31%</div>
                    </div>
                  </div>
                  <div className={styles.terminalOutput}>
                    [WARN] 14:31:02 - Cache eviction rate exceeded threshold<br/>
                    [ERROR] 14:31:45 - Database connection pool exhausted<br/>
                    <span className={styles.navLogoCursor}></span>
                  </div>
                </>
              )}
              {activeFeatureTab === 'dsa' && (
                <div className="t-mono" style={{ color: 'var(--text-secondary)' }}>Loading Contextual DSA Simulator...</div>
              )}
              {activeFeatureTab === 'pr' && (
                <div className="t-mono" style={{ color: 'var(--text-secondary)' }}>Loading PR Review Environment...</div>
              )}
              {activeFeatureTab === 'system' && (
                <div className="t-mono" style={{ color: 'var(--text-secondary)' }}>Loading System Design Canvas...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Role Tracks */}
      <section className={styles.roles}>
        <div className="container">
          <h2 className="t-heading" style={{ textAlign: 'center' }}>Built for where you are. Designed for where you're going.</h2>
          <div className={styles.rolesGrid}>
            <div className={`${styles.roleCard} ${styles.roleGradient1}`}>
              <div className={styles.roleTitle}>Junior <span className="t-body" style={{marginLeft: '4px'}}>(Entry)</span></div>
              <ul className={styles.roleFeatures}>
                <li>Contextual DSA</li>
                <li>PR Review basics</li>
                <li>War Room Level 1</li>
                <li>Behavioral</li>
              </ul>
              <Link href="/challenges?track=sde1" className="btn-ghost" style={{ justifyContent: 'center' }}>Explore Track →</Link>
            </div>
            <div className={`${styles.roleCard} ${styles.roleGradient2}`}>
              <div className={styles.roleTitle}>JuniorI <span className="t-body" style={{marginLeft: '4px'}}>(Mid)</span></div>
              <ul className={styles.roleFeatures}>
                <li>All Junior features</li>
                <li>Architecture Autopsy</li>
                <li>System Design fundamentals</li>
                <li>Company tracks</li>
              </ul>
              <Link href="/challenges?track=sde2" className="btn-ghost" style={{ justifyContent: 'center' }}>Explore Track →</Link>
            </div>
            <div className={`${styles.roleCard} ${styles.roleGradient3}`}>
              <div className={styles.roleTitle}>JuniorII <span className="t-body" style={{marginLeft: '4px'}}>(Senior)</span></div>
              <ul className={styles.roleFeatures}>
                <li>All JuniorI features</li>
                <li>Tech Debt Tribunal</li>
                <li>Advanced system design</li>
                <li>Staff-level War Room scenarios</li>
              </ul>
              <Link href="/challenges?track=sde3" className="btn-ghost" style={{ justifyContent: 'center' }}>Explore Track →</Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <Link href="/assessment" className="t-body" style={{ textDecoration: 'underline' }}>Not sure? Take the 3-minute assessment →</Link>
          </div>
        </div>
      </section>

      {/* 1.6 The War Room Demo */}
      <section id="demo" className={styles.demo}>
        <div className="container">
          <h2 className={`t-heading ${styles.demoH}`}>"Any AI can pass a coding test. Only you can own the incident."</h2>
          
          <div className={styles.demoBox}>
            <div className={styles.demoLog}>[CRITICAL] 2026-04-03 14:31:22 | Payment Gateway Latency &gt; 5000ms</div>
            <p className="t-body" style={{ marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
              A massive traffic spike hits your API. Database CPU is at 99%. P99 latency is failing checkouts. What is your first action?
            </p>
            <div className={styles.demoOptions}>
              <div className={`${styles.demoOption} ${demoSelected === 1 ? styles.selected : ''}`} onClick={() => setDemoSelected(1)}>
                A. Restart the database cluster
              </div>
              <div className={`${styles.demoOption} ${demoSelected === 2 ? styles.selected : ''}`} onClick={() => setDemoSelected(2)}>
                B. Enable the emergency request rate limiter
              </div>
              <div className={`${styles.demoOption} ${demoSelected === 3 ? styles.selected : ''}`} onClick={() => setDemoSelected(3)}>
                C. SSH into the primary db and run EXPLAIN on active queries
              </div>
            </div>
            
            {demoSelected !== null && (
              <div className={styles.demoResult}>
                {demoSelected === 2 && <span style={{color: 'var(--color-success)', fontWeight: 'bold'}}>Correct. </span>}
                {demoSelected !== 2 && <span style={{color: 'var(--color-error)', fontWeight: 'bold'}}>Incorrect. </span>}
                {demoSelected === 1 && "Restarting under load will likely cause a cache stampede or connection storm upon reboot, worsening the issue."}
                {demoSelected === 2 && "Shedding load is the fastest way to save the database and allow valid requests to succeed. You can debug the root cause once the system is stable."}
                {demoSelected === 3 && "While investigating is good, the system is actively failing checkouts. You need to mitigate impact before you start deep debugging."}
              </div>
            )}
            
            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
               <Link href="/signup" className="btn-primary">Practice full War Room scenarios →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1.7 Social Proof */}
      <section className={styles.social}>
        <div className="container">
          <h2 className="t-heading" style={{ textAlign: 'center' }}>What engineers are saying</h2>
          <div className={styles.socialGrid}>
            <div className={styles.tweet}>
              <div className={styles.tweetHeader}>
                <div className={styles.tweetAvatar}></div>
                <div>
                  <div className={styles.tweetName}>u/backend_dev_nyc</div>
                  <div className={styles.tweetUser}>r/cscareerquestions • 847 upvotes</div>
                </div>
              </div>
              <div className={styles.tweetBody}>
                "Finally. An interview tool that doesn't make me feel like I'm studying for a math competition. The war room stuff is exactly what we ask in our senior loops."
              </div>
            </div>
            <div className={styles.tweet}>
              <div className={styles.tweetHeader}>
                <div className={styles.tweetAvatar}></div>
                <div>
                  <div className={styles.tweetName}>u/frontend_monk</div>
                  <div className={styles.tweetUser}>r/webdev • 1.2k upvotes</div>
                </div>
              </div>
              <div className={styles.tweetBody}>
                "I was failing System Design interviews for 3 months. EngPrep's simulator actually showed me WHERE my bottlenecks were instead of just making me draw boxes on a whiteboard."
              </div>
            </div>
          </div>
          <p className="t-section-label" style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>Real quotes. No made-up corporate testimonials.</p>
        </div>
      </section>

      {/* 1.8 Pricing Preview */}
      <section id="pricing" className={styles.pricing}>
        <div className="container">
          <h2 className="t-heading" style={{ textAlign: 'center' }}>Pricing</h2>
          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <div className={styles.priceTitle}>Free</div>
              <div className={styles.priceSub}>Start today, no card needed</div>
              <div className={styles.priceValue}>$0</div>
              <ul className={styles.priceFeatures}>
                <li>Contextual DSA Workspace</li>
                <li>Basic PR Reviews</li>
                <li>Limited War Room Incidents</li>
              </ul>
              <Link href="/signup" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Start Free →</Link>
            </div>
            <div className={styles.priceCard} style={{ borderColor: 'var(--border-strong)' }}>
              <div className={styles.priceTitle}>Pro</div>
              <div className={styles.priceSub}>For serious interview prep</div>
              <div className={styles.priceValue}>$179<span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>/yr</span></div>
              <ul className={styles.priceFeatures}>
                <li>Complete CLI Syncing</li>
                <li>Advanced System Design Simulator</li>
                <li>Full Architecture Autopsy & Tech Debt</li>
              </ul>
              <Link href="/pricing" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>See full comparison →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1.9 Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerLogo}>engprep</div>
              <div className={styles.footerTag}>Real engineering. Real interviews. Real growth.</div>
            </div>
            <div className={styles.footerLinks}>
              <h4>Product</h4>
              <ul>
                <li><Link href="#challenges">Challenges</Link></li>
                <li><Link href="#war-room">War Room</Link></li>
                <li><Link href="#system-design">System Design</Link></li>
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
                <input type="email" placeholder="Email address" className={styles.nlInput} />
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
