import OAuthButtons from '../components/OAuthButtons';
import Link from 'next/link';
import styles from '../auth.module.css';
import { credentialsSignIn } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>
}) {
  const { error, success, next = '/dashboard' } = await searchParams;

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
            <p className={styles.subtitle}>Sign in with your verified account to access premium scenarios.</p>
          </div>

          {error && <div className={styles.errorMsg}>{decodeURIComponent(error)}</div>}
          {success && <div className={styles.successMsg}>{decodeURIComponent(success)}</div>}

          <OAuthButtons next={next} />

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine}></div>
          </div>

          <form className={styles.form} action={credentialsSignIn}>
            <input type="hidden" name="next" value={next} />
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="engineer@company.com" 
                className={styles.input} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Password
                <Link href="#" className={styles.forgotLink}>Forgot?</Link>
              </label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                className={styles.input} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
              Sign In
            </button>
          </form>

          <div className={styles.bottomLink}>
            Don&apos;t have an account? <Link href="/signup">Sign up →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
