import OAuthButtons from '../components/OAuthButtons';
import Link from 'next/link';
import styles from '../auth.module.css';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next = '/dashboard' } = await searchParams;

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

          {error && <div className={styles.errorMsg}>{decodeURIComponent(error)}</div>}

          <OAuthButtons next={next} />

          <div className={styles.bottomLink}>
            Don&apos;t have an account? <Link href="/signup">Sign up →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
