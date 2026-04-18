/**
 * app/api/progress/route.ts
 * GET  /api/progress  — load user's challenges, stats, and codex from Neon
 * POST /api/progress  — solve a challenge (award XP, update codex)
 *
 * Replaces all direct Supabase client DB calls in useProgress.ts
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

// ─── GET — load full progress for the logged-in user ───────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  const [challenges, stats, codex] = await Promise.all([
    sql`
      SELECT challenge_id, status, solved_at
      FROM user_challenges
      WHERE user_id = ${userId}
    `,
    sql`
      SELECT current_streak, total_xp
      FROM user_stats
      WHERE id = ${userId}
      LIMIT 1
    `,
    sql`
      SELECT creature_id, is_shiny
      FROM user_codex
      WHERE user_id = ${userId}
    `,
  ]);

  return NextResponse.json({
    challenges,
    stats: stats[0] ?? { current_streak: 0, total_xp: 0 },
    codex,
  });
}

// ─── POST — award XP, record solve, upsert codex ───────────────────────────

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  const { challengeId, challengeType, xp, creatureId, isShiny } = await req.json();

  if (!challengeId || typeof xp !== 'number') {
    return new NextResponse('Bad request', { status: 400 });
  }

  // Upsert the solved challenge
  await sql`
    INSERT INTO user_challenges (user_id, challenge_id, status, challenge_type, solved_at)
    VALUES (${userId}, ${challengeId}, 'solved', ${challengeType}, NOW())
    ON CONFLICT (user_id, challenge_id)
    DO UPDATE SET status = 'solved', solved_at = NOW()
  `;

  // Award XP and update streak (mirrors the old award_xp RPC)
  await sql`
    INSERT INTO user_stats (id, total_xp, current_streak, last_active_date)
    VALUES (${userId}, ${xp}, 1, CURRENT_DATE)
    ON CONFLICT (id) DO UPDATE SET
      total_xp         = user_stats.total_xp + ${xp},
      current_streak   = CASE
                           WHEN user_stats.last_active_date = CURRENT_DATE - INTERVAL '1 day'
                           THEN user_stats.current_streak + 1
                           WHEN user_stats.last_active_date = CURRENT_DATE
                           THEN user_stats.current_streak
                           ELSE 1
                         END,
      last_active_date = CURRENT_DATE
  `;

  // Upsert codex creature if provided
  if (creatureId) {
    await sql`
      INSERT INTO user_codex (user_id, creature_id, is_shiny, captured_at)
      VALUES (${userId}, ${creatureId}, ${!!isShiny}, NOW())
      ON CONFLICT (user_id, creature_id) DO NOTHING
    `;
  }

  // Return updated stats so the client can refresh without a second round-trip
  const [updated] = await sql`
    SELECT current_streak, total_xp
    FROM user_stats
    WHERE id = ${userId}
  `;

  return NextResponse.json({ ok: true, stats: updated });
}
