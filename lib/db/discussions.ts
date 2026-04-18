/**
 * lib/db/discussions.ts
 */
import { createClient } from '@/utils/supabase/server';

export interface DbDiscussion {
  id: string;
  user_id: string;
  challenge_id: string | null;
  title: string;
  body: string | null;
  votes: number;
  comment_count: number;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  // joined from user_profiles
  author_username?: string;
  author_display_name?: string;
}

export async function getDiscussions(limit = 30): Promise<DbDiscussion[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('discussions')
    .select(`*, user_profiles(username, display_name)`)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row: Record<string, unknown> & { user_profiles?: { username: string; display_name: string } }) => ({
    ...(row as unknown as DbDiscussion),
    author_username: row.user_profiles?.username ?? 'anonymous',
    author_display_name: row.user_profiles?.display_name ?? 'Anonymous',
  }));
}

export async function createDiscussion(params: { title: string; body?: string; challengeId?: string; tags?: string[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', data: null };

  const { data, error } = await supabase
    .from('discussions')
    .insert({
      user_id: user.id,
      title: params.title,
      body: params.body ?? null,
      challenge_id: params.challengeId ?? null,
      tags: params.tags ?? [],
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function voteDiscussion(discussionId: string): Promise<{ newVotes: number | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { newVotes: null, error: 'Not authenticated' };

  // Try to insert vote; if duplicate, remove it (toggle)
  const { error: insertError } = await supabase
    .from('discussion_votes')
    .insert({ user_id: user.id, discussion_id: discussionId });

  if (insertError?.code === '23505') {
    // Already voted — remove vote
    await supabase.from('discussion_votes').delete()
      .eq('user_id', user.id)
      .eq('discussion_id', discussionId);
    // Decrement
    const { data } = await supabase.rpc('decrement_discussion_votes', { p_id: discussionId });
    return { newVotes: data, error: null };
  }

  // Increment
  const { data } = await supabase.rpc('increment_discussion_votes', { p_id: discussionId });
  return { newVotes: data, error: null };
}
