/**
 * app/api/settings/route.ts
 * PATCH /api/settings — update user profile fields
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = session.user.id;

  const { display_name, username } = await req.json();

  await sql`
    UPDATE user_profiles
    SET
      display_name = COALESCE(${display_name ?? null}, display_name),
      username     = COALESCE(${username ?? null}, username)
    WHERE id = ${userId}
  `;

  return NextResponse.json({ ok: true });
}
