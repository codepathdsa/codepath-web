'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppNav from '@/app/components/AppNav';
import styles from './page.module.css';

// --- Types -------------------------------------------------------------------

type SettingsSection = 'account' | 'notifications' | 'appearance' | 'subscription' | 'danger';

// --- Mock data ---------------------------------------------------------------

const MOCK_USER = {
  displayName: 'Venkateshwaran P.',
  username: 'venkat_builds',
  email: 'venkat@example.com',
  avatarInitials: 'VP',
  track: 'SDE II',
  targetCompanies: ['Meta', 'Stripe', 'Notion'],
  subscriptionTier: 'pro' as 'free' | 'pro' | 'legendary',
  subscriptionRenews: 'Jan 14, 2027',
  referralCode: 'VENKAT-9X2F',
};

const NAV_ITEMS: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'account',      label: 'Account',         icon: '👤' },
  { id: 'notifications',label: 'Notifications',   icon: '🔔' },
  { id: 'appearance',   label: 'Appearance',       icon: '🎨' },
  { id: 'subscription', label: 'Subscription',     icon: '⚡' },
  { id: 'danger',       label: 'Danger Zone',      icon: '⚠' },
];

// --- Toggle component --------------------------------------------------------

function Toggle({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        {sub && <span className={styles.toggleSub}>{sub}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </label>
  );
}

// --- Section components ------------------------------------------------------

function AccountSection() {
  const [form, setForm] = useState({
    displayName: MOCK_USER.displayName,
    username: MOCK_USER.username,
    email: MOCK_USER.email,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionHeading}>Account</h2>

      {/* Avatar block */}
      <div className={styles.avatarBlock}>
        <div className={styles.avatarCircle}>{MOCK_USER.avatarInitials}</div>
        <div className={styles.avatarInfo}>
          <span className={styles.avatarName}>{form.displayName}</span>
          <span className={styles.avatarSub}>@{form.username}</span>
        </div>
        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Change avatar
        </button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Display name</label>
          <input
            className={styles.input}
            value={form.displayName}
            onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Username</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputPrefix}>engprep.dev/u/</span>
            <input
              className={`${styles.input} ${styles.inputPrefixed}`}
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
            />
          </div>
        </div>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Email address</label>
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Engineering track</label>
          <select className={styles.select}>
            <option value="SDE1">Entry Level (0–2 yrs)</option>
            <option value="SDE2" selected>Mid Level (2–5 yrs)</option>
            <option value="SDE3">Senior (5+ yrs)</option>
          </select>
        </div>
      </div>

      <div className={styles.formActions}>
        <button className="btn-primary" onClick={handleSave} style={{ padding: '10px 24px' }}>
          {saved ? '✓ Saved' : 'Save changes'}
        </button>
        <button className="btn-ghost" style={{ padding: '10px 20px' }}>Cancel</button>
      </div>

      {/* Referral code */}
      <div className={styles.infoCard}>
        <span className={styles.infoLabel}>Your referral code</span>
        <code className={styles.codeVal}>{MOCK_USER.referralCode}</code>
        <Link href="/referral" className={styles.infoLink}>Manage →</Link>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    streakReminder: true,
    raidStart: true,
    levelUp: true,
    weeklyDigest: true,
    creatureCaptured: true,
    communityReplies: false,
    marketingEmails: false,
  });

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(v => ({ ...v, [key]: !v[key] }));

  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionHeading}>Notifications</h2>

      <div className={styles.notifGroup}>
        <div className={styles.notifGroupTitle}>Activity</div>
        <Toggle checked={notifs.streakReminder}  onChange={() => toggle('streakReminder')}  label="Streak at-risk reminder"       sub="Alert at 6 PM if you haven't solved anything today" />
        <Toggle checked={notifs.raidStart}        onChange={() => toggle('raidStart')}        label="Friday Raid alert"             sub="Notified when the weekly raid goes live" />
        <Toggle checked={notifs.levelUp}          onChange={() => toggle('levelUp')}          label="Level-up + rank promotion"     sub="When you earn enough XP to advance" />
        <Toggle checked={notifs.creatureCaptured} onChange={() => toggle('creatureCaptured')} label="Creature capture celebration"  sub="Fanfare overlay when a new creature is added to your Codex" />
      </div>

      <div className={styles.notifGroup}>
        <div className={styles.notifGroupTitle}>Email</div>
        <Toggle checked={notifs.weeklyDigest}     onChange={() => toggle('weeklyDigest')}     label="Weekly progress digest"        sub="Monday morning summary of your XP, rank, and streak" />
        <Toggle checked={notifs.communityReplies} onChange={() => toggle('communityReplies')} label="Discussion replies"            sub="When someone replies to your posts" />
        <Toggle checked={notifs.marketingEmails}  onChange={() => toggle('marketingEmails')}  label="Product updates and tips"      sub="Occasional emails about new features and raid events" />
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [codeFont, setCodeFont] = useState('jetbrains');
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionHeading}>Appearance</h2>

      <div className={styles.formField}>
        <label className={styles.fieldLabel}>Color theme</label>
        <div className={styles.themeRow}>
          {(['dark', 'light', 'system'] as const).map(t => (
            <button
              key={t}
              className={`${styles.themeBtn} ${theme === t ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme(t)}
            >
              {t === 'dark' ? '🌑 Dark' : t === 'light' ? '☀️ Light' : '💻 System'}
            </button>
          ))}
        </div>
        <p className={styles.fieldHint}>
          Light mode is in beta. Some components may look different.
        </p>
      </div>

      <div className={styles.formField}>
        <label className={styles.fieldLabel}>Code editor font</label>
        <select className={styles.select} value={codeFont} onChange={e => setCodeFont(e.target.value)}>
          <option value="jetbrains">JetBrains Mono (default)</option>
          <option value="fira">Fira Code</option>
          <option value="cascadia">Cascadia Code</option>
          <option value="ibmplex">IBM Plex Mono</option>
        </select>
      </div>

      <div className={styles.divider} />

      <Toggle
        checked={reduceMotion}
        onChange={setReduceMotion}
        label="Reduce motion"
        sub="Fewer animations and transitions throughout the app"
      />
    </div>
  );
}

function SubscriptionSection() {
  const user = MOCK_USER;
  const tierColors = { free: '#8a8a8a', pro: '#62de61', legendary: '#f59e0b' };
  const color = tierColors[user.subscriptionTier];

  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionHeading}>Subscription</h2>

      <div className={styles.subCard} style={{ '--tier-color': color } as React.CSSProperties}>
        <div className={styles.subCardTop}>
          <div>
            <div className={styles.subTier} style={{ color }}>
              {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
              {user.subscriptionTier === 'pro' && <span className={styles.subActive}>ACTIVE</span>}
            </div>
            <div className={styles.subRenews}>
              Renews {user.subscriptionRenews}
            </div>
          </div>
          <Link href="/pricing" className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Manage plan →
          </Link>
        </div>

        <div className={styles.subFeatures}>
          <div className={styles.subFeature}>✓ All 150+ challenges</div>
          <div className={styles.subFeature}>✓ Full Mastery Codex capture</div>
          <div className={styles.subFeature}>✓ Streak Shield (1/month)</div>
          <div className={styles.subFeature}>✓ Leaderboard entry</div>
          <div className={styles.subFeature}>✓ War Room + Raids</div>
          <div className={styles.subFeature}>✓ Community solutions</div>
        </div>
      </div>

      <div className={styles.infoCard} style={{ marginTop: 'var(--space-4)' }}>
        <span className={styles.infoLabel}>Billing email</span>
        <code className={styles.codeVal}>{user.email}</code>
        <button className={styles.infoLink}>Update →</button>
      </div>

      <div className={styles.formField} style={{ marginTop: 'var(--space-4)' }}>
        <label className={styles.fieldLabel}>Redeem a code</label>
        <div className={styles.redeemRow}>
          <input className={styles.input} placeholder="Enter promo or referral code…" style={{ flex: 1 }} />
          <button className="btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function DangerSection() {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_REQUIRED = 'delete my account';

  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionHeading} style={{ color: '#ef4444' }}>Danger Zone</h2>

      <div className={styles.dangerCard}>
        <div className={styles.dangerItem}>
          <div>
            <div className={styles.dangerLabel}>Export your data</div>
            <div className={styles.dangerSub}>Download a JSON archive of all your progress, XP history, and Codex.</div>
          </div>
          <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Export data
          </button>
        </div>

        <div className={styles.dangerDivider} />

        <div className={styles.dangerItem}>
          <div>
            <div className={styles.dangerLabel}>Reset all progress</div>
            <div className={styles.dangerSub}>Wipe your XP, streak, and Codex. Your account stays active. This cannot be undone.</div>
          </div>
          <button className={styles.btnDanger} style={{ whiteSpace: 'nowrap' }}>
            Reset progress
          </button>
        </div>

        <div className={styles.dangerDivider} />

        <div className={styles.dangerDeleteBlock}>
          <div className={styles.dangerLabel}>Delete account</div>
          <div className={styles.dangerSub}>
            Permanently delete your account, all data, and cancel your subscription. This is irreversible.
          </div>
          <p className={styles.confirmHint}>
            Type <code>{CONFIRM_REQUIRED}</code> to confirm:
          </p>
          <div className={styles.redeemRow}>
            <input
              className={`${styles.input} ${styles.inputDanger}`}
              placeholder={CONFIRM_REQUIRED}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
            />
            <button
              className={styles.btnDanger}
              disabled={confirmText.toLowerCase() !== CONFIRM_REQUIRED}
              style={{ whiteSpace: 'nowrap' }}
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---------------------------------------------------------------

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  const SECTIONS: Record<SettingsSection, React.ReactNode> = {
    account:      <AccountSection />,
    notifications: <NotificationsSection />,
    appearance:   <AppearanceSection />,
    subscription: <SubscriptionSection />,
    danger:       <DangerSection />,
  };

  return (
    <div className={styles.layout}>
      <AppNav />

      <div className={styles.pageWrap}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <nav className={styles.sideNav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`${styles.sideNavItem} ${activeSection === item.id ? styles.sideNavActive : ''} ${item.id === 'danger' ? styles.sideNavDanger : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className={styles.sideNavIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className={styles.content}>
          {SECTIONS[activeSection]}
        </main>
      </div>
    </div>
  );
}
