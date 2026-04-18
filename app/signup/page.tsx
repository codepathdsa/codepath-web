import { signup } from '../login/actions';
import OAuthButtons from '../components/OAuthButtons';
import Link from 'next/link';
import styles from '../auth.module.css';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams;

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

          {error && <div className={styles.errorMsg}>{error}</div>}
          {message && <div className={styles.successMsg}>{message}</div>}

          <OAuthButtons next="/onboarding" />

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine}></div>
          </div>

          <form action={signup} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required className={styles.input} suppressHydrationWarning />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input id="password" name="password" type="password" placeholder="Min 8 characters" required className={styles.input} minLength={8} suppressHydrationWarning />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
              Create Account
            </button>
          </form>

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
