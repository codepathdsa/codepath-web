/**
 * app/api/notes/route.ts
 * GET, POST — manage user notes for problems
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return new NextResponse('Missing slug', { status: 400 });

  const notes = await sql`
    SELECT content, updated_at 
    FROM user_notes 
    WHERE user_id = ${session.user.id} AND problem_slug = ${slug}
  `;

  if (notes.length > 0) {
    return NextResponse.json({ note: notes[0] });
  }
  return NextResponse.json({ note: null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  
  const { slug, content } = await req.json();
  if (!slug || typeof content !== 'string') return new NextResponse('Bad Request', { status: 400 });

  await sql`
    INSERT INTO user_notes (user_id, problem_slug, content, updated_at)
    VALUES (${session.user.id}, ${slug}, ${content}, NOW())
    ON CONFLICT (user_id, problem_slug) 
    DO UPDATE SET 
      content = EXCLUDED.content,
      updated_at = EXCLUDED.updated_at
  `;

  return NextResponse.json({ ok: true });
}
