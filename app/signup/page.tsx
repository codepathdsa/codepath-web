import { signup, signInOAuth } from '../login/actions';
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

          <div className={styles.oauthBtns}>
            <form action={signInOAuth.bind(null, 'github', true)}>
              <button className={styles.btnGithub}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                Continue with GitHub
              </button>
            </form>
            <form action={signInOAuth.bind(null, 'google', true)}>
              <button className={styles.btnGoogle}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="currentColor"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                Continue with Google
              </button>
            </form>
          </div>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine}></div>
          </div>

          <form action={signup} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required className={styles.input} />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input id="password" name="password" type="password" placeholder="Min 8 characters" required className={styles.input} minLength={8} />
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
