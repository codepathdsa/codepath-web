import type { Challenge } from '../types';

// ─── ENG-DSA-070 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-070',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Server Cluster Maintenance (1D DP)',
                    companies: ['Oracle', 'MongoDB'],
                        timeEst: '~30 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Dynamic Programming', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-071',
                                            realWorldContext: `A database cluster distributes shards sequentially across nodes. Taking a node down for maintenance removes its capacity. To avoid a catastrophic loss of quorum, you cannot take down two directly adjacent nodes simultaneously. You want to maximize the total RAM capacity taken down for maintenance during the window.`,
                                                desc: 'Given an integer array `capacity` representing the RAM of sequential servers, determine the maximum capacity you can take offline tonight without taking down two adjacent servers.',
                                                    whyItMatters: `This is the classic "House Robber" problem. It is the perfect introduction to 1D Dynamic Programming. It forces the shift from greedy thinking (which fails here) to state-based thinking: "At node i, what is the optimal choice based on my decisions at i-1 and i-2?".`,
                                                        approach: `Let dp[i] be the maximum capacity we can take down using the first i servers. For server i, we have a choice: 1) Skip it. Our total remains dp[i-1]. 2) Take it down. We can't use server i-1, so our total is capacity[i] + dp[i-2]. The recurrence relation is: dp[i] = max(dp[i-1], capacity[i] + dp[i-2]). Since we only look back 2 steps, we can optimize space to O(1) by keeping just two variables.`,
                                                            solution: 'Iterate through the array keeping track of `rob1` (max up to i-2) and `rob2` (max up to i-1). Current max is `max(rob1 + current, rob2)`. Shift variables forward.',
                                                                walkthrough: [
                                                                    "capacity = [2, 7, 9, 3, 1]",
                                                                    "prev2=0, prev1=0",
                                                                    "i=0 (2): curr = max(0+2, 0) = 2. prev2=0, prev1=2.",
                                                                    "i=1 (7): curr = max(0+7, 2) = 7. prev2=2, prev1=7.",
                                                                    "i=2 (9): curr = max(2+9, 7) = 11. prev2=7, prev1=11.",
                                                                    "i=3 (3): curr = max(7+3, 11) = 11. prev2=11, prev1=11.",
                                                                    "i=4 (1): curr = max(11+1, 11) = 12. prev2=11, prev1=12.",
                                                                    "Result: 12 ✓ (Take 7 and 1? Wait, 2 + 9 + 1 = 12. Nodes 0, 2, 4)"
                                                                ],
                                                                    hints: [
                                                                        'A Greedy approach (picking evens vs odds) fails for arrays like[2, 1, 1, 2].',
                                                                        'At every server, you have a choice: include it (and add max from 2 steps back), or exclude it (keep max from 1 step back).',
                                                                        'You only need two variables to keep track of the history, reducing O(N) space to O(1).'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(1)' },
    starterCode: `def max_maintenance_capacity(capacity: list[int]) -> int:
    """
    Returns the max capacity that can be safely taken offline.
    Adjacent servers cannot be taken down.
    """
    if not capacity:
        return 0
        
    prev2 = 0  # Max capacity up to i-2
    prev1 = 0  # Max capacity up to i-1
    
    for cap in capacity:
        # Take current node + max from i-2, OR skip current node and keep max from i-1
        current_max = max(prev2 + cap, prev1)
        
        # Shift window forward
        prev2 = prev1
        prev1 = current_max
        
    return prev1
`,
        testCases: [
            { id: 'tc1', description: 'Standard alternating', input: 'capacity=[1,2,3,1]', expected: '4 (1 + 3)' },
            { id: 'tc2', description: 'Greedy fails here', input: 'capacity=[2,7,9,3,1]', expected: '12 (2 + 9 + 1)' },
            { id: 'tc3', description: 'Evens vs Odds trap', input: 'capacity=[2,1,1,2]', expected: '4 (2 + 2)' },
            { id: 'tc4', description: 'Single server', input: 'capacity=[5]', expected: '5' },
            { id: 'tc5', description: 'All zeros', input: 'capacity=[0,0,0]', expected: '0' },
        ],
    };

export default challenge;
