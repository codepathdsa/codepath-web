import OAuthButtons from '../components/OAuthButtons';
import Link from 'next/link';
import styles from '../auth.module.css';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.topLogo}>
        engprep<span className={styles.logoCursor}></span>
      </Link>

      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.didYouKnow}>
          <div className={styles.dykLabel}>Code Review Intel</div>
          <div className={styles.dykTitle}>The Unforgiving N+1</div>
          <div className={styles.dykBody}>
            At scale, a simple O(N) query inside a loop becomes a database-killing incident. 40% of production slowdowns are traced back to simple ORM misuse in PR changes.<br /><br />
            Our interactive Spot the Bug workspace trains you to catch these before CI does.
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Join engineers from Google, Vercel, and Stripe practicing real workflows.</p>
          </div>

          {error && <div className={styles.errorMsg}>{decodeURIComponent(error)}</div>}

          {/* 
            Auth.js creates a new account automatically on first OAuth sign-in.
            No separate registration step needed. 
          */}
          <OAuthButtons next="/onboarding" />

          <div className={styles.terms}>
            By signing up you agree to our <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link>
          </div>

          <div className={styles.bottomLink}>
            Already have an account? <Link href="/login">Log in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
