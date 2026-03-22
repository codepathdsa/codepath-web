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

        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
            <button formAction={signInOAuth.bind(null, 'github')} style={{ padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.15s' }}>
              <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="18" height="18" alt="GitHub" />
              Continue with GitHub
            </button>
            <button formAction={signInOAuth.bind(null, 'google')} style={{ padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.15s' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" width="18" height="18" alt="Google" />
              Continue with Google
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', gap: 12, marginBottom: 4 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <span>Or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>

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
