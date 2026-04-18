/**
 * lib/db/referrals.ts
 */
import { createClient } from '@/utils/supabase/server';

export interface ReferralRow {
  id: string;
  referred_email: string | null;
  referred_user_id: string | null;
  status: 'pending' | 'signed_up' | 'converted';
  reward_granted: boolean;
  created_at: string;
  converted_at: string | null;
  // joined from referred user_profiles
  referred_display_name?: string;
  referred_username?: string;
}

export async function getMyReferrals(): Promise<ReferralRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('referrals')
    .select(`*, referred_profile:user_profiles!referrals_referred_user_id_fkey(username, display_name)`)
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map((row: Record<string, unknown> & { referred_profile?: { username: string; display_name: string } }) => ({
    ...(row as unknown as ReferralRow),
    referred_display_name: row.referred_profile?.display_name ?? (row.referred_email as string | null)?.split('@')[0] ?? 'Unknown',
    referred_username: row.referred_profile?.username ?? undefined,
  }));
}
