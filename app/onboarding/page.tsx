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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2); // Auto-advance
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

  const completeChallenge = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2500);
  };

  // Skip functionality skips to dashboard
  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>engprep</Link>
        <div className={styles.progress}>STEP 0{step} / 04</div>
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
            <div className={styles.successIcon}>✓</div>
            <h2 className="t-heading" style={{ marginBottom: 'var(--space-2)'}}>First Win!</h2>
            <p className="t-body" style={{ marginBottom: 'var(--space-6)'}}>You successfully simulated a real incident fix.</p>
            <div className="badge badge-active" style={{ fontSize: 'var(--text-lg)', padding: '6px 12px' }}>+50 XP</div>
            <p className="t-body" style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>Loading your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
