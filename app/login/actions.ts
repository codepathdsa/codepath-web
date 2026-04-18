'use server';

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Use generic message to prevent username enumeration
    redirect('/login?error=Invalid email or password')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    // Use a generic message to prevent account enumeration via signup errors
    // (e.g. Supabase may return "User already registered" which reveals account existence)
    redirect('/signup?error=Unable+to+create+account.+Check+your+email+or+try+again.')
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

/**
 * Server action: verifies Supabase is reachable before returning the OAuth redirect URL.
 * Running on the server avoids CORS issues with the reachability check.
 * Returns { url } on success or { error } on failure — never navigates itself.
 */
export async function getOAuthUrl(
  provider: 'github' | 'google',
  next: string,
): Promise<{ url: string | null; error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

  // Server-side fetch: no CORS restriction, DNS failures throw here not in the browser
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(id);
    // Any HTTP response (including 4xx) means the server is reachable
  } catch {
    return { url: null, error: 'Authentication service unavailable. Please try again.' };
  }

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl, skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return { url: null, error: 'Authentication service unavailable. Please try again.' };
  }

  return { url: data.url, error: null };
}
