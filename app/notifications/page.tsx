'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

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

// --- Mock data ---------------------------------------------------------------

const NOW = new Date('2026-04-16T14:22:00Z');

function ago(isoStr: string): string {
  const diff = NOW.getTime() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const NOTIFICATIONS: Notification[] = [
  // Streak
  {
    id: 'n1',
    category: 'streak',
    icon: '🔥',
    title: 'Streak at risk — 4 hours left',
    body: 'You haven\'t completed a challenge today. Your 23-day streak resets at midnight.',
    cta: { label: 'Quick Challenge →', href: '/challenges' },
    timestamp: '2026-04-16T09:42:00Z',
    unread: true,
  },
  // Raid
  {
    id: 'n2',
    category: 'raid',
    icon: '⚔️',
    title: 'Friday Raid is live — Global Payment Rail Meltdown',
    body: '847 engineers are already in. Top 10 earn the Webhook Phantom creature. 47h 22m remaining.',
    cta: { label: 'Join Raid →', href: '/raid' },
    timestamp: '2026-04-16T06:00:00Z',
    unread: true,
  },
  // Level up
  {
    id: 'n3',
    category: 'level',
    icon: '⬆️',
    title: 'You\'re 90% of the way to Level 13',
    body: 'Only 1,245 more XP to reach Level 13 — Mid Engineer. Complete 2 more War Room challenges to get there today.',
    cta: { label: 'View War Room →', href: '/challenges' },
    timestamp: '2026-04-16T00:10:00Z',
    unread: true,
  },
  // Creature
  {
    id: 'n4',
    category: 'creature',
    icon: '🐉',
    title: 'Cache Miss evolved → Cache Stampede!',
    body: 'You solved 3 caching challenges. Your Cache Miss creature has evolved to Cache Stampede. One more evolution available.',
    cta: { label: 'View Codex →', href: '/codex' },
    timestamp: '2026-04-15T18:30:00Z',
    unread: false,
  },
  // Referral
  {
    id: 'n5',
    category: 'referral',
    icon: '🤝',
    title: 'Arjun R. upgraded to Pro — you earned 250 XP',
    body: 'Your referral Arjun R. (joined Apr 14) upgraded to Pro. You\'ve referred 4 engineers. 1 more to unlock the Exclusive Creature reward.',
    cta: { label: 'Share Referral →', href: '/referral' },
    timestamp: '2026-04-15T14:11:00Z',
    unread: false,
  },
  // Content
  {
    id: 'n6',
    category: 'content',
    icon: '✅',
    title: '8 new Google track challenges added',
    body: 'New challenges tailored for Google\'s SDE II and III rounds: Bigtable staleness, Spanner transactions, distributed tracing. Added to your track.',
    cta: { label: 'View Google Track →', href: '/tracks/google' },
    timestamp: '2026-04-15T10:00:00Z',
    unread: false,
  },
  // Streak milestone
  {
    id: 'n7',
    category: 'streak',
    icon: '🏆',
    title: '7-day streak milestone reached!',
    body: 'You earned +250 XP and the Flame Keeper badge. Your streak momentum is building — next milestone is 14 days.',
    timestamp: '2026-04-13T23:59:00Z',
    unread: false,
  },
  // Raid result
  {
    id: 'n8',
    category: 'raid',
    icon: '🎖️',
    title: 'Last week\'s Raid results — you placed #23',
    body: 'You completed the Database Cascade Meltdown raid in 14m 38s. Top 100 earns the Raid Survivor badge. Your badge has been added to your profile.',
    cta: { label: 'View Leaderboard →', href: '/leaderboard' },
    timestamp: '2026-04-13T18:00:00Z',
    unread: false,
  },
  // Creature captured
  {
    id: 'n9',
    category: 'creature',
    icon: '✨',
    title: 'Shiny N+1 Phantom captured!',
    body: 'Perfect PR Review — you spotted all 3 bugs on the first attempt with no hints. This earns a Shiny variant of N+1 Phantom in your Codex.',
    cta: { label: 'View in Codex →', href: '/codex' },
    timestamp: '2026-04-12T21:05:00Z',
    unread: false,
  },
  // Weekly summary
  {
    id: 'n10',
    category: 'content',
    icon: '📬',
    title: 'Your weekly summary is ready',
    body: 'This week: 8 challenges solved · +840 XP · 2 creatures captured · 23-day streak. You\'re in the top 12% of active users this week.',
    cta: { label: 'View Activity →', href: '/activity' },
    timestamp: '2026-04-12T09:00:00Z',
    unread: false,
  },
  // Referral joined
  {
    id: 'n11',
    category: 'referral',
    icon: '🌱',
    title: 'Nisha K. joined via your link',
    body: 'Your referral Nisha K. completed onboarding and solved their first challenge. You earned +100 XP.',
    timestamp: '2026-04-12T07:42:00Z',
    unread: false,
  },
  // Level up milestone
  {
    id: 'n12',
    category: 'level',
    icon: '🎉',
    title: 'Rank up: you\'re now a Mid Engineer!',
    body: 'You crossed 8,000 XP and ascended from Junior Engineer to Mid Engineer. War Room and System Design are now fully unlocked.',
    cta: { label: 'View Profile →', href: '/profile' },
    timestamp: '2026-04-10T15:22:00Z',
    unread: false,
  },
];

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

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotifCategory>('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const filtered = useMemo(
    () => activeTab === 'all' ? notifications : notifications.filter(n => n.category === activeTab),
    [notifications, activeTab]
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead = (id: string) => setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, unread: false } : n)
  );

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
