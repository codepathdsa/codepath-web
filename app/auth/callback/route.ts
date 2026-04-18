import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// SECURITY: validate that redirect target is a safe relative path.
// Prevents open-redirect attacks where an attacker crafts a link like
// /auth/callback?code=xxx&next=https://evil.com to hijack post-login navigation.
function isSafeRedirect(value: string | null): string {
  if (!value) return '/';
  // Must start with '/' but NOT '//' (protocol-relative URL = external redirect)
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return '/';
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = isSafeRedirect(requestUrl.searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=OAuth+authentication+failed`)
}
