import { getDiscussions } from '@/lib/db/discussions';
import DiscussionsClient from './DiscussionsClient';

// Accessible via direct URL (/discussions) — not linked from nav intentionally.
export default async function DiscussionsPage() {
  const discussions = await getDiscussions(30);
  return <DiscussionsClient initialDiscussions={discussions} />;
}
