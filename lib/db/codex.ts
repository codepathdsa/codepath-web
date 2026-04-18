/**
 * lib/db/codex.ts
 * Fetch captured/shiny creatures from user_codex table.
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export interface CodexEntry {
  creature_id: string;
  is_shiny: boolean;
  captured_at: string;
}

export async function getMyCodex(): Promise<{ captured: Set<string>; shiny: Set<string> }> {
  const session = await auth();
  if (!session?.user?.id) return { captured: new Set(), shiny: new Set() };

  const data = await sql`
    SELECT creature_id, is_shiny FROM user_codex
    WHERE user_id = ${session.user.id}
  `;

  const captured = new Set<string>();
  const shiny = new Set<string>();

  for (const row of (data ?? [])) {
    captured.add(row.creature_id);
    if (row.is_shiny) shiny.add(row.creature_id);
  }

  return { captured, shiny };
}

/** Capture a creature (e.g., after completing a challenge set) */
export async function captureCreature(creatureId: string, isShiny = false) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };

  try {
    await sql`
      INSERT INTO user_codex (user_id, creature_id, is_shiny)
      VALUES (${session.user.id}, ${creatureId}, ${isShiny})
      ON CONFLICT (user_id, creature_id) 
      DO UPDATE SET is_shiny = EXCLUDED.is_shiny
    `;
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}
