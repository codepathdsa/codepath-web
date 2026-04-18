/**
 * lib/db/notifications.ts
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export interface DbNotification {
  id: string;
  category: string;
  icon: string;
  title: string;
  body: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export async function getMyNotifications(): Promise<DbNotification[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const data = await sql`
    SELECT * FROM notifications
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return (data ?? []) as DbNotification[];
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${session.user.id}`;
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;
  await sql`UPDATE notifications SET is_read = true WHERE user_id = ${session.user.id}`;
}
