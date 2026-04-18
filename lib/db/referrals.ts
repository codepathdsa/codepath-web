/**
 * lib/db/referrals.ts
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

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
  const session = await auth();
  if (!session?.user?.id) return [];

  const data = await sql`
    SELECT r.*, p.username as profile_username, p.display_name as profile_display_name
    FROM referrals r
    LEFT JOIN user_profiles p ON r.referred_user_id = p.id
    WHERE r.referrer_id = ${session.user.id}
    ORDER BY r.created_at DESC
  `;

  if (!data) return [];

  return data.map((row: any) => ({
    ...(row as unknown as ReferralRow),
    referred_display_name: row.profile_display_name ?? (row.referred_email as string | null)?.split('@')[0] ?? 'Unknown',
    referred_username: row.profile_username ?? undefined,
  }));
}
