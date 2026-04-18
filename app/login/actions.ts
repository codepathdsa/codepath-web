'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

/**
 * Trigger GitHub or Google OAuth flow.
 * Called from OAuthButtons client component.
 * Returns { error } on failure so the UI can show a message.
 */
export async function oauthSignIn(
  provider: 'github' | 'google',
  next: string,
): Promise<{ error: string | null }> {
  try {
    await signIn(provider, { redirectTo: next });
    return { error: null };
  } catch (e) {
    // signIn throws a NEXT_REDIRECT on success — rethrow it
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
    if (e instanceof AuthError) {
      return { error: 'Authentication failed. Please try again.' };
    }
    return { error: 'Unexpected error. Please try again.' };
  }
}

/**
 * Sign out and redirect to home.
 */
export async function logout() {
  await signOut({ redirectTo: '/' });
}

/**
 * Redirect to login — used by protected pages that detect no session.
 * Auth.js middleware handles most of this automatically.
 */
export async function redirectToLogin(next = '/dashboard') {
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
