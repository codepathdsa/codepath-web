import { login, signup } from './actions';
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
