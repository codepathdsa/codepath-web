'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useProgress() {
  const [solvedState, setSolvedState] = useState<Record<string, { status: string; ts: number }>>({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setLoading(false); return; }

      const [{ data: challenges }, { data: stats }] = await Promise.all([
        supabase.from('user_challenges').select('challenge_id, status, solved_at').eq('user_id', user.id),
        supabase.from('user_stats').select('current_streak').eq('id', user.id).single(),
      ]);

      if (cancelled) return;

      const map: Record<string, { status: string; ts: number }> = {};
      for (const row of (challenges ?? [])) {
        map[row.challenge_id] = { status: row.status, ts: new Date(row.solved_at).getTime() };
      }
      setSolvedState(map);
      setStreak(stats?.current_streak ?? 0);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const toggleSolve = useCallback(async (slug: string, xp = 100, type: 'dsa' | 'war' | 'pr' | 'design' | 'tribunal' = 'dsa') => {
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

    // Persist to Supabase via RPC
    await supabase.rpc('award_xp', {
      p_user_id: user.id,
      p_xp: xp,
      p_challenge_id: slug,
      p_challenge_type: type,
    });

    // Refresh streak from DB
    const { data: stats } = await supabase
      .from('user_stats')
      .select('current_streak')
      .eq('id', user.id)
      .single();
    if (stats) setStreak(stats.current_streak);
  }, []);

  return { solvedState, toggleSolve, streak, loading };
}
