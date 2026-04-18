import { getMyProfile } from '@/lib/db/profile';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
import SettingsClient from './SettingsClient';
import type { SettingsUser } from './SettingsClient';

export default async function SettingsPage() {
  const [{ profile }, session] = await Promise.all([
    getMyProfile(),
    auth(),
  ]);

  const settingsUser: SettingsUser = {
    displayName: profile?.display_name ?? profile?.username ?? '',
    username: profile?.username ?? '',
    email: session?.user?.email ?? '',
    avatarInitials: (profile?.display_name ?? profile?.username ?? '')
      .split(' ').map((w: string) => w[0]?.toUpperCase() ?? '').slice(0, 2).join(''),
    track: profile?.track ?? 'SDE II',
    targetCompanies: profile?.target_companies ?? [],
    subscriptionTier: (profile?.subscription_tier as SettingsUser['subscriptionTier']) ?? 'free',
    subscriptionRenews: profile?.subscription_renews_at
      ? new Date(profile.subscription_renews_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A',
    referralCode: profile?.referral_code ?? '',
  };

  return <SettingsClient user={settingsUser} />;
}
