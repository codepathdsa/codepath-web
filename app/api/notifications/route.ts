/**
 * app/api/notifications/route.ts
 * PATCH /api/notifications — mark notifications as read (all or one)
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = session.user.id;

  const { action, id } = await req.json();

  if (action === 'markAll') {
    await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId}`;
  } else if (action === 'markOne' && id) {
    await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${userId}`;
  }

  return NextResponse.json({ ok: true });
}
