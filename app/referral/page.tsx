import { getMyProfile } from '@/lib/db/profile';
import { getMyReferrals } from '@/lib/db/referrals';
import ReferralClient from './ReferralClient';

export const dynamic = 'force-dynamic';

export default async function ReferralPage() {
  const [{ profile }, referrals] = await Promise.all([
    getMyProfile(),
    getMyReferrals(),
  ]);
  return <ReferralClient referralCode={profile?.referral_code ?? ''} referrals={referrals} />;
}
