import { getLeaderboard } from '@/lib/db/leaderboard';
import LeaderboardClient from './LeaderboardClient';
import type { LeaderRow } from '@/lib/db/leaderboard';

const RANKS = [
  { min: 0,      max: 2000,   title: 'Intern',          color: '#8a8a8a' },
  { min: 2001,   max: 8000,   title: 'Junior Engineer', color: '#3b82f6' },
  { min: 8001,   max: 20000,  title: 'Mid Engineer',    color: '#10b981' },
  { min: 20001,  max: 50000,  title: 'Senior Engineer', color: '#f59e0b' },
  { min: 50001,  max: 100000, title: 'Staff Engineer',  color: '#8b5cf6' },
  { min: 100001, max: Infinity, title: 'Principal',     color: '#f43f5e' },
];
function getRankMeta(xp: number) {
  return RANKS.find(r => xp >= r.min && xp <= r.max) ?? RANKS[0];
}
function getInitials(name: string | null, username: string) {
  const n = name ?? username;
  return n.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

export default async function LeaderboardPage() {
  const { rows, myId } = await getLeaderboard(50);

  const mapped = rows.map((row: LeaderRow) => {
    const meta = getRankMeta(row.total_xp);
    return {
      rank: Number(row.rank),
      username: row.username,
      displayName: row.display_name ?? row.username,
      initials: getInitials(row.display_name, row.username),
      avatarColor: row.avatar_color ?? '#62de61',
      totalXP: row.total_xp,
      weeklyXP: 0,
      streak: row.current_streak,
      challengesDone: row.challenges_done,
      warRoomsDone: row.war_rooms_done,
      perfectRuns: row.perfect_runs,
      rank_title: meta.title,
      rank_color: meta.color,
      isYou: row.id === myId,
      isPro: row.subscription_tier !== 'free',
    };
  });

  return <LeaderboardClient initialData={mapped} myId={myId} />;
}
