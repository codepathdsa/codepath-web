/**
 * lib/db/codex.ts
 * Fetch captured/shiny creatures from user_codex table.
 */
import { createClient } from '@/utils/supabase/server';

export interface CodexEntry {
  creature_id: string;
  is_shiny: boolean;
  captured_at: string;
}

export async function getMyCodex(): Promise<{ captured: Set<string>; shiny: Set<string> }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { captured: new Set(), shiny: new Set() };

  const { data } = await supabase
    .from('user_codex')
    .select('creature_id, is_shiny')
    .eq('user_id', user.id);

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('user_codex')
    .upsert({ user_id: user.id, creature_id: creatureId, is_shiny: isShiny })
    .eq('user_id', user.id)
    .eq('creature_id', creatureId);

  return { error: error?.message ?? null };
}
