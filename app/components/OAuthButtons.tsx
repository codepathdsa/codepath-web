'use client';

import { useState } from 'react';
import { getOAuthUrl } from '../login/actions';
import styles from '../auth.module.css';

interface OAuthButtonsProps {
  /** Where to send the user after successful login (e.g. '/dashboard' or '/onboarding') */
  next: string;
}

export default function OAuthButtons({ next }: OAuthButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'github' | 'google' | null>(null);

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError(null);
    setLoading(provider);

    // Server action: tests reachability first, then returns a verified OAuth URL
    const { url, error: oauthError } = await getOAuthUrl(provider, next);

    if (oauthError || !url) {
      setError(oauthError ?? 'Authentication service unavailable. Please try again.');
      setLoading(null);
      return;
    }

    // Only navigate once the server has confirmed Supabase is reachable
    window.location.href = url;
  };

  return (
    <div>
      {error && <div className={styles.errorMsg}>{error}</div>}
      <div className={styles.oauthBtns}>
        <button
          className={styles.btnGithub}
          disabled={loading !== null}
          onClick={() => handleOAuth('github')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {loading === 'github' ? 'Connecting…' : 'Continue with GitHub'}
        </button>
        <button
          className={styles.btnGoogle}
          disabled={loading !== null}
          onClick={() => handleOAuth('google')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
          </svg>
          {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
