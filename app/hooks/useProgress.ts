'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getCreatureForChallenge } from '@/lib/codex';

export function useProgress() {
  const [solvedState, setSolvedState] = useState<Record<string, { status: string; ts: number }>>({});
  const [capturedCodex, setCapturedCodex] = useState<Set<string>>(new Set());
  const [shinyCodex, setShinyCodex] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setLoading(false); return; }

      const [{ data: challenges }, { data: stats }, { data: codex }] = await Promise.all([
        supabase.from('user_challenges').select('challenge_id, status, solved_at').eq('user_id', user.id),
        supabase.from('user_stats').select('current_streak, total_xp').eq('id', user.id).single(),
        supabase.from('user_codex').select('creature_id, is_shiny').eq('user_id', user.id),
      ]);

      if (cancelled) return;

      const map: Record<string, { status: string; ts: number }> = {};
      for (const row of (challenges ?? [])) {
        map[row.challenge_id] = { status: row.status, ts: new Date(row.solved_at).getTime() };
      }
      setSolvedState(map);
      
      const newCaptured = new Set<string>();
      const newShiny = new Set<string>();
      for (const r of (codex ?? [])) {
        newCaptured.add(r.creature_id);
        if (r.is_shiny) newShiny.add(r.creature_id);
      }
      setCapturedCodex(newCaptured);
      setShinyCodex(newShiny);

      setStreak(stats?.current_streak ?? 0);
      setTotalXP(stats?.total_xp ?? 0);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const toggleSolve = useCallback(async (
    slug: string, 
    xp = 100, 
    type: 'dsa' | 'war' | 'pr' | 'design' | 'tribunal' = 'dsa',
    options?: { isShiny?: boolean }
  ) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    setSolvedState(prev => {
      const next = { ...prev };
      if (next[slug]?.status === 'solved') {
        delete next[slug];
      } else {
        next[slug] = { status: 'solved', ts: Date.now() };
      }
      return next;
    });

    const creature = getCreatureForChallenge(slug);
    const isShiny = !!options?.isShiny;

    if (creature) {
      // Optimistic update for codex
      setCapturedCodex(prev => new Set([...prev, creature.id]));
      if (isShiny) setShinyCodex(prev => new Set([...prev, creature.id]));
    }

    // Persist to Supabase
    const [rpcRes, codexRes] = await Promise.all([
      supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp: xp,
        p_challenge_id: slug,
        p_challenge_type: type,
      }),
      creature ? supabase.from('user_codex').upsert(
        { user_id: user.id, creature_id: creature.id, is_shiny: isShiny },
        { onConflict: 'user_id,creature_id' }
      ) : Promise.resolve({ error: null })
    ]);

    if (rpcRes.error) console.error("XP Award Error:", rpcRes.error.message);
    if (codexRes?.error) console.error("Codex Sync Error:", codexRes.error.message);

    // Refresh stats from DB
    const { data: stats } = await supabase
      .from('user_stats')
      .select('current_streak, total_xp')
      .eq('id', user.id)
      .single();
    if (stats) {
      setStreak(stats.current_streak);
      setTotalXP(stats.total_xp);
    }
  }, []);

  return { solvedState, toggleSolve, streak, totalXP, capturedCodex, shinyCodex, loading };
}
