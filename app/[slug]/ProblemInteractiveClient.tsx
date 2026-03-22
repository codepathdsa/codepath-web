'use client';

import { useProgress } from '@/app/hooks/useProgress';

export default function ProblemInteractiveClient({ slug }: { slug: string }) {
  const { solvedState, toggleSolve } = useProgress();
  const isSolved = solvedState[slug]?.status === 'solved';

  return (
    <button 
      className={`solve-btn ${isSolved ? 'solved' : ''}`}
      onClick={() => toggleSolve(slug)}
    >
      <span>{isSolved ? '✓' : '○'}</span>
      <span>{isSolved ? 'Solved!' : 'Mark as Solved'}</span>
    </button>
  );
}
