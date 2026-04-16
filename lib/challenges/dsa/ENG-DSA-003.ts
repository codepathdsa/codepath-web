import type { Challenge } from '../types';

// ─── ENG-DSA-003 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-003',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'API Rate Limiter — Sliding Window (Queue)',
        companies: ['Discord', 'Slack'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Deque', 'Sliding Window', 'System Design'],
        nextChallengeId: 'ENG-DSA-004',
        realWorldContext: `Discord's API team discovered that bots were exploiting the fixed-window rate limiter by sending 5,000 requests at 23:59:59 and another 5,000 at 00:00:01 — effectively getting 10,000 requests in 2 seconds while bypassing the "5,000/minute" limit. The sliding window approach fixes this by counting requests in the last 60 seconds relative to NOW, not relative to a clock boundary.`,
        desc: 'Bots are bypassing our Fixed Window rate limiter by bursting at 11:59:59 and 12:00:01. Implement a Sliding Window Log rate limiter. Each call to is_allowed(timestamp) returns True/False.',
        whyItMatters: `Rate limiting is fundamental to API security and fairness. This exact algorithm (or a variant) runs inside Stripe, Cloudflare, Discord, and virtually every production API. Understanding the tradeoffs between Fixed Window (simple, exploitable), Sliding Window Log (accurate, memory-heavy), and Token Bucket (smooth, complex) is a standard senior engineer interview topic.`,
        approach: `Store a log of timestamps for each client. When a request arrives: (1) prune timestamps older than window_size seconds, (2) if count < limit, allow and record the timestamp. The deque is ideal here because pruning old timestamps happens from the left (popleft) and new timestamps are added to the right.`,
        solution: 'Store request timestamps in a deque. On each call: pop timestamps older than (now - window). If len(deque) < max_requests, allow and append timestamp. Else, deny.',
        walkthrough: [
            "State: deque = [], limit = 3 requests per 10 seconds",
            "t=1: deque=[] (empty, prune nothing). len=0 < 3. ALLOW. deque=[1]",
            "t=5: prune nothing (5-10=-5, no entries older than -5). len=1 < 3. ALLOW. deque=[1,5]",
            "t=9: prune nothing. len=2 < 3. ALLOW. deque=[1,5,9]",
            "t=12: prune t=1 (1 <= 12-10=2). deque=[5,9]. len=2 < 3. ALLOW. deque=[5,9,12]",
            "t=14: prune t=5 (5 <= 14-10=4). deque=[9,12]. len=2 < 3. ALLOW ✓"
        ],
        hints: [
            'A fixed window resets every N seconds. A sliding window looks back exactly N seconds from NOW.',
            'Use a queue/deque to store timestamps. On each request, remove entries older than (timestamp - window_size).',
            'After pruning old entries: if len(queue) < limit, allow the request and append the timestamp. Otherwise deny it.'
        ],
        complexity: { time: 'O(n) amortized per call', space: 'O(window_size)' },
        starterCode: `from collections import deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.log: deque = deque()  # stores timestamps of allowed requests

    def is_allowed(self, timestamp: float) -> bool:
        """
        Returns True if request at 'timestamp' is within the rate limit.
        Cleans up entries older than the window automatically.
        """
        # 1. Remove timestamps outside the sliding window
        while self.log and self.log[0] <= timestamp - self.window:
            self.log.popleft()

        # 2. Check and record
        if len(self.log) < self.max_requests:
            self.log.append(timestamp)
            return True
        return False
`,
        testCases: [
            { id: 'tc1', description: 'Basic allow within limit', input: 'limiter(3, 10): is_allowed(1), is_allowed(2), is_allowed(3)', expected: 'True, True, True' },
            { id: 'tc2', description: 'Deny on 4th request', input: 'limiter(3, 10): is_allowed(1), is_allowed(2), is_allowed(3), is_allowed(4)', expected: 'True, True, True, False' },
            { id: 'tc3', description: 'Allow after window expires', input: 'limiter(2, 5): is_allowed(1), is_allowed(2), is_allowed(7)', expected: 'True, True, True' },
            { id: 'tc4', description: 'Burst at boundary exploit', input: 'limiter(3, 10): is_allowed(9), is_allowed(10), is_allowed(11), is_allowed(12)', expected: 'True, True, True, False' },
            { id: 'tc5', description: 'Single request always allowed', input: 'limiter(1, 10): is_allowed(0), is_allowed(11)', expected: 'True, True' },
        ],
    };

export default challenge;
