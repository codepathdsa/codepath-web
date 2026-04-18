import { login } from './actions';
import OAuthButtons from '../components/OAuthButtons';
import Link from 'next/link';
import styles from '../auth.module.css';

export default async function LoginPage({
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
          <div className={styles.dykLabel}>War Room Case #42</div>
          <div className={styles.dykTitle}>The $400M Cache Stampede</div>
          <div className={styles.dykBody}>
            In 2021, a single expired Redis key caused 14,000 DB connections in 2 seconds, bringing down a top-10 e-commerce site on Black Friday.<br /><br />
            Our War Room simulator trains you to identify and fix these state failures before they happen.
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to save your progress and access premium scenarios.</p>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
          {message && <div className={styles.successMsg}>{message}</div>}

          <OAuthButtons next="/dashboard" />

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine}></div>
          </div>

          <form action={login} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required className={styles.input} suppressHydrationWarning />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
                <Link href="#" className={styles.forgotLink}>Forgot password?</Link>
              </label>
              <input id="password" name="password" type="password" placeholder="••••••••" required className={styles.input} suppressHydrationWarning />
            </div>

            <div className={styles.checkboxGroup}>
              <input type="checkbox" id="remember" name="remember" className={styles.checkbox} />
              <label htmlFor="remember" className={styles.checkboxLabel}>Remember me</label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
              Log In
            </button>
          </form>

          <div className={styles.bottomLink}>
            Don't have an account? <Link href="/signup">Sign up →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
