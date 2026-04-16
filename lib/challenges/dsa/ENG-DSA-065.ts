import type { Challenge } from '../types';

// ─── ENG-DSA-065 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-065',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Real-time API Analytics (Queue/Deque)',
        companies: ['Stripe', 'Datadog'],
        timeEst: '~25 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Design', 'Queue', 'Streaming'],
        nextChallengeId: 'ENG-DSA-066',
        realWorldContext: `API Gateways like Stripe must display "Requests in the last 5 minutes" on their analytics dashboards. Storing every timestamp forever causes Out-Of-Memory crashes. Using a sliding queue dynamically prunes data older than 300 seconds, maintaining a strict upper memory bound.`,
        desc: 'Design a HitCounter class that tracks the number of API hits. It should support `hit(timestamp)` to record a hit, and `get_hits(timestamp)` to return the total hits in the past 5 minutes (300 seconds). Timestamps are strictly increasing.',
        whyItMatters: `Design Hit Counter bridges Data Structures and System Design. Answering it with an array is fine, but using a Queue/Deque to prune stale data proves you understand memory limits. For scaling to massive concurrent traffic, grouping hits into \`[timestamp, count]\` buckets is the senior-level optimization.`,
        approach: `Use a Queue. When \`hit(t)\` is called, push \`t\` to the queue. When \`get_hits(t)\` is called, peek at the front of the queue. If the front timestamp is <= \`t - 300\`, pop it out. Repeat until the front is within the 300-second window. The number of valid hits is simply the size of the queue.`,
        solution: 'Store incoming timestamps in a deque. On every read request, pop elements from the left of the deque if they are older than timestamp - 300. Return length of deque.',
        walkthrough: [
            "hit(1), hit(2), hit(300). Queue=[1, 2, 300]",
            "get_hits(300): window is (0, 300]. Queue has 1,2,300. length=3.",
            "hit(301). Queue=[1, 2, 300, 301]",
            "get_hits(302): window is (2, 302]. Front is 1. 1 <= 302-300? Yes, Pop 1. Front is 2. 2 <= 2? Yes, Pop 2.",
            "Queue now=[300, 301]. length=2. ✓"
        ],
        hints: [
            'A fixed window of 300 seconds means you only care about events where `event_time > current_time - 300`.',
            'Since timestamps arrive in order, the oldest events are always at the start of your data structure.',
            'Use a double-ended queue (deque). Pop from the left to remove expired timestamps.'
        ],
        complexity: { time: 'O(1) amortized', space: 'O(W) where W is max hits in 300 seconds' },
        starterCode: `from collections import deque

class HitCounter:
    def __init__(self):
        # Stores incoming timestamps
        self.hits = deque()

    def hit(self, timestamp: int) -> None:
        """
        Record a hit at the given timestamp (in seconds).
        """
        self.hits.append(timestamp)

    def get_hits(self, timestamp: int) -> int:
        """
        Return the number of hits in the past 5 minutes (300 seconds).
        """
        # Prune timestamps older than 5 minutes
        while self.hits and self.hits[0] <= timestamp - 300:
            self.hits.popleft()
            
        # The remaining elements fall within the 300-second window
        return len(self.hits)
`,
        testCases: [
            { id: 'tc1', description: 'All in window', input: 'hit(1), hit(2), get_hits(4)', expected: '2' },
            { id: 'tc2', description: 'Exactly on boundary', input: 'hit(1), get_hits(300), get_hits(301)', expected: '1 at 300, 0 at 301' },
            { id: 'tc3', description: 'Rolling window', input: 'hit(100), hit(200), hit(300), get_hits(450)', expected: '2 (200 and 300)' },
            { id: 'tc4', description: 'Burst traffic', input: 'hit(1), hit(1), hit(1), get_hits(2)', expected: '3' },
            { id: 'tc5', description: 'Massive skip', input: 'hit(1), get_hits(1000)', expected: '0' },
        ],
    };

export default challenge;
