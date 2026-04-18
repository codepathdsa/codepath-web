/**
 * app/auth/callback/route.ts
 * Auth.js v5 handles OAuth callbacks at /api/auth/callback/[provider] automatically.
 *
 * This route exists only to redirect any legacy links that pointed to
 * the old Supabase /auth/callback endpoint.
 */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Redirect legacy callback URLs to the home page
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
