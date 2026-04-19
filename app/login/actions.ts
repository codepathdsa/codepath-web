'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

import { sendVerificationEmail } from '@/lib/mail';

/**
 * Trigger GitHub or Google OAuth flow.
 */
export async function oauthSignIn(
  provider: 'github' | 'google',
  next: string,
): Promise<{ error: string | null }> {
  try {
    await signIn(provider, { redirectTo: next });
    return { error: null };
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
    if (e instanceof AuthError) {
      return { error: 'Authentication failed. Please try again.' };
    }
    return { error: 'Unexpected error. Please try again.' };
  }
}

/**
 * Sign In with Email/Password
 */
export async function credentialsSignIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/dashboard';

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: next,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
    
    let errorMsg = 'Invalid email or password.';
    if (e instanceof Error && e.message.includes('VerificationRequired')) {
      errorMsg = 'Please verify your email before logging in. Check your inbox!';
    } else if (e instanceof AuthError) {
      errorMsg = 'Invalid email or password.';
    }
    
    redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
  }
}

/**
 * Signup with Email/Password
 */
export async function signup(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // 1. Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      redirect(`/signup?error=${encodeURIComponent('User already exists.')}`);
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    // 3. Insert user
    await sql`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (${userId}, ${name}, ${email}, ${passwordHash})
    `;

    // 4. Generate Verification Token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await sql`
      INSERT INTO verification_token (identifier, token, expires)
      VALUES (${email}, ${token}, ${expires})
    `;

    // 5. Send Email
    await sendVerificationEmail(email, token);

    // 6. Redirect to login with success message
    redirect(`/login?success=${encodeURIComponent('Verification email sent! Please check your inbox.')}`);

  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
    console.error('Signup error:', e);
    redirect(`/signup?error=${encodeURIComponent('Signup failed. Please try again.')}`);
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
 */
export async function redirectToLogin(next = '/dashboard') {
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
