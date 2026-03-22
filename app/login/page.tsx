import { login, signup, signInOAuth } from './actions';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '0 5%' }}>
      
      <div style={{ position: 'absolute', top: 30, left: '5%' }}>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>Code<span style={{color: 'var(--accent)'}}>Path</span></Link>
      </div>

      <div style={{ width: '100%', maxWidth: 400, background: 'var(--surface)', padding: 40, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 900, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em', textAlign: 'center' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: 30 }}>
          Sign in to save your progress and access premium editorials.
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--radius)', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '10px 14px', background: 'var(--green-bg)', color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--radius)', marginBottom: 20 }}>
            {message}
          </div>
        )}

        {/* OAuth buttons — each has its own form so browser validation doesn't block them */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          <form>
            <button formAction={signInOAuth.bind(null, 'github')} style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', border: 'none', background: '#181717', color: 'white', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              Continue with GitHub
            </button>
          </form>
          <form>
            <button formAction={signInOAuth.bind(null, 'google')} style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', border: 'none', background: '#ea4335', color: 'white', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="white"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
              Continue with Google
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', gap: 12, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          <span>Or continue with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
        </div>

        {/* Email/password form — required fields ONLY apply here, not to OAuth above */}
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="you@example.com"
              required 
              style={{ padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', fontSize: '0.95rem', fontFamily: 'var(--sans)', background: 'var(--surface2)', color: 'var(--ink)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              required 
              style={{ padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', fontSize: '0.95rem', fontFamily: 'var(--sans)', background: 'var(--surface2)', color: 'var(--ink)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button formAction={login} style={{ flex: 1 }} className="btn btn--primary">
              Log in
            </button>
            <button formAction={signup} style={{ flex: 1 }} className="btn btn--outline">
              Sign up
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
