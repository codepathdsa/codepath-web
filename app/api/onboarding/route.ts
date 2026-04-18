/**
 * app/api/onboarding/route.ts
 * POST — complete user onboarding sequence
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = session.user.id;

  const { role, targetCompanies, selectedCreatureId, selectedCreatureName } = await req.json();

  // 1. Update user profile
  await sql`
    UPDATE user_profiles
    SET 
      track = ${role ?? 'SDE II'},
      target_companies = ${targetCompanies ?? []},
      starter_creature = ${selectedCreatureId ?? null},
      onboarding_complete = true
    WHERE id = ${userId}
  `;

  // 2. Add starter creature to codex
  if (selectedCreatureId) {
    await sql`
      INSERT INTO user_codex (user_id, creature_id, is_shiny)
      VALUES (${userId}, ${selectedCreatureId}, false)
      ON CONFLICT (user_id, creature_id) DO NOTHING
    `;
  }

  // 3. Welcome notification
  await sql`
    INSERT INTO notifications (user_id, category, icon, title, body, action_url)
    VALUES (
      ${userId}, 
      'system', 
      '🎉', 
      'Welcome to CodePath!', 
      ${`Your starter creature ${selectedCreatureName ?? ''} is ready. Start your first challenge.`}, 
      '/challenges'
    )
  `;

  return NextResponse.json({ ok: true });
}
