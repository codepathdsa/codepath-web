/**
 * lib/db/activity.ts
 * Fetch real activity events from user_activities table.
 */
import { createClient } from '@/utils/supabase/server';
import type { ActivityEvent } from '@/lib/activity';

export async function getMyActivities(limit = 100): Promise<ActivityEvent[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row: {
    id: string;
    type: string;
    created_at: string;
    title: string;
    description: string | null;
    xp: number;
    stats: { label: string; value: string }[];
  }) => {
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
