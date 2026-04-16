import type { Challenge } from '../types';

// ─── ENG-DSA-016 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-016',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'AWS Lambda Job Packing (DP / Knapsack)',
        companies: ['AWS', 'Vercel'],
        timeEst: '~45 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Dynamic Programming', '0/1 Knapsack'],
        nextChallengeId: 'ENG-DSA-017',
        realWorldContext: `AWS Lambda charges by RAM-seconds. Vercel's background job system packs multiple customer jobs into a single Lambda invocation to minimize cost. Given a list of jobs each with a RAM requirement and a priority score, find the optimal combination that maximizes priority without exceeding the Lambda's RAM limit. This is NP-hard in general but solvable in pseudo-polynomial time with DP.`,
        desc: 'We rent AWS Lambda instances with a maximum RAM capacity of M MB. We have a queue of background jobs, each requiring a specific amount of RAM and yielding a specific priority score. Pick the optimal subset of jobs to run on a single Lambda to maximize the priority score without exceeding M.',
        whyItMatters: `0/1 Knapsack is the canonical Dynamic Programming problem. It teaches the fundamental DP technique: defining subproblems, building a table of solutions, and deriving answers bottom-up. Variants appear in portfolio optimization, resource allocation, and cutting-stock problems. Greedy approaches famously FAIL for 0/1 Knapsack — only DP gives the optimal answer.`,
        approach: `DP table: dp[i][w] = maximum priority achievable using the first i jobs with w MB of RAM. For each job i and capacity w: (1) if job doesn't fit (cost > w), dp[i][w] = dp[i-1][w] (skip it). (2) if job fits, take the max of skipping it or including it: max(dp[i-1][w], priority[i] + dp[i-1][w-cost[i]]). The answer is dp[n][M].`,
        solution: 'This is the classic 0/1 Knapsack problem. Create a 2D DP array `dp[i][w]` representing the max priority using the first `i` jobs and `w` RAM. If `weights[i] <= w`, take `max(dp[i-1][w], values[i] + dp[i-1][w-weights[i]])`. Return `dp[n][M]`.',
        walkthrough: [
            "jobs: costs=[10,20,30], priorities=[60,100,120], max_ram=50",
            "dp[0][w] = 0 for all w (no jobs, no priority)",
            "Job1 (cost=10, pri=60): For w=10..50, dp[1][w] = max(dp[0][w], 60+dp[0][w-10]) = 60",
            "Job2 (cost=20, pri=100): dp[2][30]=max(60, 100+60)=160. dp[2][50]=max(60, 100+60)=160",
            "Job3 (cost=30, pri=120): dp[3][50]=max(160, 120+dp[2][20])=max(160, 120+100)=220",
            "Answer: dp[3][50] = 220 (jobs 2+3: 20+30=50 RAM, 100+120=220 priority) ✓"
        ],
        hints: [
            'A greedy approach (sorting by priority/RAM ratio) will fail for 0/1 packing. You must use Dynamic Programming.',
            'Create a 2D array: `dp[jobs + 1][capacity + 1]` initialized to 0.',
            'For each job, you have two choices: include it (if it fits) or exclude it. Take the max of both options.'
        ],
        complexity: { time: 'O(n * M)', space: 'O(n * M)' },
        starterCode: `def maximize_priority(ram_costs: list[int], priorities: list[int], max_ram: int) -> int:
    """
    ram_costs: MB required for each job
    priorities: Score for completing the job  
    max_ram: Capacity of the Lambda instance
    Returns the maximum priority score achievable.
    
    Example: costs=[10,20,30], priorities=[60,100,120], max_ram=50 → 220
    """
    n = len(ram_costs)
    # dp[i][w] = max priority using first i jobs with w RAM capacity
    dp = [[0] * (max_ram + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        cost = ram_costs[i - 1]
        score = priorities[i - 1]
        
        for w in range(1, max_ram + 1):
            if cost <= w:
                # Max of: skip this job, or include it
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - cost] + score)
            else:
                # Job doesn't fit, carry over previous best
                dp[i][w] = dp[i - 1][w]
                
    return dp[n][max_ram]
`,
        testCases: [
            { id: 'tc1', description: 'Standard packing', input: 'costs=[10, 20, 30], priorities=[60, 100, 120], max_ram=50', expected: '220 (Jobs 2 and 3)' },
            { id: 'tc2', description: 'Item too big', input: 'costs=[100], priorities=[500], max_ram=50', expected: '0' },
            { id: 'tc3', description: 'Greedy fails here', input: 'costs=[5, 5, 5], priorities=[10, 10, 10], max_ram=10', expected: '20' },
            { id: 'tc4', description: 'Exact fit', input: 'costs=[1, 2, 3], priorities=[1, 2, 3], max_ram=6', expected: '6' },
            { id: 'tc5', description: 'Empty queues', input: 'costs=[], priorities=[], max_ram=10', expected: '0' },
        ],
    };

export default challenge;
