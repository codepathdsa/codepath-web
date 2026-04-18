import type { Challenge } from '../types';

// â”€â”€â”€ ENG-PR-006 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

// â”€â”€â”€ ENG-PR-006 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
  id: 'ENG-PR-006',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'Sequential Awaits â€” NÃ—1 Second Dashboard Load',
  companies: ['Datadog', 'Vercel'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'The dashboard API endpoint takes ~3 seconds to respond after a junior dev added two additional data sources. Each individual query runs in ~1 second. Prod monitoring confirms no slow queries. Find the structural bug.',
  solution: 'The three await calls are sequential: each one blocks until the previous resolves. Total time = 1s + 1s + 1s = 3s. The three queries are independent â€” none depends on the result of another â€” so they can run concurrently with Promise.all. Fix: const [user, posts, analytics] = await Promise.all([fetchUser(id), fetchPosts(id), fetchAnalytics(id)]); â€” bringing load time to ~1s.',
  prReview: {
    prNumber: 631,
    prBranch: 'feature/dashboard-analytics-widget',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/api/dashboard.ts',
    prAge: '1 day ago',
    background: 'The dashboard previously only loaded user info. This PR adds posts and analytics data to support two new widgets requested by the product team.',
    changes: 'Added two new await calls to fetch posts and analytics alongside the existing user fetch. All data is returned as a combined object.',
    testing: 'All three data sources return correctly in local testing. Integration tests pass.',
    hints: [
      'Do fetchUser, fetchPosts, and fetchAnalytics depend on each other\'s results?',
      'If three independent operations each take 1 second and run sequentially, how long does the total take?',
      'Which Promise method runs multiple independent async operations concurrently?',
    ],
    diff: [
      { lineNumL: 3, lineNumR: 3, type: 'normal', text: 'export async function getDashboardData(userId: string) {' },
      { lineNumL: 4, lineNumR: 4, type: 'normal', text: '  const user      = await fetchUser(userId);' },
      { lineNumL: null, lineNumR: 5, type: 'addition', text: '  const posts     = await fetchPosts(userId);' },
      { lineNumL: null, lineNumR: 6, type: 'addition', text: '  const analytics = await fetchAnalytics(userId);' },
      { lineNumL: 5, lineNumR: 7, type: 'normal', text: '  return { user, posts, analytics };' },
      { lineNumL: 6, lineNumR: 8, type: 'normal', text: '}' },
    ],
    bugOptions: [
      { value: 'sequential_await', label: 'Sequential awaits', sub: 'Independent calls blocked in series' },
      { value: 'missing_cache', label: 'No caching', sub: 'Data re-fetched on every request' },
      { value: 'n_plus_one', label: 'N+1 query', sub: 'Query executed inside a loop' },
      { value: 'missing_index', label: 'Missing DB index', sub: 'Slow query due to full table scan' },
      { value: 'over_fetching', label: 'Over-fetching data', sub: 'Fetching more fields than needed' },
      { value: 'no_pagination', label: 'Missing pagination', sub: 'Returning unbounded data set' },
    ],
    correctBugType: 'sequential_await',
    successExplanation: "Exactly. fetchUser, fetchPosts, and fetchAnalytics are fully independent â€” none of them uses the result of another. Sequential await means they run one after the other: 1s + 1s + 1s = 3s. Using Promise.all fires all three simultaneously, so total time drops to ~1s (the slowest single call). Fix: const [user, posts, analytics] = await Promise.all([fetchUser(userId), fetchPosts(userId), fetchAnalytics(userId)]);",
    failExplanation: "The performance bug is the three sequential awaits on lines 4â€“6. Each blocks the next, so the endpoint's minimum latency is the sum of all three calls. Since none of the queries depends on another's result, they can run concurrently with Promise.all â€” dropping total time from ~3s to ~1s. This is the most common async performance mistake for junior devs.",
  },
};

export default challenge;