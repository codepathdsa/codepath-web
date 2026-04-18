import { getMyNotifications } from '@/lib/db/notifications';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const notifications = await getMyNotifications();
  return <NotificationsClient initialNotifications={notifications} />;
}
