'use client';

import { useState, useEffect } from 'react';

const PROGRESS_KEY = 'cp_progress';
const STREAK_KEY = 'cp_streak';

export function useProgress() {
  const [solvedState, setSolvedState] = useState<Record<string, {status: string, ts: number}>>({});
  const [streak, setStreak] = useState(0);

  // Load on mount
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      setSolvedState(data);
      setStreak(bumpStreak());
    } catch {}
  }, []);

  const today = () => new Date().toISOString().slice(0, 10);

  function bumpStreak() {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"last":""}');
    const t = today();
    if (data.last === t) return data.count;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (data.last === yStr) {
      data.count++;
    } else if (data.last !== t) {
      data.count = 1;
    }
    data.last = t;
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data.count;
  }

  function toggleSolve(slug: string) {
    setSolvedState(prev => {
      const next = { ...prev };
      if (next[slug]?.status === 'solved') {
        delete next[slug];
      } else {
        next[slug] = { status: 'solved', ts: Date.now() };
        // Bumping streak on solve
        setStreak(bumpStreak());
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { solvedState, toggleSolve, streak };
}
