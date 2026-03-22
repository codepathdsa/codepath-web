import Link from 'next/link';

interface PremiumGateProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

/**
 * Server component that wraps premium content sections in MDX files.
 * - Authenticated users: see the actual content.
 * - Guest users: see a blurred paywall teaser with a sign-in CTA.
 *
 * Usage in .mdx files:
 *   <Premium>
 *     ... premium markdown/JSX content here ...
 *   </Premium>
 */
export default function PremiumGate({ isAuthenticated, children }: PremiumGateProps) {
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="premium-gate">
      {/* Blurred preview of the content underneath */}
      <div className="premium-gate__blur" aria-hidden="true">
        {children}
      </div>

      {/* Overlay paywall card */}
      <div className="premium-gate__card">
        <div className="premium-gate__icon">🔒</div>
        <h3 className="premium-gate__title">Premium Content</h3>
        <p className="premium-gate__body">
          Sign in to unlock the full editorial — including optimal approaches,
          detailed walkthroughs, and edge-case analysis.
        </p>
        <div className="premium-gate__actions">
          <Link href="/login" className="btn btn--primary" style={{ fontSize: '0.88rem' }}>
            Sign in to unlock
          </Link>
          <Link href="/login" className="btn btn--outline" style={{ fontSize: '0.88rem' }}>
            Create free account →
          </Link>
        </div>
        <p className="premium-gate__footnote">Free forever · No credit card required</p>
      </div>
    </div>
  );
}
