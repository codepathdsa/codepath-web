'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';
import { createClient } from '@/utils/supabase/client';
import type { DbNotification } from '@/lib/db/notifications';

// --- Types -------------------------------------------------------------------

type NotifCategory = 'all' | 'streak' | 'raid' | 'level' | 'creature' | 'referral' | 'content';

interface Notification {
  id: string;
  category: Exclude<NotifCategory, 'all'>;
  icon: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  timestamp: string; // ISO
  unread: boolean;
}

function ago(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const CATEGORY_TABS: { key: NotifCategory; label: string; icon: string }[] = [
  { key: 'all',      label: 'All',      icon: '🔔' },
  { key: 'streak',   label: 'Streak',   icon: '🔥' },
  { key: 'raid',     label: 'Raids',    icon: '⚔️' },
  { key: 'level',    label: 'Level',    icon: '⬆️' },
  { key: 'creature', label: 'Creatures',icon: '🐉' },
  { key: 'referral', label: 'Referrals',icon: '🤝' },
  { key: 'content',  label: 'Content',  icon: '✅' },
];

// --- Main page ---------------------------------------------------------------

export default function NotificationsClient({ initialNotifications }: { initialNotifications: DbNotification[] }) {
  const mapDb = (n: DbNotification): Notification => ({
    id: n.id,
    category: (n.category as Exclude<NotifCategory, 'all'>) ?? 'content',
    icon: n.icon,
    title: n.title,
    body: n.body ?? '',
    timestamp: n.created_at,
    unread: !n.is_read,
    cta: n.action_url ? { label: 'View →', href: n.action_url } : undefined,
  });
  const [activeTab, setActiveTab] = useState<NotifCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications.map(mapDb));

  const filtered = useMemo(
    () => activeTab === 'all' ? notifications : notifications.filter(n => n.category === activeTab),
    [notifications, activeTab]
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
  };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id);
    }
  };

  const tabUnread = (tab: NotifCategory) =>
    tab === 'all'
      ? unreadCount
      : notifications.filter(n => n.category === tab && n.unread).length;

  return (
    <>
      <AppNav />
      <main className={styles.page}>
        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Notifications</h1>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Category tabs ──────────────────────────────── */}
        <div className={styles.tabs}>
          {CATEGORY_TABS.map(tab => {
            const count = tabUnread(tab.key);
            return (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && <span className={styles.tabBadge}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Notification list ──────────────────────────── */}
        <div className={styles.list}>
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔕</span>
              <span className={styles.emptyText}>No {activeTab === 'all' ? '' : activeTab} notifications</span>
            </div>
          )}
          {filtered.map(notif => (
            <div
              key={notif.id}
              className={`${styles.item} ${notif.unread ? styles.itemUnread : ''}`}
              onClick={() => markRead(notif.id)}
            >
              {notif.unread && <div className={styles.unreadDot} />}
              <div className={styles.itemIcon}>{notif.icon}</div>
              <div className={styles.itemBody}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{notif.title}</span>
                  <span className={styles.itemTime}>{ago(notif.timestamp)}</span>
                </div>
                <p className={styles.itemText}>{notif.body}</p>
                {notif.cta && (
                  <Link
                    href={notif.cta.href}
                    className={styles.itemCta}
                    onClick={e => e.stopPropagation()}
                  >
                    {notif.cta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
