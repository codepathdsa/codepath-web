/**
 * middleware.ts  (project root)
 * Auth.js v5 middleware — replaces the old Supabase session middleware.
 *
 * - Public routes: accessible without a session
 * - Protected routes: redirected to /login if no session
 */
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/api/auth',       // Auth.js internal routes
  '/api/webhooks',   // Stripe webhooks (verified by signature, not session)
  '/api/compile',    // Code runner (stateless)
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  );
}

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  // Always allow public paths and Next.js internals
  if (isPublic(pathname)) return NextResponse.next();

  // No session → redirect to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
