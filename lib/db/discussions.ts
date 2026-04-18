/**
 * lib/db/discussions.ts
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

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
  const data = await sql`
    SELECT d.*, p.username as profile_username, p.display_name as profile_display_name
    FROM discussions d
    LEFT JOIN user_profiles p ON d.user_id = p.id
    ORDER BY is_pinned DESC, created_at DESC
    LIMIT ${limit}
  `;

  if (!data) return [];

  return data.map((row: any) => ({
    ...(row as unknown as DbDiscussion),
    author_username: row.profile_username ?? 'anonymous',
    author_display_name: row.profile_display_name ?? 'Anonymous',
  }));
}

export async function createDiscussion(params: { title: string; body?: string; challengeId?: string; tags?: string[] }) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated', data: null };

  try {
    const data = await sql`
      INSERT INTO discussions (user_id, title, body, challenge_id, tags)
      VALUES (${session.user.id}, ${params.title}, ${params.body ?? null}, ${params.challengeId ?? null}, ${params.tags ?? []})
      RETURNING *
    `;

    return { data: data[0], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function voteDiscussion(discussionId: string): Promise<{ newVotes: number | null; error: string | null }> {
  const session = await auth();
  if (!session?.user?.id) return { newVotes: null, error: 'Not authenticated' };

  try {
    // Try to insert
    await sql`
      INSERT INTO discussion_votes (user_id, discussion_id)
      VALUES (${session.user.id}, ${discussionId})
    `;
    // If successful, increment
    const res = await sql`
      UPDATE discussions SET votes = votes + 1 WHERE id = ${discussionId}
      RETURNING votes
    `;
    return { newVotes: res[0]?.votes ?? null, error: null };
  } catch (err: any) {
    // 23505 is unique violation in Postgres
    if (err.code === '23505' || err.message?.includes('duplicate key value')) {
      // Already voted — remove vote
      await sql`
        DELETE FROM discussion_votes 
        WHERE user_id = ${session.user.id} AND discussion_id = ${discussionId}
      `;
      const res = await sql`
        UPDATE discussions SET votes = votes - 1 WHERE id = ${discussionId}
        RETURNING votes
      `;
      return { newVotes: res[0]?.votes ?? null, error: null };
    }
    return { newVotes: null, error: err.message };
  }
}
