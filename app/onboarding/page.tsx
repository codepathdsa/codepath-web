'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Role = 'SDE1' | 'SDE2' | 'SDE3' | null;

const COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Apple', 'Microsoft',
  'Stripe', 'Airbnb', 'Notion', 'Linear', 'Vercel',
  'Other', 'Not sure yet'
];

interface StarterCreature {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  specialty: string;
  type: string;
  typeClass: string;
  accentColor: string;
  description: string;
}

const STARTER_CREATURES: StarterCreature[] = [
  {
    id: 'cache-miss',
    name: 'Cache Miss',
    emoji: '⚡',
    tagline: 'Speed-obsessed. Systems first.',
    specialty: 'System Design + Performance',
    type: 'System Design',
    typeClass: 'badge-design',
    accentColor: '#3b82f6',
    description: 'Born from the chaos of a cache stampede. Thrives in distributed systems, latency wars, and database tradeoffs. Engineers who choose Cache Miss think in data flows and failure modes.',
  },
  {
    id: 'null-gremlin',
    name: 'Null Pointer Gremlin',
    emoji: '🐛',
    tagline: 'Chaotic. Precise. Finds bugs others miss.',
    specialty: 'Contextual DSA + Debugging',
    type: 'Contextual DSA',
    typeClass: 'badge-dsa',
    accentColor: '#62de61',
    description: 'The most feared creature in any codebase. Lives in edge cases, off-by-one errors, and null reference exceptions. Engineers who choose the Gremlin love diving deep into the algorithm.',
  },
  {
    id: 'spaghetti-hatchling',
    name: 'Spaghetti Hatchling',
    emoji: '🍝',
    tagline: 'Master of legacy code. Embraces the mess.',
    specialty: 'PR Review + Code Quality',
    type: 'PR Review',
    typeClass: 'badge-pr',
    accentColor: '#f97316',
    description: 'Hatched inside a 12,000-line God class with no tests. Evolved by reading 10,000 pull requests. Engineers who choose the Hatchling see through bad abstractions and improve every codebase they touch.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<StarterCreature | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
  };

  const toggleCompany = (company: string) => {
    if (company === 'Not sure yet') {
      setStep(3);
      return;
    }
    if (targetCompanies.includes(company)) {
      setTargetCompanies(targetCompanies.filter(c => c !== company));
    } else {
      if (targetCompanies.length < 3) {
        setTargetCompanies([...targetCompanies, company]);
      }
    }
  };

  const handleTimelineSelect = () => {
    setStep(4);
  };

  const handleCreatureSelect = (creature: StarterCreature) => {
    setSelectedCreature(creature);
    setStep(5);
  };

  const completeChallenge = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2800);
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>engprep</Link>
        <div className={styles.progress}>STEP 0{step} / 05</div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          {step === 1 && (
            <>
              <h1 className={styles.title}>Where are you in your career?</h1>
              <div className={styles.gridRoles}>
                <div className={styles.card} onClick={() => handleRoleSelect('SDE1')}>
                  <div className={styles.cardTitle}>Entry Level</div>
                  <div className={styles.cardSub}>(0–2 yrs)</div>
                </div>
                <div className={styles.card} onClick={() => handleRoleSelect('SDE2')}>
                  <div className={styles.cardTitle}>Mid Level</div>
                  <div className={styles.cardSub}>(2–5 yrs)</div>
                </div>
                <div className={styles.card} onClick={() => handleRoleSelect('SDE3')}>
                  <div className={styles.cardTitle}>Senior</div>
                  <div className={styles.cardSub}>(5+ yrs)</div>
                </div>
              </div>
              <button className={styles.skipLink} onClick={handleSkip}>Skip and explore on my own →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className={styles.title}>Targeting a specific company?</h1>
              <div className={styles.companiesGrid}>
                {COMPANIES.map(company => (
                  <div 
                    key={company} 
                    className={`${styles.companyCard} ${targetCompanies.includes(company) ? styles.selected : ''}`}
                    onClick={() => toggleCompany(company)}
                  >
                    {company}
                  </div>
                ))}
              </div>
              <p className="t-body" style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                Select up to 3. Based on your role ({role}).
              </p>
              <button className={`btn-primary ${styles.continueBtn}`} onClick={() => setStep(3)}>
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className={styles.title}>When is your interview?</h1>
              <div className={styles.timelineGrid}>
                <div className={styles.timelineCard} onClick={handleTimelineSelect}>
                  <div className={styles.timelineTitle}>Within 2 weeks</div>
                  <div className={styles.timelineSub}>Sprint Mode — highest-impact challenges first</div>
                </div>
                <div className={styles.timelineCard} onClick={handleTimelineSelect}>
                  <div className={styles.timelineTitle}>1–2 months</div>
                  <div className={styles.timelineSub}>Steady Prep — balanced daily schedule</div>
                </div>
                <div className={styles.timelineCard} onClick={handleTimelineSelect}>
                  <div className={styles.timelineTitle}>3+ months</div>
                  <div className={styles.timelineSub}>Deep Build — full curriculum order</div>
                </div>
                <div className={styles.timelineCard} onClick={handleTimelineSelect}>
                  <div className={styles.timelineTitle}>Just exploring</div>
                  <div className={styles.timelineSub}>Unlocks everything, no guided path</div>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className={styles.title}>Choose your first companion.</h1>
              <p className="t-body" style={{ textAlign: 'center', marginBottom: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                Every engineer starts with one creature. It shapes your daily encounter pool and signals your primary engineering identity.
              </p>
              <div className={styles.creatureGrid}>
                {STARTER_CREATURES.map(creature => (
                  <div
                    key={creature.id}
                    className={styles.creatureCard}
                    style={{ '--creature-accent': creature.accentColor } as React.CSSProperties}
                    onClick={() => handleCreatureSelect(creature)}
                  >
                    <div className={styles.creatureEmoji}>{creature.emoji}</div>
                    <div className={styles.creatureName}>{creature.name}</div>
                    <div className={styles.creatureTagline}>{creature.tagline}</div>
                    <span className={`badge ${creature.typeClass}`} style={{ marginBottom: 'var(--space-3)' }}>{creature.type}</span>
                    <p className={styles.creatureDesc}>{creature.description}</p>
                    <div className={styles.creatureSpecialty}>
                      <span>Specialty:</span> {creature.specialty}
                    </div>
                    <button className={styles.chooseBtn}>Choose {creature.name} →</button>
                  </div>
                ))}
              </div>
              <button className={styles.skipLink} onClick={() => setStep(5)}>Skip — choose later →</button>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className={styles.title}>Let's start. This takes 8 minutes.</h1>
              
              <div className={styles.challengePreview}>
                <div className={styles.challengeHeader}>
                  <span className="badge badge-dsa">DSA Contextual</span>
                  <span className={styles.challengeMeta}>ENG-204 · 8 min est.</span>
                </div>
                <h2 className={styles.cardTitle} style={{ marginBottom: 'var(--space-4)'}}>
                  ENG-204: Telemetry dropped packets investigation
                </h2>
                <div className="t-body" style={{ marginBottom: 'var(--space-6)'}}>
                  Our IoT pipeline is parsing millions of incoming packets per second, but randomly discarding valid telemetry payloads. We narrowed it down to the sliding window validator string implementation. 
                  <br/><br/>
                  Find the edge case where the window shrinks incorrectly so we can unblock the release.
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--space-3)'}}>
                  <button className="btn-primary" onClick={completeChallenge}>
                    Simulate Solving Challenge
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            {selectedCreature ? (
              <>
                <div className={styles.successCreatureEmoji}>{selectedCreature.emoji}</div>
                <div className={styles.captureLabel}>✦ CAPTURED</div>
                <h2 className="t-heading" style={{ marginBottom: 'var(--space-2)' }}>{selectedCreature.name}</h2>
                <p className="t-body" style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>{selectedCreature.tagline}</p>
                <div className="badge badge-dsa" style={{ fontSize: 'var(--text-lg)', padding: '6px 12px', marginBottom: 'var(--space-3)' }}>+50 XP</div>
                <p className="t-body" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>1 / 120 in your Codex. 119 to go.</p>
              </>
            ) : (
              <>
                <div className={styles.successIcon}>✓</div>
                <h2 className="t-heading" style={{ marginBottom: 'var(--space-2)' }}>First Win!</h2>
                <p className="t-body" style={{ marginBottom: 'var(--space-6)' }}>You successfully simulated a real incident fix.</p>
                <div className="badge badge-active" style={{ fontSize: 'var(--text-lg)', padding: '6px 12px' }}>+50 XP</div>
              </>
            )}
            <p className="t-body" style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Loading your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
