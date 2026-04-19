import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    redirect('/login?error=Invalid verification link.');
  }

  try {
    // 1. Find the token
    const tokens = await sql`
      SELECT * FROM verification_token 
      WHERE token = ${token}
    `;
    const verificationToken = tokens[0];

    if (!verificationToken) {
      redirect('/login?error=Verification link expired or invalid.');
    }

    // 2. Check expiry
    const hasExpired = new Date(verificationToken.expires) < new Date();
    if (hasExpired) {
      await sql`DELETE FROM verification_token WHERE token = ${token}`;
      redirect('/login?error=Verification link expired.');
    }

    // 3. Update user
    await sql`
      UPDATE users 
      SET "emailVerified" = NOW() 
      WHERE email = ${verificationToken.identifier}
    `;

    // 4. Cleanup token
    await sql`DELETE FROM verification_token WHERE token = ${token}`;

    // 5. Success!
    redirect('/login?success=Email verified successfully! You can now log in.');

  } catch (error) {
    console.error('Verification error:', error);
    redirect('/login?error=Something went wrong during verification.');
  }
}
