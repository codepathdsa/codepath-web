/**
 * app/api/discussions/route.ts
 * POST — create a new discussion
 * PATCH — vote on a discussion
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = session.user.id;

  const { title, body, tag } = await req.json();

  const inserted = await sql`
    INSERT INTO discussions (user_id, title, body, tags)
    VALUES (${userId}, ${title}, ${body}, ARRAY[${tag}])
    RETURNING *
  `;

  const profile = await sql`SELECT username FROM user_profiles WHERE id = ${userId}`;
  const author_username = profile[0]?.username ?? 'you';

  return NextResponse.json({
    data: {
      ...inserted[0],
      author_username,
      comment_count: 0,
    }
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { id, action } = await req.json();

  if (action === 'increment') {
    await sql`UPDATE discussions SET votes = votes + 1 WHERE id = ${id}`;
  } else if (action === 'decrement') {
    await sql`UPDATE discussions SET votes = votes - 1 WHERE id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}
