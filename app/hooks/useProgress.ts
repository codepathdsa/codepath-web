'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getCreatureForChallenge } from '@/lib/codex';

interface ProgressState {
  solvedState: Record<string, { status: string; ts: number }>;
  capturedCodex: Set<string>;
  shinyCodex: Set<string>;
  streak: number;
  totalXP: number;
  loading: boolean;
}

export function useProgress() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<ProgressState>({
    solvedState: {},
    capturedCodex: new Set(),
    shinyCodex: new Set(),
    streak: 0,
    totalXP: 0,
    loading: true,
  });

  // Load progress from the server API once the session is ready
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/progress');
        if (!res.ok || cancelled) return;

        const { challenges, stats, codex } = await res.json();

        const map: Record<string, { status: string; ts: number }> = {};
        for (const row of (challenges ?? [])) {
          map[row.challenge_id] = {
            status: row.status,
            ts: new Date(row.solved_at).getTime(),
          };
        }

        const newCaptured = new Set<string>();
        const newShiny = new Set<string>();
        for (const r of (codex ?? [])) {
          newCaptured.add(r.creature_id);
          if (r.is_shiny) newShiny.add(r.creature_id);
        }

        if (!cancelled) {
          setState({
            solvedState: map,
            capturedCodex: newCaptured,
            shinyCodex: newShiny,
            streak: stats?.current_streak ?? 0,
            totalXP: stats?.total_xp ?? 0,
            loading: false,
          });
        }
      } catch (err) {
        console.error('useProgress load error:', err);
        if (!cancelled) setState(prev => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [session, status]);

  const toggleSolve = useCallback(async (
    slug: string,
    xp = 100,
    type: 'dsa' | 'war' | 'pr' | 'design' | 'tribunal' = 'dsa',
    options?: { isShiny?: boolean },
  ) => {
    if (!session?.user) return;

    const creature = getCreatureForChallenge(slug);
    const isShiny = !!options?.isShiny;

    // Optimistic UI update
    setState(prev => {
      const next = { ...prev };
      const solvedState = { ...prev.solvedState };

      if (solvedState[slug]?.status === 'solved') {
        delete solvedState[slug];
      } else {
        solvedState[slug] = { status: 'solved', ts: Date.now() };
      }

      const capturedCodex = new Set(prev.capturedCodex);
      const shinyCodex = new Set(prev.shinyCodex);
      if (creature) {
        capturedCodex.add(creature.id);
        if (isShiny) shinyCodex.add(creature.id);
      }

      return { ...next, solvedState, capturedCodex, shinyCodex };
    });

    // Persist to server
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: slug,
          challengeType: type,
          xp,
          creatureId: creature?.id ?? null,
          isShiny,
        }),
      });

      if (!res.ok) {
        console.error('Progress sync failed:', res.status);
        return;
      }

      const { stats } = await res.json();
      if (stats) {
        setState(prev => ({
          ...prev,
          streak: stats.current_streak,
          totalXP: stats.total_xp,
        }));
      }
    } catch (err) {
      console.error('toggleSolve error:', err);
    }
  }, [session]);

  return {
    solvedState: state.solvedState,
    toggleSolve,
    streak: state.streak,
    totalXP: state.totalXP,
    capturedCodex: state.capturedCodex,
    shinyCodex: state.shinyCodex,
    loading: state.loading,
  };
}
