/**
 * lib/db/activity.ts
 * Fetch real activity events from user_activities table.
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';
import type { ActivityEvent } from '@/lib/activity';

export async function getMyActivities(limit = 100): Promise<ActivityEvent[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const data = await sql`
    SELECT * FROM user_activities
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return data.map((row: any) => {
    const BADGE_MAP: Record<string, string> = {
      dsa: 'badge-dsa',
      war: 'badge-war',
      pr: 'badge-pr',
      design: 'badge-design',
      tribunal: 'badge-error',
    };

    const d = new Date(row.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let dateStr = diffDays === 0 ? `TODAY, ${timeStr}` :
                  diffDays === 1 ? `YESTERDAY, ${timeStr}` :
                  `${diffDays}D AGO, ${timeStr}`;

    return {
      id: row.id,
      type: row.type as ActivityEvent['type'],
      badge: BADGE_MAP[row.type] ?? 'badge-dsa',
      dateStr,
      timestamp: row.created_at,
      title: row.title,
      desc: row.description ?? '',
      xp: row.xp,
      stats: row.stats ?? [],
    };
  });
}
